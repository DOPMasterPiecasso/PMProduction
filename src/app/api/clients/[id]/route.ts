import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/clients/[id] — update client
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { namaKlien, clientTypeId, kotaId, namaContact, noHp, email, sourceId, serviceId, tags, status, nextFuDate, catatan } = body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        namaKlien: namaKlien?.trim() || undefined,
        clientTypeId: clientTypeId || null,
        kotaId: kotaId || null,
        namaContact: namaContact ?? undefined,
        noHp: noHp ?? undefined,
        email: email ?? undefined,
        sourceId: sourceId || null,
        serviceId: serviceId || null,
        tags: tags ?? undefined,
        status: status ?? undefined,
        nextFuDate: nextFuDate ? new Date(nextFuDate) : null,
        catatan: catatan ?? undefined,
      },
      include: {
        clientType: { select: { id: true, nama: true } },
        kota: { select: { id: true, nama: true } },
        service: { select: { id: true, nama: true, colorHex: true } },
      },
    });

    return NextResponse.json({ client });
  } catch (error: unknown) {
    console.error('[CLIENT PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate klien' }, { status: 500 });
  }
}

// DELETE /api/clients/[id] — delete client
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('[CLIENT DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus klien' }, { status: 500 });
  }
}
