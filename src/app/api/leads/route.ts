import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';

  try {
    const leads = await prisma.lead.findMany({
      where: search
        ? {
            OR: [
              { namaInstitusi: { contains: search, mode: 'insensitive' } },
              { namaContact: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        source: { select: { id: true, nama: true } },
        service: { select: { id: true, nama: true, colorHex: true } },
        assignedTo: { select: { id: true, nama: true, avatarInitial: true } },
      },
      orderBy: { tanggalMasuk: 'desc' },
    });

    const [sources, services, users] = await Promise.all([
      prisma.leadSource.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } }),
      prisma.service.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } }),
      prisma.user.findMany({ where: { isActive: true }, select: { id: true, nama: true, avatarInitial: true }, orderBy: { nama: 'asc' } }),
    ]);

    return NextResponse.json({ leads, meta: { sources, services, users } });
  } catch (error: unknown) {
    console.error('[LEADS GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaInstitusi, namaContact, noHp, sourceId, serviceId, assignedToId, status, catatan } = body;

    if (!namaInstitusi?.trim()) {
      return NextResponse.json({ error: 'Nama institusi wajib diisi' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        namaInstitusi: namaInstitusi.trim(),
        namaContact: namaContact || null,
        noHp: noHp || null,
        sourceId: sourceId || null,
        serviceId: serviceId || null,
        assignedToId: assignedToId || null,
        status: status || 'baru',
        catatan: catatan || null,
      },
      include: {
        source: { select: { id: true, nama: true } },
        service: { select: { id: true, nama: true, colorHex: true } },
        assignedTo: { select: { id: true, nama: true, avatarInitial: true } },
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error: unknown) {
    console.error('[LEADS POST]', error);
    return NextResponse.json({ error: 'Gagal membuat lead' }, { status: 500 });
  }
}
