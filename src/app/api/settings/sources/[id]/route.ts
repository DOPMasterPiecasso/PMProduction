import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { nama, isActive } = await req.json();

    const data: Record<string, unknown> = {};
    if (nama !== undefined) data.nama = nama.trim();
    if (isActive !== undefined) data.isActive = isActive;

    const source = await prisma.leadSource.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, source });
  } catch (error: unknown) {
    console.error('[SOURCE PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate sumber' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.leadSource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[SOURCE DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus sumber' }, { status: 500 });
  }
}
