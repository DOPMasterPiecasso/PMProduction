import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [clients, services, stages, aes] = await Promise.all([
      prisma.client.findMany({
        select: { id: true, namaKlien: true },
        orderBy: { namaKlien: 'asc' },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        select: { id: true, nama: true, colorHex: true },
        orderBy: { nama: 'asc' },
      }),
      prisma.pipelineStage.findMany({
        select: { id: true, nama: true, urutan: true, probabilityDefault: true, isTerminal: true },
        orderBy: { urutan: 'asc' },
      }),
      prisma.user.findMany({
        where: { isActive: true, role: { in: ['ae', 'manager', 'owner'] } },
        select: { id: true, nama: true, avatarInitial: true },
        orderBy: { nama: 'asc' },
      }),
    ]);

    return NextResponse.json({ clients, services, stages, aes });
  } catch (error: unknown) {
    console.error('[PIPELINE META GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}
