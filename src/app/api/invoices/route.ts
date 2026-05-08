import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';

  try {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { client: { namaKlien: { contains: search, mode: 'insensitive' } } },
        { nomorInvoice: { contains: search, mode: 'insensitive' } },
        { namaProject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, namaKlien: true } },
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

    for (const inv of invoices) {
      const due = new Date(inv.jatuhTempo);
      const isOverdue = due < now && inv.status !== 'paid';

      if (inv.status === 'paid') {
        if (inv.tanggalTerbit.getMonth() === thisMonth && inv.tanggalTerbit.getFullYear() === thisYear) {
          paidThisMonth += inv.nominal;
          paidCount++;
        }
      } else if (isOverdue) {
        overdueTotal += inv.nominal;
        overdueCount++;
      } else if (inv.status === 'unpaid') {
        unpaidTotal += inv.nominal;
        unpaidCount++;
      } else if (inv.status === 'partial') {
        partialTotal += inv.nominal;
        partialCount++;
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
  } catch (error) {
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
  } catch (error) {
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

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.jatuhTempo !== undefined) updateData.jatuhTempo = new Date(data.jatuhTempo);
    if (data.keterangan !== undefined) updateData.keterangan = data.keterangan;
    if (data.paidAmount !== undefined) updateData.paidAmount = parseFloat(data.paidAmount);

    if (data.status === 'paid') {
      const inv = await prisma.invoice.findUnique({ where: { id } });
      if (inv) updateData.paidAmount = inv.nominal;
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { client: { select: { id: true, namaKlien: true } } },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('[INVOICES PATCH]', error);
    return NextResponse.json({ error: 'Gagal mengupdate invoice' }, { status: 500 });
  }
}
