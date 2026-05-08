import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const yearStart = new Date(`${year}-01-01`);
    const monthStart = new Date(year, now.getMonth(), 1);
    const monthEnd = new Date(year, now.getMonth() + 1, 1);

    // ── Monthly Revenue (paid invoices this month) ───────────
    const paidThisMonth = await prisma.invoice.findMany({
      where: { status: 'paid', tanggalTerbit: { gte: monthStart, lt: monthEnd } },
      select: { nominal: true },
    });
    const monthlyRevenue = paidThisMonth.reduce((s: number, i: { nominal: number }) => s + i.nominal, 0);

    // ── Yearly Revenue (paid invoices YTD) ───────────────────
    const paidYTD = await prisma.invoice.findMany({
      where: { status: 'paid', tanggalTerbit: { gte: yearStart, lt: monthEnd } },
      select: { nominal: true },
    });
    const yearlyRevenue = paidYTD.reduce((s: number, i: { nominal: number }) => s + i.nominal, 0);

    // ── Outstanding (unpaid + partial + overdue) ──────────────
    const outstandingInv = await prisma.invoice.findMany({
      where: { status: { in: ['unpaid', 'partial', 'overdue'] } },
      select: { nominal: true, status: true },
    });
    const outstandingTotal = outstandingInv.reduce((s: number, i: { nominal: number; status: string }) => s + i.nominal, 0);
    const unpaidCount = outstandingInv.filter((i: { status: string }) => i.status !== 'paid').length;

    // ── Conversion Rate ──────────────────────────────────────
    const allDealsYTD = await prisma.deal.findMany({
      where: { tanggalMasuk: { gte: yearStart }, dealStatus: { not: 'archived' } },
      select: { dealStatus: true },
    });
    const totalDeals = allDealsYTD.length;
    const wonDeals = allDealsYTD.filter((d: { dealStatus: string }) => d.dealStatus === 'won').length;
    const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;

    // ── Revenue per Month (bar chart) ────────────────────────
    const allPaid = await prisma.invoice.findMany({
      where: { status: 'paid', tanggalTerbit: { gte: yearStart } },
      select: { nominal: true, tanggalTerbit: true },
    });
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const revenueByMonth: Record<string, number> = {};
    for (let i = 0; i < 12; i++) revenueByMonth[i] = 0;
    for (const inv of allPaid as { nominal: number; tanggalTerbit: Date }[]) {
      if (inv.tanggalTerbit.getFullYear() === year) {
        revenueByMonth[inv.tanggalTerbit.getMonth()] += inv.nominal;
      }
    }
    const monthlyChart = Object.entries(revenueByMonth).map(([m, total]) => ({
      monthLabel: monthNames[parseInt(m)],
      total,
      isCurrent: parseInt(m) === now.getMonth(),
    }));

    // ── Revenue per Service (from won deals YTD) ─────────────
    const wonDealsWithService = await prisma.deal.findMany({
      where: { dealStatus: 'won', tanggalMasuk: { gte: yearStart } },
      include: { service: { select: { nama: true, colorHex: true } } },
    });
    const svcMap: Record<string, { total: number; colorHex: string }> = {};
    for (const d of wonDealsWithService as { id: string; clientId: string; serviceId: string | null; assignedAeId: string | null; stageId: string | null; nilai: number; namaProject: string | null; probability: number; isHot: boolean; tanggalMasuk: Date; deadline: Date | null; notes: string | null; lostReason: string | null; dealStatus: string; createdAt: Date; updatedAt: Date; service: { nama: string; colorHex: string } | null }[]) {
      const name = d.service?.nama || 'Lainnya';
      if (!svcMap[name]) svcMap[name] = { total: 0, colorHex: d.service?.colorHex || '#6B7280' };
      svcMap[name].total += d.nilai;
    }
    const maxSvc = Math.max(...Object.values(svcMap).map((s: { total: number; colorHex: string }) => s.total), 1);
    const revenuePerService = Object.entries(svcMap).map(([name, data]) => ({
      name, total: data.total, pct: Math.round((data.total / maxSvc) * 100), colorHex: data.colorHex,
    })).sort((a: { name: string; total: number; pct: number; colorHex: string }, b: { name: string; total: number; pct: number; colorHex: string }) => b.total - a.total);

    // ── AE Leaderboard (by revenue this month) ───────────────
    const aeUsers = await prisma.user.findMany({ where: { isActive: true, role: 'ae' } });
    const leaderboard = await Promise.all(aeUsers.map(async (u: { id: string; nama: string; email: string; password: string; role: string; avatarInitial: string | null; avatarColor: string | null; isActive: boolean; createdAt: Date; updatedAt: Date }) => {
      const deals = await prisma.deal.findMany({
        where: { assignedAeId: u.id, dealStatus: 'won', tanggalMasuk: { gte: monthStart, lt: monthEnd } },
      });
      const rev = deals.reduce((s: number, d: { id: string; clientId: string; serviceId: string | null; assignedAeId: string | null; stageId: string | null; nilai: number; namaProject: string | null; probability: number; isHot: boolean; tanggalMasuk: Date; deadline: Date | null; notes: string | null; lostReason: string | null; dealStatus: string; createdAt: Date; updatedAt: Date }) => s + d.nilai, 0);
      const fuOverdue = await prisma.activity.count({
        where: { picId: u.id, isDone: false, nextActionDate: { lt: now } },
      });
      return {
        id: u.id, name: u.nama, av: u.avatarInitial || u.nama.charAt(0).toUpperCase(),
        bg: u.avatarColor || '#E5E7EB', c: '#fff',
        deals: deals.length, rev, fuOverdue,
        status: fuOverdue > 0 ? 'warn' : 'ok',
      };
    }));
    leaderboard.sort((a: { id: string; name: string; av: string; bg: string; c: string; deals: number; rev: number; fuOverdue: number; status: string }, b: { id: string; name: string; av: string; bg: string; c: string; deals: number; rev: number; fuOverdue: number; status: string }) => b.rev - a.rev);

    // ── Pipeline Forecast ────────────────────────────────────
    const activeDeals = await prisma.deal.findMany({
      where: { dealStatus: 'active' },
      include: { stage: { select: { nama: true, probabilityDefault: true } } },
    });
    const weightedTotal = activeDeals.reduce((s: number, d: { id: string; clientId: string; serviceId: string | null; assignedAeId: string | null; stageId: string | null; nilai: number; namaProject: string | null; probability: number; isHot: boolean; tanggalMasuk: Date; deadline: Date | null; notes: string | null; lostReason: string | null; dealStatus: string; createdAt: Date; updatedAt: Date }) => s + d.nilai * d.probability / 100, 0);
    const stageGroup: Record<string, { total: number; count: number; avgProb: number }> = {};
    for (const d of activeDeals as { id: string; clientId: string; serviceId: string | null; assignedAeId: string | null; stageId: string | null; nilai: number; namaProject: string | null; probability: number; isHot: boolean; tanggalMasuk: Date; deadline: Date | null; notes: string | null; lostReason: string | null; dealStatus: string; createdAt: Date; updatedAt: Date; stage: { nama: string; probabilityDefault: number } | null }[]) {
      const name = d.stage?.nama || 'Unknown';
      if (!stageGroup[name]) stageGroup[name] = { total: 0, count: 0, avgProb: d.probability };
      stageGroup[name].total += d.nilai;
      stageGroup[name].count += 1;
    }
    const pipelineByStage = Object.entries(stageGroup).map(([stage, data]) => ({
      stage, total: data.total, count: data.count, probability: data.avgProb,
    }));

    // ── Outstanding Invoices (AR) ─────────────────────────────
    const arInvoices = await prisma.invoice.findMany({
      where: { status: { in: ['unpaid', 'partial', 'overdue'] } },
      include: { client: { select: { namaKlien: true } } },
      orderBy: { jatuhTempo: 'asc' },
      take: 5,
    });

    // ── Alerts ───────────────────────────────────────────────
    const fuOverdueCount = await prisma.activity.count({
      where: { isDone: false, nextActionDate: { lt: now } },
    });
    const inactiveLeadDays = 7;
    const inactiveThreshold = new Date(now.getTime() - inactiveLeadDays * 24 * 60 * 60 * 1000);
    const inactiveLeads = await prisma.lead.count({
      where: { status: { not: 'unqualified' }, tanggalMasuk: { lt: inactiveThreshold } },
    });
    const wonThisMonth = await prisma.deal.count({
      where: { dealStatus: 'won', tanggalMasuk: { gte: monthStart, lt: monthEnd } },
    });

    return NextResponse.json({
      monthlyRevenue, yearlyRevenue, outstandingTotal,
      unpaidCount, conversionRate,
      monthlyChart,
      revenuePerService,
      leaderboard,
      pipeline: { weightedTotal: Math.round(weightedTotal), activeDealCount: activeDeals.length, byStage: pipelineByStage },
      arInvoices: arInvoices.map((inv: { id: string; clientId: string; dealId: string | null; nomorInvoice: string; namaProject: string | null; nominal: number; tanggalTerbit: Date; jatuhTempo: Date; status: string; keterangan: string | null; paidAmount: number | null; createdById: string | null; createdAt: Date; updatedAt: Date; client: { namaKlien: string } }) => ({
        id: inv.id, client: inv.client.namaKlien, project: inv.namaProject || '',
        nominal: inv.nominal, jatuhTempo: inv.jatuhTempo, status: inv.status,
      })),
      alerts: {
        fuOverdue: fuOverdueCount,
        inactiveLeads,
        wonThisMonth,
      },
    });
  } catch (error: unknown) {
    console.error('[DASHBOARD GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}
