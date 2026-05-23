import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({ orderBy: { nama: 'asc' } });
    return NextResponse.json({ cities });
  } catch (error: unknown) {
    console.error('[CITIES GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nama, provinsi } = await req.json();
    if (!nama) return NextResponse.json({ error: 'Nama kota wajib diisi' }, { status: 400 });

    const city = await prisma.city.create({
      data: { nama, provinsi: provinsi || null },
    });
    return NextResponse.json({ success: true, city });
  } catch (error: unknown) {
    console.error('[CITIES POST]', error);
    return NextResponse.json({ error: 'Gagal menambah kota' }, { status: 500 });
  }
}
