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
    const dealId = data.get('dealId') as string;

    if (!file || !dealId) {
      return NextResponse.json({ error: 'File dan Deal ID wajib diisi' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/deals
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'deals');
    const filepath = join(uploadDir, filename);

    // Ensure directory exists
    try {
      const { mkdir } = require('fs/promises');
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // ignore
    }

    // Write file to filesystem
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/deals/${filename}`;
    const fileType = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';

    // Create record in database
    const document = await prisma.dealDocument.create({
      data: {
        dealId,
        fileName: file.name,
        fileType,
        fileSizeBytes: file.size,
        fileUrl,
        uploadedById: userId,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 });
  }
}
