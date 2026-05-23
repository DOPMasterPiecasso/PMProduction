import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const types = await prisma.activityType.findMany({ orderBy: { nama: 'asc' } });
    return NextResponse.json({ activityTypes: types });
  } catch (error: unknown) {
    console.error('[ACTIVITY-TYPES GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nama, colorHex, icon } = await req.json();
    if (!nama) return NextResponse.json({ error: 'Nama tipe wajib diisi' }, { status: 400 });

    const type = await prisma.activityType.create({
      data: { nama, colorHex: colorHex || '#2563EB', icon: icon || null },
    });
    return NextResponse.json({ success: true, activityType: type });
  } catch (error: unknown) {
    console.error('[ACTIVITY-TYPES POST]', error);
    return NextResponse.json({ error: 'Gagal menambah tipe aktivitas' }, { status: 500 });
  }
}
