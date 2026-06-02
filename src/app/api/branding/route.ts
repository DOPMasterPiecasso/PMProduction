import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['studio_name', 'logo_url', 'favicon_url'] } },
    });
    const map: Record<string, string> = { studio_name: 'CreativeOS' };
    for (const s of settings as { key: string; value: string }[]) map[s.key] = s.value;
    return NextResponse.json({
      studio_name: map.studio_name,
      logo_url: map.logo_url || null,
      favicon_url: map.favicon_url || null,
    });
  } catch {
    return NextResponse.json({ studio_name: 'CreativeOS', logo_url: null, favicon_url: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file || !type || !['logo', 'favicon'].includes(type)) {
      return NextResponse.json({ error: 'File dan type (logo/favicon) wajib diisi' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${type}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'branding');
    const filepath = join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filepath, buffer);

    const fileUrl = `/api/uploads/branding/${filename}`;

    await prisma.systemSetting.upsert({
      where: { key: `${type}_url` },
      update: { value: fileUrl },
      create: { key: `${type}_url`, value: fileUrl },
    });

    return NextResponse.json({ url: fileUrl });
  } catch (error: unknown) {
    console.error('[BRANDING POST]', error);
    return NextResponse.json({ error: 'Gagal upload' }, { status: 500 });
  }
}
