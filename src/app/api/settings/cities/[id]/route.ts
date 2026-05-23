import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.nama !== undefined) data.nama = body.nama;
    if (body.provinsi !== undefined) data.provinsi = body.provinsi;

    const city = await prisma.city.update({ where: { id }, data });
    return NextResponse.json({ success: true, city });
  } catch (error: unknown) {
    console.error('[CITIES PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate kota' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.city.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[CITIES DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus kota' }, { status: 500 });
  }
}
