import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { namaInstitusi, namaContact, noHp, sourceId, serviceId, assignedToId, status, catatan } = body;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        namaInstitusi: namaInstitusi?.trim() || undefined,
        namaContact: namaContact ?? undefined,
        noHp: noHp ?? undefined,
        sourceId: sourceId || null,
        serviceId: serviceId || null,
        assignedToId: assignedToId || null,
        status: status ?? undefined,
        catatan: catatan ?? undefined,
      },
      include: {
        source: { select: { id: true, nama: true } },
        service: { select: { id: true, nama: true, colorHex: true } },
        assignedTo: { select: { id: true, nama: true, avatarInitial: true } },
      },
    });

    return NextResponse.json({ lead });
  } catch (error: unknown) {
    console.error('[LEAD PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate lead' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('[LEAD DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus lead' }, { status: 500 });
  }
}
