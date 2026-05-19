import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reminders = await prisma.invoiceReminder.findMany({
      where: { invoiceId: id },
      orderBy: { daysBefore: 'asc' },
    });
    return NextResponse.json({ reminders });
  } catch (error: unknown) {
    console.error('[REMINDERS GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data reminder' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { daysBefore, isActive } = body;

    if (daysBefore === undefined) {
      return NextResponse.json({ error: 'daysBefore wajib diisi' }, { status: 400 });
    }

    const reminder = await prisma.invoiceReminder.upsert({
      where: {
        invoiceId_daysBefore: { invoiceId: id, daysBefore },
      },
      update: { isActive: isActive ?? true },
      create: { invoiceId: id, daysBefore, isActive: isActive ?? true },
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error: unknown) {
    console.error('[REMINDERS POST]', error);
    return NextResponse.json({ error: 'Gagal menyimpan reminder' }, { status: 500 });
  }
}
