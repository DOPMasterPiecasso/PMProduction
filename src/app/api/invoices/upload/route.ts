import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const invoiceId = formData.get('invoiceId') as string | null;
    const termId = formData.get('termId') as string | null;

    if (!file || !invoiceId) {
      return NextResponse.json({ error: 'File dan invoiceId wajib diisi' }, { status: 400 });
    }

    const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!inv) return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });

    if (termId) {
      const term = await prisma.invoiceTerm.findUnique({ where: { id: termId } });
      if (!term || term.invoiceId !== invoiceId) return NextResponse.json({ error: 'Termin tidak ditemukan' }, { status: 404 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (ext !== 'pdf') {
      return NextResponse.json({ error: 'Hanya file PDF yang diperbolehkan' }, { status: 400 });
    }
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'invoices');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/invoices/${fileName}`;

    let doc;
    if (termId) {
      doc = await prisma.invoiceTermDocument.create({
        data: { termId, fileName: file.name, fileType: ext.toUpperCase(), fileSizeBytes: file.size, fileUrl },
      });
    } else {
      doc = await prisma.invoiceDocument.create({
        data: { invoiceId, fileName: file.name, fileType: ext.toUpperCase(), fileSizeBytes: file.size, fileUrl },
      });
    }

    return NextResponse.json({ success: true, document: doc });
  } catch (error: unknown) {
    console.error('[INVOICE UPLOAD]', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Gagal upload file: ${msg}` }, { status: 500 });
  }
}
