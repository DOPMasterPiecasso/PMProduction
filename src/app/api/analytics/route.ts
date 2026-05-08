import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const yearStart = new Date(`${year}-01-01`);

    // ── Deals YTD stats ──────────────────────────────────────
    const dealsYTD = await prisma.deal.findMany({
      where: { tanggalMasuk: { gte: yearStart }, dealStatus: { not: 'archived' } },
      include: { service: { select: { id: true, nama: true, colorHex: true } }, client: { select: { sourceId: true } } },
    });

    const totalDealsYTD = dealsYTD.length;
    const wonDealsYTD = dealsYTD.filter((d) => d.dealStatus === 'won');
    const wonCount = wonDealsYTD.length;
    const lostDealsYTD = dealsYTD.filter((d) => d.dealStatus === 'lost');
    const sumNilaiWon = wonDealsYTD.reduce((s, d) => s + d.nilai, 0);
    const avgDealSize = wonCount > 0 ? sumNilaiWon / wonCount : 0;
    const winRate = totalDealsYTD > 0 ? (wonCount / totalDealsYTD) * 100 : 0;

    // Avg close time (days from tanggalMasuk to... we'll use days between created and now for won, or just estimate)
    let avgCloseTime = 0;
    if (wonCount > 0) {
      const totalDays = wonDealsYTD.reduce((s, d) => {
        const diff = now.getTime() - d.tanggalMasuk.getTime();
        return s + Math.ceil(diff / (1000 * 60 * 60 * 24));
      }, 0);
      avgCloseTime = Math.round(totalDays / wonCount);
    }

    // ── Revenue per month (paid invoices) ────────────────────
    const paidInvoices = await prisma.invoice.findMany({
      where: { status: 'paid', tanggalTerbit: { gte: yearStart } },
      select: { nominal: true, tanggalTerbit: true },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const revenueByMonth: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const key = `${year}-${String(i + 1).padStart(2, '0')}`;
      revenueByMonth[key] = 0;
    }
    let ytdRevenue = 0;
    for (const inv of paidInvoices) {
      const m = inv.tanggalTerbit.getMonth();
      const y = inv.tanggalTerbit.getFullYear();
      if (y === year) {
        const key = `${y}-${String(m + 1).padStart(2, '0')}`;
        revenueByMonth[key] = (revenueByMonth[key] || 0) + inv.nominal;
        ytdRevenue += inv.nominal;
      }
    }

    const monthlyRevenue = Object.entries(revenueByMonth)
      .filter(([k]) => k.startsWith(String(year)))
      .map(([k, v]) => ({ bulan: k, monthLabel: monthNames[parseInt(k.split('-')[1]) - 1], total: v }));

    // Current month stats
    const thisMonth = now.getMonth();
    const thisMonthKey = `${year}-${String(thisMonth + 1).padStart(2, '0')}`;
    const thisMonthRevenue = revenueByMonth[thisMonthKey] || 0;

    // Previous month
    const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const prevMonthYear = thisMonth === 0 ? year - 1 : year;
    const prevMonthKey = `${prevMonthYear}-${String(prevMonth + 1).padStart(2, '0')}`;
    const prevMonthRevenue = revenueByMonth[prevMonthKey] || 0;
    const vsLastMonthPct = prevMonthRevenue > 0 ? ((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

    // Target
    const sysTarget = await prisma.systemSetting.findUnique({ where: { key: 'target_revenue_tahunan' } });
    const annualTarget = sysTarget ? parseFloat(sysTarget.value) : 500000000;
    const targetPct = annualTarget > 0 ? (ytdRevenue / annualTarget) * 100 : 0;

    // ── Funnel counts ────────────────────────────────────────
    const stages = await prisma.pipelineStage.findMany({ orderBy: { urutan: 'asc' } });
    const allDealsWithStage = await prisma.deal.findMany({
      where: { dealStatus: { not: 'archived' } },
      select: { stageId: true, dealStatus: true },
    });
    const totalLeads = await prisma.lead.count();
    const funnel: { stage: string; count: number; color: string }[] = [];
    for (const s of stages) {
      if (s.isTerminal && s.nama === 'Won') {
        funnel.push({ stage: 'Deal Won', count: wonCount, color: '#16A34A' });
      } else if (s.isTerminal && s.nama === 'Lost') {
        funnel.push({ stage: 'Lost', count: lostDealsYTD.length, color: '#94A3B8' });
      } else {
        const count = allDealsWithStage.filter((d) => d.stageId === s.id).length;
        funnel.push({ stage: s.nama, count, color: s.colorHex });
      }
    }

    // Also add Lead at top (from Lead model, not Deal)
    if (stages.length > 0 && stages[0].nama === 'Lead') {
      // Replace the "Lead" in funnel with actual lead count + deal lead count
      const leadStageId = stages[0].id;
      const dealLeadCount = allDealsWithStage.filter((d) => d.stageId === leadStageId).length;
      funnel[0] = { ...funnel[0], count: totalLeads + dealLeadCount };
    }

    // Funnel metrics
    const contactedIdx = funnel.findIndex((f) => f.stage === 'Contacted');
    const wonIdx = funnel.findIndex((f) => f.stage === 'Deal Won');
    const negoIdx = funnel.findIndex((f) => f.stage === 'Negotiation');
    const lostIdx = funnel.findIndex((f) => f.stage === 'Lost');
    const leadCount = funnel[0]?.count || 0;
    const contactedCount = contactedIdx >= 0 ? funnel[contactedIdx].count : 0;
    const wonFunnelCount = wonIdx >= 0 ? funnel[wonIdx].count : 0;
    const negoCount = negoIdx >= 0 ? funnel[negoIdx].count : 0;
    const lostCount = lostIdx >= 0 ? funnel[lostIdx].count : 0;

    const funnelMetrics = {
      conversion: leadCount > 0 ? (wonFunnelCount / leadCount) * 100 : 0,
      leadToContact: leadCount > 0 ? (contactedCount / leadCount) * 100 : 0,
      negoToDeal: negoCount > 0 ? (wonFunnelCount / negoCount) * 100 : 0,
      lostRate: totalDealsYTD > 0 ? (lostCount / totalDealsYTD) * 100 : 0,
    };

    // ── Revenue per service ──────────────────────────────────
    const services = await prisma.service.findMany({ where: { isActive: true } });
    const revenuePerService = services.map((svc) => {
      const svcDeals = wonDealsYTD.filter((d) => d.serviceId === svc.id);
      const total = svcDeals.reduce((s, d) => s + d.nilai, 0);
      const maxRevenue = sumNilaiWon || 1;
      return { service: svc.nama, total, pct: Math.round((total / maxRevenue) * 100), colorHex: svc.colorHex };
    }).sort((a, b) => b.total - a.total);

    // ── Lead source analysis ──────────────────────────────────
    const leadSources = await prisma.leadSource.findMany();
    const sourceAnalysis = await Promise.all(leadSources.map(async (src) => {
      const srcDeals = dealsYTD.filter((d) => d.client?.sourceId === src.id);
      const srcWon = srcDeals.filter((d) => d.dealStatus === 'won');
      const totalVal = srcDeals.reduce((s, d) => s + d.nilai, 0);
      const srcWinRate = srcDeals.length > 0 ? (srcWon.length / srcDeals.length) * 100 : 0;
      const avgVal = srcWon.length > 0 ? srcWon.reduce((s, d) => s + d.nilai, 0) / srcWon.length : 0;
      const maxTotal = Math.max(...(await Promise.all(leadSources.map(async (s) => {
        const sd = dealsYTD.filter((d) => d.client?.sourceId === s.id);
        return sd.reduce((sum, d) => sum + d.nilai, 0);
      }))), 1);
      return {
        source: src.nama,
        dealCount: srcDeals.length,
        totalValue: totalVal,
        winRate: Math.round(srcWinRate),
        avgDealValue: Math.round(avgVal),
        pct: Math.round((totalVal / maxTotal) * 100),
        isBest: srcWinRate >= 60 && srcDeals.length >= 2,
      };
    })).then((arr) => arr.sort((a, b) => b.totalValue - a.totalValue));

    return NextResponse.json({
      dealStats: {
        totalDealsYTD,
        avgDealSize: Math.round(avgDealSize),
        winRate: Math.round(winRate),
        avgCloseTime,
        wonCount,
        lostCount: lostDealsYTD.length,
      },
      monthlyRevenue,
      revenueSummary: {
        thisMonthRevenue,
        prevMonthRevenue,
        vsLastMonthPct: Math.round(vsLastMonthPct),
        ytdRevenue,
        annualTarget,
        targetPct: Math.round(targetPct),
      },
      funnel,
      funnelMetrics,
      revenuePerService,
      sourceAnalysis,
    });
  } catch (error) {
    console.error('[ANALYTICS GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}
