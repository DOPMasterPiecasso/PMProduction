import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.nama !== undefined) data.nama = body.nama;
    if (body.email !== undefined) data.email = body.email;
    if (body.role !== undefined) data.role = body.role;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const user = await prisma.user.update({
      where: { id }, data,
      select: { id: true, nama: true, email: true, role: true, isActive: true },
    });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('[USERS PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate user' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.role === 'owner') return NextResponse.json({ error: 'Owner tidak dapat dihapus' }, { status: 400 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[USERS DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 });
  }
}
