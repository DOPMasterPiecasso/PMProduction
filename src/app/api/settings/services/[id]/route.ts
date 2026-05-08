import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.nama !== undefined) data.nama = body.nama;
    if (body.deskripsi !== undefined) data.deskripsi = body.deskripsi;
    if (body.colorHex !== undefined) data.colorHex = body.colorHex;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const svc = await prisma.service.update({ where: { id }, data });
    return NextResponse.json({ success: true, service: svc });
  } catch (error) {
    console.error('[SERVICES PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate layanan' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SERVICES DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus layanan' }, { status: 500 });
  }
}
