import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const status = searchParams.get('status');
    const search = searchParams.get('search') ?? '';

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { clientName: { contains: search } },
        { phoneNumber: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.messageLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          invoice: {
            select: { id: true, nomorInvoice: true, nominal: true, status: true },
          },
        },
      }),
      prisma.messageLog.count({ where }),
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('[MESSAGES GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data pesan' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID pesan wajib diisi' }, { status: 400 });
    }
    await prisma.messageLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[MESSAGES DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus pesan' }, { status: 500 });
  }
}
