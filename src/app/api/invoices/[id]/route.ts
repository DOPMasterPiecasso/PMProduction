import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CLIENT_SELECT_WITH_ACCESS = { namaKlien: true, namaContact: true, noHp: true, email: true, invoiceAccessCode: true } as const;
const CLIENT_SELECT_WITHOUT_ACCESS = { namaKlien: true, namaContact: true, noHp: true, email: true } as const;

function isColumnNotFound(err: unknown): boolean {
  return err instanceof Error && err.message.includes('does not exist in the current database');
}

// GET /api/invoices/[id] — public invoice detail
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: { select: CLIENT_SELECT_WITH_ACCESS },
        documents: { orderBy: { uploadedAt: 'desc' } },
        terms: {
          orderBy: { terminKe: 'asc' },
          include: { documents: { orderBy: { uploadedAt: 'desc' } } },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }

    const hasAccessCode = !!invoice.client.invoiceAccessCode;

    const { invoiceAccessCode, ...clientSafe } = invoice.client;

    return NextResponse.json({
      hasAccessCode,
      invoice: { ...invoice, client: clientSafe },
    });
  } catch (error: unknown) {
    // Fallback if invoiceAccessCode column not yet visible to adapter
    if (isColumnNotFound(error)) {
      const { id } = await params;
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: { select: CLIENT_SELECT_WITHOUT_ACCESS },
          documents: { orderBy: { uploadedAt: 'desc' } },
          terms: {
            orderBy: { terminKe: 'asc' },
            include: { documents: { orderBy: { uploadedAt: 'desc' } } },
          },
        },
      });
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ hasAccessCode: false, invoice });
    }
    console.error('[INVOICE GET]', error);
    return NextResponse.json({ error: 'Gagal memuat invoice' }, { status: 500 });
  }
}

// POST /api/invoices/[id] — verify invoice access code
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { code } = await req.json();

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, error: 'Kode akses wajib diisi' }, { status: 400 });
    }

    // Raw query bypasses adapter schema cache
    const rows = await prisma.$queryRawUnsafe<Array<{ invoiceAccessCode: string | null }>>(
      'SELECT cl.invoiceAccessCode FROM invoices inv JOIN clients cl ON cl.id = inv.clientId WHERE inv.id = ?',
      id,
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }

    const valid = rows[0].invoiceAccessCode === code.trim();

    if (!valid) {
      return NextResponse.json({ valid: false, error: 'Kode akses salah' }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error: unknown) {
    console.error('[INVOICE VERIFY]', error);
    return NextResponse.json({ error: 'Gagal verifikasi kode' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const inv = await prisma.invoice.findUnique({ where: { id } });
    if (!inv) return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });

    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[DELETE INVOICE]', error);
    return NextResponse.json({ error: 'Gagal menghapus invoice' }, { status: 500 });
  }
}
