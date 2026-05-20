import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'File wajib diisi' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'aktivitas');
    const filepath = join(uploadDir, filename);

    try {
      const { mkdir } = require('fs/promises');
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    await writeFile(filepath, buffer);

    const fileUrl = `/api/uploads/aktivitas/${filename}`;

    return NextResponse.json({ success: true, fileUrl, fileName: file.name });
  } catch (error: unknown) {
    console.error('[AKTIVITAS UPLOAD]', error);
    return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 });
  }
}
