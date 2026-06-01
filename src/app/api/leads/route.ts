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
              { namaInstitusi: { contains: search } },
              { namaContact: { contains: search } },
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

    const [sources, services, users, clients] = await Promise.all([
      prisma.leadSource.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } }),
      prisma.service.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } }),
      prisma.user.findMany({ where: { isActive: true }, select: { id: true, nama: true, avatarInitial: true }, orderBy: { nama: 'asc' } }),
      prisma.client.findMany({
        select: { id: true, namaKlien: true, namaContact: true, noHp: true, email: true, sourceId: true, serviceId: true },
        orderBy: { namaKlien: 'asc' },
      }),
    ]);

    return NextResponse.json({ leads, meta: { sources, services, users, clients } });
  } catch (error: unknown) {
    console.error('[LEADS GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaInstitusi, namaContact, noHp, sourceId, serviceId, assignedToId, status, catatan, clientId } = body;

    if (!namaInstitusi?.trim()) {
      return NextResponse.json({ error: 'Nama institusi wajib diisi' }, { status: 400 });
    }

    let linkedClientId = clientId || null;

    // Jika tidak memilih client existing, buat client baru otomatis
    if (!linkedClientId) {
      const newClient = await prisma.client.create({
        data: {
          namaKlien: namaInstitusi.trim(),
          namaContact: namaContact || null,
          noHp: noHp || null,
          sourceId: sourceId || null,
          serviceId: serviceId || null,
          status: 'unqualified',
        },
      });
      linkedClientId = newClient.id;
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
        clientId: linkedClientId,
      },
      include: {
        source: { select: { id: true, nama: true } },
        service: { select: { id: true, nama: true, colorHex: true } },
        assignedTo: { select: { id: true, nama: true, avatarInitial: true } },
      },
    });

    // Auto-create deal if lead is qualified
    const leadStatus = status || 'baru';
    if (leadStatus === 'qualified' && linkedClientId) {
      const existingDeal = await prisma.deal.findFirst({
        where: { clientId: linkedClientId, serviceId: serviceId || null, dealStatus: { notIn: ['archived', 'won'] } },
      });
      if (!existingDeal) {
        const firstStage = await prisma.pipelineStage.findFirst({
          where: { isTerminal: false },
          orderBy: { urutan: 'asc' },
        });
        if (firstStage) {
          await prisma.deal.create({
            data: {
              clientId: linkedClientId,
              serviceId: serviceId || null,
              assignedAeId: assignedToId || null,
              stageId: firstStage.id,
              probability: firstStage.probabilityDefault,
              namaProject: namaInstitusi.trim(),
              notes: `Auto dari lead: ${namaInstitusi.trim()}`,
            },
          });
        }
      }
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error: unknown) {
    console.error('[LEADS POST]', error);
    return NextResponse.json({ error: 'Gagal membuat lead' }, { status: 500 });
  }
}
