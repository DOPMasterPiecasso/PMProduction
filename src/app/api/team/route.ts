import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type UserData = {
  id: string; name: string; av: string; bg: string; c: string;
  deals: number; rev: number; act: number; fu: number; ov: number;
  inactive: number; status: string; targetDeals: number; targetRevenue: number;
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bulan = searchParams.get('bulan') || '';

  try {
    const [yearStr, monthStr] = bulan.split('-');
    const year = parseInt(yearStr || String(new Date().getFullYear()));
    const month = parseInt(monthStr || String(new Date().getMonth() + 1)) - 1; // 0-indexed
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);

    const users = await prisma.user.findMany({
      where: { isActive: true, role: 'ae' },
      orderBy: { nama: 'asc' },
    });

    const kpiTargets = await prisma.kpiTarget.findMany({
      where: { bulan },
    });
    const targetMap = new Map(kpiTargets.map((t: { userId: string; targetDeals: number; targetRevenue: number }) => [t.userId, t]));

    const now = new Date();
    const teamData = await Promise.all(users.map(async (user: { id: string; nama: string; email: string; password: string; role: string; avatarInitial: string | null; avatarColor: string | null; isActive: boolean; createdAt: Date; updatedAt: Date }) => {
      // Deals won this month
      const dealsThisMonth = await prisma.deal.findMany({
        where: {
          assignedAeId: user.id,
          dealStatus: 'won',
          tanggalMasuk: { gte: monthStart, lt: monthEnd },
        },
      });
      const dealsActual = dealsThisMonth.length;
      const revenueActual = dealsThisMonth.reduce((s: number, d: { nilai: number }) => s + d.nilai, 0);

      // Activities this month
      const activitiesThisMonth = await prisma.activity.findMany({
        where: {
          picId: user.id,
          tanggalAktivitas: { gte: monthStart, lt: monthEnd },
        },
      });
      const totalAct = activitiesThisMonth.length;
      const fuDone = activitiesThisMonth.filter((a: { isDone: boolean }) => a.isDone).length;

      // FU overdue (anytime, not just this month)
      const fuOverdue = await prisma.activity.count({
        where: {
          picId: user.id,
          isDone: false,
          nextActionDate: { lt: now },
        },
      });

      // Inactive days (days since last activity)
      const lastAct = await prisma.activity.findFirst({
        where: { picId: user.id },
        orderBy: { tanggalAktivitas: 'desc' },
        select: { tanggalAktivitas: true },
      });
      const inactiveDays = lastAct
        ? Math.floor((now.getTime() - lastAct.tanggalAktivitas.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      const target = targetMap.get(user.id);
      const targetDeals = target?.targetDeals ?? 0;
      const targetRevenue = target?.targetRevenue ?? 0;

      // Status
      let status = 'ok';
      if (fuOverdue > 0) status = 'warn';
      if (totalAct < 10 && dealsActual < 2) status = 'low';

      return {
        id: user.id,
        name: user.nama,
        av: user.avatarInitial || user.nama.charAt(0).toUpperCase(),
        bg: user.avatarColor || '#E5E7EB',
        c: '#fff',
        deals: dealsActual,
        rev: Math.round(revenueActual),
        act: totalAct,
        fu: fuDone,
        ov: fuOverdue,
        inactive: inactiveDays,
        status,
        targetDeals,
        targetRevenue,
      };
    }));

    // Totals
    const totals = {
      totalAct: teamData.reduce((s: number, d: UserData) => s + d.act, 0),
      totalFu: teamData.reduce((s: number, d: UserData) => s + d.fu, 0),
      totalOv: teamData.reduce((s: number, d: UserData) => s + d.ov, 0),
      totalDeals: teamData.reduce((s: number, d: UserData) => s + d.deals, 0),
    };

    // Alerts
    const alerts: { type: 'danger' | 'warn'; message: string }[] = [];
    for (const d of teamData as UserData[]) {
      if (d.act < 10 && d.deals < 2) {
        alerts.push({ type: 'danger', message: `${d.name} - Low activity: hanya ${d.act} aktivitas dalam bulan ini` });
      } else if (d.ov > 0) {
        alerts.push({ type: 'warn', message: `${d.name} - ${d.ov} follow-up overdue, segera diselesaikan` });
      }
    }

    return NextResponse.json({ teamData, totals, alerts, bulan, monthLabel: `${monthNames[month]} ${year}` });
  } catch (error: unknown) {
    console.error('[TEAM GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, bulan, targetDeals, targetRevenue } = body;

    if (!userId || !bulan) {
      return NextResponse.json({ error: 'userId dan bulan wajib diisi' }, { status: 400 });
    }

    const target = await prisma.kpiTarget.upsert({
      where: { userId_bulan: { userId, bulan } },
      update: {
        ...(targetDeals !== undefined && { targetDeals: parseInt(targetDeals) }),
        ...(targetRevenue !== undefined && { targetRevenue: parseFloat(targetRevenue) }),
      },
      create: {
        userId,
        bulan,
        targetDeals: parseInt(targetDeals) || 10,
        targetRevenue: parseFloat(targetRevenue) || 100000000,
      },
    });

    return NextResponse.json({ success: true, target });
  } catch (error: unknown) {
    console.error('[TEAM PATCH]', error);
    return NextResponse.json({ error: 'Gagal menyimpan target KPI' }, { status: 500 });
  }
}
