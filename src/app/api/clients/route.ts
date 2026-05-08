import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients — list all clients with relations
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const type = searchParams.get('type') ?? '';
  const kota = searchParams.get('kota') ?? '';
  const serviceId = searchParams.get('serviceId') ?? '';

  try {
    const clients = await prisma.client.findMany({
      where: {
        AND: [
          search ? { namaKlien: { contains: search, mode: 'insensitive' } } : {},
          status ? { status } : {},
          type ? { clientType: { nama: type } } : {},
          kota ? { kota: { nama: kota } } : {},
          serviceId ? { serviceId } : {},
        ],
      },
      include: {
        clientType: { select: { id: true, nama: true } },
        kota: { select: { id: true, nama: true } },
        source: { select: { id: true, nama: true } },
        service: { select: { id: true, nama: true, colorHex: true } },
      },
      orderBy: { namaKlien: 'asc' },
    });

    const [clientTypes, cities, sources, services] = await Promise.all([
      prisma.clientType.findMany({ orderBy: { nama: 'asc' } }),
      prisma.city.findMany({ orderBy: { nama: 'asc' } }),
      prisma.leadSource.findMany({ orderBy: { nama: 'asc' } }),
      prisma.service.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } }),
    ]);

    return NextResponse.json({ clients, meta: { clientTypes, cities, sources, services } });
  } catch (error: unknown) {
    console.error('[CLIENTS GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

// POST /api/clients — create new client
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaKlien, clientTypeId, kotaId, namaContact, noHp, email, sourceId, serviceId, tags, status, nextFuDate, catatan } = body;

    if (!namaKlien?.trim()) return NextResponse.json({ error: 'Nama klien wajib diisi' }, { status: 400 });

    const client = await prisma.client.create({
      data: {
        namaKlien: namaKlien.trim(),
        clientTypeId: clientTypeId || null,
        kotaId: kotaId || null,
        namaContact: namaContact || null,
        noHp: noHp || null,
        email: email || null,
        sourceId: sourceId || null,
        serviceId: serviceId || null,
        tags: tags || null,
        status: status || 'unqualified',
        nextFuDate: nextFuDate ? new Date(nextFuDate) : null,
        catatan: catatan || null,
      },
      include: {
        clientType: { select: { id: true, nama: true } },
        kota: { select: { id: true, nama: true } },
        service: { select: { id: true, nama: true, colorHex: true } },
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error: unknown) {
    console.error('[CLIENTS POST]', error);
    return NextResponse.json({ error: 'Gagal membuat klien' }, { status: 500 });
  }
}
