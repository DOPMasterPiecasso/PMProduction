import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';

  try {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { client: { namaKlien: { contains: search } } },
        { nomorInvoice: { contains: search } },
        { namaProject: { contains: search } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, namaKlien: true } },
        documents: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true, fileUrl: true, uploadedAt: true } },
        terms: {
          orderBy: { terminKe: 'asc' },
          include: { documents: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true, fileUrl: true, uploadedAt: true } } },
        },
      },
      orderBy: [
        { status: 'asc' },
        { jatuhTempo: 'asc' },
      ],
    });

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let paidThisMonth = 0;
    let paidCount = 0;
    let unpaidTotal = 0;
    let unpaidCount = 0;
    let partialTotal = 0;
    let partialCount = 0;
    let overdueTotal = 0;
    let overdueCount = 0;

    for (const inv of invoices as { id: string; clientId: string; dealId: string | null; nomorInvoice: string; namaProject: string | null; nominal: number; tanggalTerbit: Date; jatuhTempo: Date; status: string; keterangan: string | null; paidAmount: number | null; createdById: string | null; createdAt: Date; updatedAt: Date; client: { id: string; namaKlien: string } }[]) {
      const remaining = inv.nominal - (inv.paidAmount || 0);
      const isPastDue = new Date(inv.jatuhTempo) < now;

      if (inv.status === 'paid') {
        if (inv.tanggalTerbit.getMonth() === thisMonth && inv.tanggalTerbit.getFullYear() === thisYear) {
          paidThisMonth += inv.nominal;
          paidCount++;
        }
      } else {
        if (inv.status === 'unpaid') {
          unpaidTotal += remaining;
          unpaidCount++;
        } else if (inv.status === 'partial') {
          partialTotal += remaining;
          partialCount++;
        }
        if (isPastDue) {
          overdueTotal += remaining;
          overdueCount++;
        }
      }
    }

    const stats = {
      paidThisMonth,
      paidCount,
      unpaidTotal,
      unpaidCount,
      partialTotal,
      partialCount,
      overdueTotal,
      overdueCount,
    };

    return NextResponse.json({ invoices, stats });
  } catch (error: unknown) {
    console.error('[INVOICES GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, dealId, namaProject, nominal, jatuhTempo, status, keterangan, createdById } = body;

    if (!clientId || !nominal || !jatuhTempo) {
      return NextResponse.json({ error: 'clientId, nominal, dan jatuhTempo wajib diisi' }, { status: 400 });
    }

    const count = await prisma.invoice.count();
    const nomorInvoice = `#INV-${String(count + 1).padStart(3, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        dealId: dealId || null,
        nomorInvoice,
        namaProject: namaProject || '',
        nominal: parseFloat(nominal),
        tanggalTerbit: new Date(),
        jatuhTempo: new Date(jatuhTempo),
        status: status || 'unpaid',
        keterangan: keterangan || null,
        paidAmount: status === 'paid' ? parseFloat(nominal) : 0,
        createdById: createdById || null,
      },
      include: { client: { select: { id: true, namaKlien: true } } },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    console.error('[INVOICES POST]', error);
    return NextResponse.json({ error: 'Gagal membuat invoice' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID invoice wajib diisi' }, { status: 400 });
    }

    // ── Term operations ────────────────────────────────────
    if (data.termId) {
      if (data.termStatus) {
        const term = await prisma.invoiceTerm.findUnique({ where: { id: data.termId } });
        if (term) {
          await prisma.invoiceTerm.update({
            where: { id: data.termId },
            data: {
              status: data.termStatus,
              paidAt: data.termStatus === 'paid' ? new Date() : null,
              paidAmount: data.termStatus === 'paid' ? term.amount : 0,
            },
          });
        }
      }
      if (data.termJatuhTempo) {
        await prisma.invoiceTerm.update({
          where: { id: data.termId },
          data: { jatuhTempo: new Date(data.termJatuhTempo) },
        });
      }
      // Recalculate invoice status based on terms
      await recalcInvoiceStatus(id);
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { client: { select: { id: true, namaKlien: true } }, terms: { orderBy: { terminKe: 'asc' }, include: { documents: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true, fileUrl: true, uploadedAt: true } } } } },
      });
      return NextResponse.json({ success: true, invoice });
    }

    if (data.addTerm) {
      await prisma.invoiceTerm.create({
        data: {
          invoiceId: id,
          terminKe: data.terminKe || 1,
          percentage: data.percentage || null,
          amount: parseFloat(data.amount) || 0,
          jatuhTempo: new Date(data.jatuhTempo || new Date()),
          status: 'pending',
          keterangan: data.keterangan || null,
        },
      });
      await recalcInvoiceStatus(id);
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { client: { select: { id: true, namaKlien: true } }, terms: { orderBy: { terminKe: 'asc' }, include: { documents: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true, fileUrl: true, uploadedAt: true } } } } },
      });
      return NextResponse.json({ success: true, invoice });
    }

    if (data.editTerm) {
      const updateData: Record<string, unknown> = {};
      if (data.terminKe !== undefined) updateData.terminKe = data.terminKe;
      if (data.percentage !== undefined) updateData.percentage = data.percentage;
      if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
      if (data.jatuhTempo !== undefined) updateData.jatuhTempo = new Date(data.jatuhTempo);
      if (data.keterangan !== undefined) updateData.keterangan = data.keterangan;
      await prisma.invoiceTerm.update({ where: { id: data.editTerm }, data: updateData });
      await recalcInvoiceStatus(id);
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { client: { select: { id: true, namaKlien: true } }, terms: { orderBy: { terminKe: 'asc' }, include: { documents: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true, fileUrl: true, uploadedAt: true } } } } },
      });
      return NextResponse.json({ success: true, invoice });
    }

    if (data.deleteTerm) {
      await prisma.invoiceTerm.delete({ where: { id: data.deleteTerm } });
      await recalcInvoiceStatus(id);
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { client: { select: { id: true, namaKlien: true } }, terms: { orderBy: { terminKe: 'asc' }, include: { documents: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true, fileUrl: true, uploadedAt: true } } } } },
      });
      return NextResponse.json({ success: true, invoice });
    }

    // ── Standard invoice updates ───────────────────────────
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.jatuhTempo !== undefined) updateData.jatuhTempo = new Date(data.jatuhTempo);
    if (data.keterangan !== undefined) updateData.keterangan = data.keterangan;
    if (data.paidAmount !== undefined) updateData.paidAmount = parseFloat(data.paidAmount);

    if (data.status === 'paid') {
      const inv = await prisma.invoice.findUnique({ where: { id } });
      if (inv) updateData.paidAmount = inv.nominal;
    } else if (data.status === 'unpaid') {
      updateData.paidAmount = 0;
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { client: { select: { id: true, namaKlien: true } } },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    console.error('[INVOICES PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate invoice' }, { status: 500 });
  }
}

async function recalcInvoiceStatus(invoiceId: string) {
  const terms = await prisma.invoiceTerm.findMany({ where: { invoiceId } });
  if (terms.length === 0) return;
  const allPaid = terms.every((t) => t.status === 'paid');
  const allPending = terms.every((t) => t.status === 'pending');
  const anyOverdue = terms.some((t) => t.status === 'overdue');
  const totalPaid = terms.filter((t) => t.status === 'paid').reduce((s, t) => s + (t.paidAmount || t.amount), 0);
  const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!inv) return;
  let newStatus = inv.status;
  if (allPaid) newStatus = 'paid';
  else if (anyOverdue) newStatus = 'overdue';
  else if (totalPaid > 0 && totalPaid < inv.nominal) newStatus = 'partial';
  else if (totalPaid === 0) newStatus = 'unpaid';
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: newStatus, paidAmount: totalPaid },
  });
}
