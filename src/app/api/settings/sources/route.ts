import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { nama } = await req.json();
    if (!nama?.trim()) return NextResponse.json({ error: 'Nama sumber wajib diisi' }, { status: 400 });

    const source = await prisma.leadSource.create({
      data: { nama: nama.trim(), isActive: true },
    });
    return NextResponse.json({ success: true, source });
  } catch (error: unknown) {
    console.error('[SOURCES POST]', error);
    return NextResponse.json({ error: 'Gagal menambah sumber' }, { status: 500 });
  }
}
