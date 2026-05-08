import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const typeId = searchParams.get('typeId') ?? '';
  const picId = searchParams.get('picId') ?? '';
  const tab = searchParams.get('tab') ?? '';
  const date = searchParams.get('date') ?? '';
  const month = searchParams.get('month') ?? '';

  try {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { catatan: { contains: search, mode: 'insensitive' } },
        { client: { namaKlien: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (typeId) where.typeId = typeId;
    if (picId) where.picId = picId;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    if (tab === 'overdue') {
      where.nextActionDate = { lt: todayStart };
      where.isDone = false;
    } else if (tab === 'today') {
      where.nextActionDate = { gte: todayStart, lt: todayEnd };
      where.isDone = false;
    } else if (tab === 'upcoming') {
      where.nextActionDate = { gte: todayEnd };
      where.isDone = false;
    } else if (tab === 'done') {
      where.isDone = true;
    }

    if (date) {
      const d = new Date(date);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dEnd = new Date(dStart.getTime() + 86400000);
      where.tanggalAktivitas = { gte: dStart, lt: dEnd };
    }

    const activities = await prisma.activity.findMany({
      where,
      select: {
        id: true,
        clientId: true,
        dealId: true,
        typeId: true,
        picId: true,
        tanggalAktivitas: true,
        catatan: true,
        nextAction: true,
        nextActionDate: true,
        isDone: true,
        fileUrl: true,
        fileName: true,
        createdAt: true,
        updatedAt: true,
        type: { select: { id: true, nama: true, colorHex: true } },
        pic: { select: { id: true, nama: true, avatarInitial: true } },
        client: { select: { id: true, namaKlien: true } },
        deal: { select: { id: true, client: { select: { namaKlien: true } } } },
      },
      orderBy: { tanggalAktivitas: 'desc' },
    });

    // For calendar dots: aggregate counts per date
    const monthStart = month
      ? new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]) - 1, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);

    const monthActivities = await prisma.activity.findMany({
      where: {
        tanggalAktivitas: { gte: monthStart, lte: monthEnd },
      },
      select: {
        tanggalAktivitas: true,
        isDone: true,
        nextActionDate: true,
      },
    });

    // Build calendar events
    const calEvents: Record<string, string[]> = {};
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    monthActivities.forEach((a: { tanggalAktivitas: Date; isDone: boolean; nextActionDate: Date | null }) => {
      const d = a.tanggalAktivitas;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!calEvents[key]) calEvents[key] = [];
      if (a.isDone) {
        if (!calEvents[key].includes('done')) calEvents[key].push('done');
      } else if (a.nextActionDate && a.nextActionDate < today) {
        if (!calEvents[key].includes('overdue')) calEvents[key].push('overdue');
      } else {
        if (!calEvents[key].includes('fu')) calEvents[key].push('fu');
      }
    });

    const [activityTypes, users, clients] = await Promise.all([
      prisma.activityType.findMany({ orderBy: { nama: 'asc' } }),
      prisma.user.findMany({ where: { isActive: true }, select: { id: true, nama: true, avatarInitial: true }, orderBy: { nama: 'asc' } }),
      prisma.client.findMany({ select: { id: true, namaKlien: true }, orderBy: { namaKlien: 'asc' } }),
    ]);

    const stats = {
      overdue: await prisma.activity.count({ where: { nextActionDate: { lt: todayStart }, isDone: false } }),
      today: await prisma.activity.count({ where: { nextActionDate: { gte: todayStart, lt: todayEnd }, isDone: false } }),
      upcoming: await prisma.activity.count({ where: { nextActionDate: { gte: todayEnd }, isDone: false } }),
      total: await prisma.activity.count(),
    };

    return NextResponse.json({ activities, calEvents, stats, meta: { activityTypes, users, clients } });
  } catch (error: unknown) {
    console.error('[AKTIVITAS GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, dealId, typeId, picId, tanggalAktivitas, catatan, nextAction, nextActionDate, isDone, fileUrl, fileName } = body;

    if (!typeId || !tanggalAktivitas) {
      return NextResponse.json({ error: 'Tipe aktivitas dan tanggal wajib diisi' }, { status: 400 });
    }
    if (!nextAction || !nextActionDate) {
      return NextResponse.json({ error: 'Next Action dan Next Action Date wajib diisi' }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        clientId: clientId || null,
        dealId: dealId || null,
        typeId,
        picId: picId || null,
        tanggalAktivitas: new Date(tanggalAktivitas),
        catatan: catatan || null,
        nextAction: nextAction || null,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        isDone: isDone ?? false,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
      include: {
        type: { select: { id: true, nama: true, colorHex: true } },
        pic: { select: { id: true, nama: true, avatarInitial: true } },
        client: { select: { id: true, namaKlien: true } },
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error: unknown) {
    console.error('[AKTIVITAS POST]', error);
    return NextResponse.json({ error: 'Gagal membuat aktivitas' }, { status: 500 });
  }
}
