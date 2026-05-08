import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { notes, dealStatus, deadline, stageId, nilai } = body;

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        notes: notes ?? undefined,
        dealStatus: dealStatus ?? undefined,
        deadline: deadline ? new Date(deadline) : deadline === null ? null : undefined,
        stageId: stageId ?? undefined,
        nilai: nilai !== undefined ? Number(nilai) : undefined,
      },
      include: {
        client: { select: { namaKlien: true } },
        service: { select: { nama: true, colorHex: true } },
        assignedAe: { select: { nama: true, avatarInitial: true } },
        stage: { select: { nama: true, urutan: true, colorHex: true } },
        documents: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true, fileUrl: true } },
      },
    });

    return NextResponse.json({ deal });
  } catch (error: unknown) {
    console.error('[DEAL PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate deal' }, { status: 500 });
  }
}
