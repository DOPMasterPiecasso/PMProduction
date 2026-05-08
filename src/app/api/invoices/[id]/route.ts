import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const inv = await prisma.invoice.findUnique({ where: { id } });
    if (!inv) return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });

    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[DELETE INVOICE]', error);
    return NextResponse.json({ error: 'Gagal menghapus invoice' }, { status: 500 });
  }
}
