import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/settings/services - add new service
export async function POST(req: Request) {
  try {
    const { nama, deskripsi, colorHex } = await req.json();
    if (!nama) return NextResponse.json({ error: 'Nama layanan wajib diisi' }, { status: 400 });

    const svc = await prisma.service.create({
      data: { nama, deskripsi: deskripsi || '', colorHex: colorHex || '#6B7280', isActive: true },
    });
    return NextResponse.json({ success: true, service: svc });
  } catch (error: unknown) {
    console.error('[SERVICES POST]', error);
    return NextResponse.json({ error: 'Gagal menambah layanan' }, { status: 500 });
  }
}
