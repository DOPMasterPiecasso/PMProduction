import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const doc = await prisma.dealDocument.findUnique({ where: { id } });
    if (!doc) return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 });

    await prisma.dealDocument.delete({ where: { id } });

    if (doc.fileUrl) {
      const filename = doc.fileUrl.replace('/uploads/deals/', '');
      const filepath = join(process.cwd(), 'public', 'uploads', 'deals', filename);
      try { await unlink(filepath); } catch { /* file already missing */ }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[DELETE DOCUMENT]', error);
    return NextResponse.json({ error: 'Gagal menghapus dokumen' }, { status: 500 });
  }
}
