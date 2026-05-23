import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.nama !== undefined) data.nama = body.nama;
    if (body.colorHex !== undefined) data.colorHex = body.colorHex;
    if (body.icon !== undefined) data.icon = body.icon;

    const type = await prisma.activityType.update({ where: { id }, data });
    return NextResponse.json({ success: true, activityType: type });
  } catch (error: unknown) {
    console.error('[ACTIVITY-TYPES PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate tipe aktivitas' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.activityType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[ACTIVITY-TYPES DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus tipe aktivitas' }, { status: 500 });
  }
}
