'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ChartItem { monthLabel: string; total: number; isCurrent: boolean }
interface SvcItem { name: string; total: number; pct: number; colorHex: string }
interface LbItem { id: string; name: string; av: string; bg: string; c: string; deals: number; rev: number; fuOverdue: number; status: string }
interface PipeStage { stage: string; total: number; count: number; probability: number }
interface ArItem { id: string; client: string; project: string; nominal: number; jatuhTempo: string; status: string }

interface DashData {
  monthlyRevenue: number; yearlyRevenue: number; outstandingTotal: number; unpaidCount: number; conversionRate: number;
  monthlyChart: ChartItem[]; revenuePerService: SvcItem[]; leaderboard: LbItem[];
  pipeline: { weightedTotal: number; activeDealCount: number; byStage: PipeStage[] };
  arInvoices: ArItem[];
  alerts: { fuOverdue: number; inactiveLeads: number; wonThisMonth: number };
}

function formatRpShort(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
  return `Rp ${n}`;
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function daysUntil(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const bulan = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?bulan=${bulan}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  }, [bulan]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function moveMonth(dir: number) {
    let m = month + dir;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  }

  function goToday() {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth());
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (!data) {
    return <div className="p-6 text-center text-gray-400 text-[13px]">Gagal memuat data.</div>;
  }

  const maxChart = Math.max(...data.monthlyChart.map((m) => m.total), 1);
  const maxSvc = Math.max(...data.revenuePerService.map((s) => s.total), 1);
  const maxRev = data.leaderboard[0]?.rev || 1;

  function statusDot(inv: ArItem) {
    if (inv.status === 'overdue') return 'bg-red-500';
    if (inv.status === 'partial') return 'bg-amber-500';
    const days = daysUntil(new Date(inv.jatuhTempo));
    if (days <= 7) return 'bg-amber-500';
    return 'bg-green-500';
  }

  function statusBadge(inv: ArItem) {
    if (inv.status === 'overdue') return { label: 'Overdue', cls: 'text-red-700 bg-red-50 border-red-200' };
    const days = daysUntil(new Date(inv.jatuhTempo));
    if (days <= 7) return { label: 'Due Soon', cls: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Safe', cls: 'text-green-700 bg-green-50 border-green-200' };
  }

  return (
    <div className="p-[12px_16px] md:p-[20px_24px] flex flex-col gap-[12px] md:gap-[16px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] md:text-[20px] font-semibold tracking-[-0.3px]">Dashboard</h1>
          <p className="text-[12px] md:text-[13px] text-gray-400 mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={() => router.push('/aktivitas')} className="bg-[#18181B] text-white flex items-center px-3 py-2 rounded-lg text-[12px] font-medium hover:opacity-85">
          + Catat Aktivitas
        </button>
      </div>

      {/* Date strip */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-3 md:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={() => moveMonth(-1)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button onClick={() => moveMonth(1)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="text-[14px] font-semibold bg-transparent border border-black/10 rounded-md px-2 py-1 cursor-pointer outline-none">
            {monthNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
          </select>
          <span className="text-[14px] text-gray-400 font-medium">{year}</span>
          <button onClick={goToday} className="text-[11px] px-2.5 py-1 rounded-md border border-black/10 hover:bg-gray-100">Hari ini</button>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />{data.alerts.fuOverdue} Overdue</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />{data.alerts.inactiveLeads} Inactive</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />{data.alerts.wonThisMonth} Won</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Monthly Revenue</div>
          <div className="text-[18px] font-bold font-mono mt-1">{formatRp(data.monthlyRevenue)}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Invoice Paid saja</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-green-500" />
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Yearly Revenue</div>
          <div className="text-[18px] font-bold font-mono mt-1 text-green-600">{formatRp(data.yearlyRevenue)}</div>
          <div className="text-[10px] text-green-600 mt-0.5">{year} YTD</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500" />
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Outstanding</div>
          <div className="text-[18px] font-bold font-mono mt-1 text-red-600">{formatRp(data.outstandingTotal)}</div>
          <div className="text-[10px] text-red-600 mt-0.5">{data.unpaidCount} unpaid invoice</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-purple-500" />
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Conversion Rate</div>
          <div className="text-[18px] font-bold font-mono mt-1 text-purple-600">{data.conversionRate}%</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Target: 65%</div>
        </div>
      </div>

      {/* Alerts */}
      <div className="flex flex-col gap-[7px]">
        {data.alerts.fuOverdue > 0 && (
          <div className="text-[12px] px-4 py-2.5 rounded-lg border bg-red-50 border-red-200 text-red-700">
            {data.alerts.fuOverdue} follow-up overdue - harus diselesaikan hari ini
          </div>
        )}
        {data.alerts.inactiveLeads > 0 && (
          <div className="text-[12px] px-4 py-2.5 rounded-lg border bg-amber-50 border-amber-200 text-amber-700">
            {data.alerts.inactiveLeads} leads tidak aktif lebih dari 7 hari
          </div>
        )}
      </div>

      {/* Revenue Bulanan + Revenue per Service */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Revenue Bulanan */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-[13px] font-semibold">Revenue Bulanan {year}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Rp Juta - hanya Paid</div>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-[6px] h-[90px]">
              {data.monthlyChart.map((m) => {
                const h = Math.max((m.total / maxChart) * 90, 4);
                return (
                  <div key={m.monthLabel} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm transition-opacity hover:opacity-70"
                      style={{ height: `${h}px`, minHeight: '4px', background: m.isCurrent ? '#2563EB' : m.total > 0 ? '#93C5FD' : undefined, border: m.total === 0 ? '1.5px dashed #D1D5DB' : undefined }}
                    />
                    <div className={`text-[9px] font-mono ${m.isCurrent ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{m.monthLabel}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue per Service */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-[13px] font-semibold">Revenue per Layanan</div>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-2">
              {data.revenuePerService.map((svc) => (
                <div key={svc.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: svc.colorHex }} />
                  <div className="text-[12px] text-gray-700 w-[100px] shrink-0">{svc.name}</div>
                  <div className="flex-1 h-[18px] bg-gray-100 rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${svc.pct}%`, background: svc.colorHex }} />
                  </div>
                  <div className="text-[11px] font-mono text-gray-600 w-[80px] text-right shrink-0">{formatRpShort(svc.total)}</div>
                </div>
              ))}
              {data.revenuePerService.length === 0 && (
                <div className="text-center text-gray-400 text-[12px] py-4">Belum ada data layanan.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AE Leaderboard + Pipeline Forecast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* AE Leaderboard */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-[13px] font-semibold">AE Leaderboard</div>
            <div className="text-[11px] text-gray-400 mt-0.5">by Revenue bulan ini</div>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-2">
              {data.leaderboard.map((ae, i) => (
                <div key={ae.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</div>
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0" style={{ background: ae.bg, color: ae.c }}>{ae.av}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium">{ae.name}</div>
                    <div className="text-[10.5px] text-gray-400">{ae.deals} deals{ae.fuOverdue > 0 ? ` - ${ae.fuOverdue} FU overdue` : ' - on track'}</div>
                  </div>
                  <div className="text-[12px] font-mono font-medium">{formatRpShort(ae.rev)}</div>
                </div>
              ))}
              {data.leaderboard.length === 0 && (
                <div className="text-center text-gray-400 text-[12px] py-4">Belum ada data AE.</div>
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Forecast */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-[13px] font-semibold">Forecast Pipeline</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Weighted - excl. Won & Lost</div>
          </div>
          <div className="p-4">
            <div className="text-[11px] text-gray-400 mb-2">SUM(deal_value x probability)</div>
            <div className="text-[22px] font-bold font-mono">{formatRpShort(data.pipeline.weightedTotal)}</div>
            <div className="text-[11.5px] text-gray-500 mb-3">{data.pipeline.activeDealCount} deals aktif</div>
            <div className="flex flex-col gap-[6px]">
              {data.pipeline.byStage.map((ps) => (
                <div key={ps.stage} className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-500 w-[80px]">{ps.stage}</span>
                  <span className="font-mono font-medium flex-1">{formatRpShort(ps.total)}</span>
                  <span className="text-gray-400">{ps.count} deals · {ps.probability}%</span>
                </div>
              ))}
              {data.pipeline.byStage.length === 0 && (
                <div className="text-center text-gray-400 text-[12px] py-4">Tidak ada deal aktif.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding Invoices */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
          <div>
            <div className="text-[13px] font-semibold">Outstanding Invoices (AR)</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Urut jatuh tempo terdekat</div>
          </div>
          <button className="text-[11.5px] px-2.5 py-1 rounded-md border border-black/10 hover:bg-gray-100">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black/5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="w-6 px-3 py-2.5"></th>
                <th className="text-left px-3 py-2.5">Client</th>
                <th className="text-left px-3 py-2.5">Project</th>
                <th className="text-left px-3 py-2.5">Nominal</th>
                <th className="text-left px-3 py-2.5">Jatuh Tempo</th>
                <th className="text-left px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.arInvoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">Tidak ada outstanding invoice.</td></tr>
              ) : (
                data.arInvoices.map((inv) => {
                  const badge = statusBadge(inv);
                  const dueDate = new Date(inv.jatuhTempo);
                  const dueStr = dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                  return (
                    <tr key={inv.id} onClick={() => router.push(`/invoices?search=${encodeURIComponent(inv.client)}`)} className="border-b border-black/5 hover:bg-gray-50/50 cursor-pointer">
                      <td className="px-3 py-2.5"><div className={`w-2 h-2 rounded-full ${statusDot(inv)}`} /></td>
                      <td className="px-3 py-2.5 font-medium">{inv.client}</td>
                      <td className="px-3 py-2.5 text-gray-500">{inv.project || '-'}</td>
                      <td className="px-3 py-2.5 font-mono">{formatRp(inv.nominal)}</td>
                      <td className={`px-3 py-2.5 font-mono ${inv.status === 'overdue' ? 'text-red-600' : ''}`}>{dueStr}</td>
                      <td className="px-3 py-2.5"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
