import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const serviceId = searchParams.get('serviceId') ?? '';

  try {
    const where: Record<string, unknown> = {};
    where.dealStatus = { not: 'archived' };

    if (search) {
      where.client = { namaKlien: { contains: search } };
    }
    if (serviceId) where.serviceId = serviceId;

    const deals = await prisma.deal.findMany({
      where,
      include: {
        client: { select: { id: true, namaKlien: true, namaContact: true, noHp: true, kota: { select: { nama: true } } } },
        service: { select: { id: true, nama: true, colorHex: true } },
        assignedAe: { select: { id: true, nama: true, avatarInitial: true } },
        stage: { select: { id: true, nama: true, urutan: true, colorHex: true } },
        documents: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true, fileUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Monthly aggregation for chart
    const monthlyAgg = await prisma.$queryRaw<{ bulan: string; total: number; count: bigint }[]>`
      SELECT
        DATE_FORMAT(tanggalMasuk, '%Y-%m') as bulan,
        SUM(nilai) as total,
        COUNT(*) as count
      FROM deals
      WHERE dealStatus IN ('won', 'active')
        AND tanggalMasuk >= NOW() - INTERVAL 12 MONTH
      GROUP BY bulan
      ORDER BY bulan ASC
    `;

    const monthlyData = monthlyAgg.map((r: { bulan: string; total: number; count: bigint }) => ({
      bulan: r.bulan,
      total: Number(r.total),
      count: Number(r.count),
    }));

    const [services, users] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } }),
      prisma.user.findMany({ where: { isActive: true }, select: { id: true, nama: true }, orderBy: { nama: 'asc' } }),
    ]);

    // Stats
    const totalNilai = deals.reduce((sum: number, d: { id: string; clientId: string; serviceId: string | null; assignedAeId: string | null; stageId: string | null; nilai: number; namaProject: string | null; probability: number; isHot: boolean; tanggalMasuk: Date; deadline: Date | null; notes: string | null; lostReason: string | null; dealStatus: string; createdAt: Date; updatedAt: Date }) => sum + d.nilai, 0);
    const wonDeals = deals.filter((d: { dealStatus: string }) => d.dealStatus === 'won');

    return NextResponse.json({
      deals,
      monthlyData,
      meta: { services, users },
      stats: {
        totalDeals: deals.length,
        totalNilai,
        wonCount: wonDeals.length,
        wonNilai: wonDeals.reduce((sum: number, d: { nilai: number }) => sum + d.nilai, 0),
      },
    });
  } catch (error: unknown) {
    console.error('[DEALS GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}
