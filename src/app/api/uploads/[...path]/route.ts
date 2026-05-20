import { NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  zip: 'application/zip',
  txt: 'text/plain',
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;

    // Sanitize: cegah path traversal (../../etc)
    const cleanSegments = segments.map((s) => path.basename(s));
    const relativePath = cleanSegments.join(path.sep);

    const absolutePath = path.join(process.cwd(), 'public', 'uploads', relativePath);

    // Pastikan path masih di dalam public/uploads
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    if (!absolutePath.startsWith(uploadsRoot)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fileStat = await stat(absolutePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const buffer = await readFile(absolutePath);
    const ext = absolutePath.split('.').pop()?.toLowerCase() || '';
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': 'inline',
      },
    });
  } catch (err: unknown) {
    const isNotFound =
      err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT';
    if (isNotFound) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });
    }
    console.error('[UPLOADS SERVE]', err);
    return NextResponse.json({ error: 'Gagal membaca file' }, { status: 500 });
  }
}
