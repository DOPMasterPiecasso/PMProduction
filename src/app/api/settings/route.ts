import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [users, services, systemSettings] = await Promise.all([
      prisma.user.findMany({ select: { id: true, nama: true, email: true, role: true, isActive: true }, orderBy: { role: 'desc' } }),
      prisma.service.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.systemSetting.findMany(),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of systemSettings) settingsMap[s.key] = s.value;

    return NextResponse.json({ users, services, systemSettings: settingsMap });
  } catch (error) {
    console.error('[SETTINGS GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: 'Key wajib diisi' }, { status: 400 });

    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SETTINGS PATCH]', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 });
  }
}
