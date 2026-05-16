import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  try {
    let fileUrl: string | null = null;

    const invDoc = await prisma.invoiceDocument.findUnique({ where: { id: docId } });
    if (invDoc) {
      if (invDoc.invoiceId !== id) return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 });
      fileUrl = invDoc.fileUrl;
      await prisma.invoiceDocument.delete({ where: { id: docId } });
      if (fileUrl) {
        const filePath = path.join(process.cwd(), 'public', fileUrl);
        try { await unlink(filePath); } catch {}
      }
      return NextResponse.json({ success: true });
    }

    const termDoc = await prisma.invoiceTermDocument.findUnique({
      where: { id: docId },
      include: { term: true },
    });
    if (termDoc) {
      if (termDoc.term.invoiceId !== id) return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 });
      fileUrl = termDoc.fileUrl;
      await prisma.invoiceTermDocument.delete({ where: { id: docId } });
      if (fileUrl) {
        const filePath = path.join(process.cwd(), 'public', fileUrl);
        try { await unlink(filePath); } catch {}
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 });
  } catch (error: unknown) {
    console.error('[DELETE INVOICE DOC]', error);
    return NextResponse.json({ error: 'Gagal menghapus dokumen' }, { status: 500 });
  }
}