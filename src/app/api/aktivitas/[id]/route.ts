import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { clientId, dealId, typeId, picId, tanggalAktivitas, catatan, nextAction, nextActionDate, isDone, fileUrl, fileName } = body;

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        clientId: clientId || null,
        dealId: dealId || null,
        typeId: typeId ?? undefined,
        picId: picId || null,
        tanggalAktivitas: tanggalAktivitas ? new Date(tanggalAktivitas) : undefined,
        catatan: catatan ?? undefined,
        nextAction: nextAction ?? undefined,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        isDone: isDone ?? undefined,
        fileUrl: fileUrl ?? undefined,
        fileName: fileName ?? undefined,
      },
      include: {
        type: { select: { id: true, nama: true, colorHex: true } },
        pic: { select: { id: true, nama: true, avatarInitial: true } },
        client: { select: { id: true, namaKlien: true } },
      },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('[AKTIVITAS PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate aktivitas' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[AKTIVITAS DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus aktivitas' }, { status: 500 });
  }
}
