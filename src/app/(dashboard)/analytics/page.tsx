'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface MonthlyRev { bulan: string; monthLabel: string; total: number }
interface FunnelItem { stage: string; count: number; color: string }
interface SvcRev { service: string; total: number; pct: number; colorHex: string }
interface SourceItem { source: string; dealCount: number; totalValue: number; winRate: number; avgDealValue: number; pct: number; isBest: boolean }

interface AnalyticsData {
  dealStats: { totalDealsYTD: number; avgDealSize: number; winRate: number; avgCloseTime: number; wonCount: number; lostCount: number };
  monthlyRevenue: MonthlyRev[];
  revenueSummary: { thisMonthRevenue: number; prevMonthRevenue: number; vsLastMonthPct: number; ytdRevenue: number; annualTarget: number; targetPct: number };
  funnel: FunnelItem[];
  funnelMetrics: { conversion: number; leadToContact: number; negoToDeal: number; lostRate: number };
  revenuePerService: SvcRev[];
  sourceAnalysis: SourceItem[];
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function formatRpShort(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
  return formatRp(n);
}

function pctStr(n: number) {
  return n > 0 ? `+${Math.round(n)}%` : `${Math.round(n)}%`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-center text-gray-400 text-[13px]">Gagal memuat data.</div>;
  }

  const { dealStats, monthlyRevenue, revenueSummary, funnel, funnelMetrics, revenuePerService, sourceAnalysis } = data;
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.total), 1);

  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const thisMonthLabel = monthNames[now.getMonth()];

  const maxFunnelCount = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="p-[20px_24px] flex flex-col gap-[16px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Analytics</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Hanya invoice Paid yang dihitung sebagai revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold">{thisMonthLabel} {now.getFullYear()}</span>
          <select className="text-[11.5px] border border-black/10 rounded-lg px-2 py-1.5 bg-white focus:outline-none" defaultValue="monthly">
            <option value="monthly">Bulanan</option>
            <option value="quarterly">Kuartalan</option>
            <option value="yearly">Tahunan</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
          <div className="text-[11px] text-gray-400">Total Deals YTD</div>
          <div className="text-[16px] font-bold font-mono mt-0.5">{dealStats.totalDealsYTD}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">{dealStats.wonCount} won · {dealStats.lostCount} lost</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-green-500" />
          <div className="text-[11px] text-gray-400">Avg Deal Size</div>
          <div className="text-[16px] font-bold font-mono mt-0.5 text-green-600">{formatRpShort(dealStats.avgDealSize)}</div>
          <div className="text-[10px] text-green-600 mt-0.5">per deal won</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-purple-500" />
          <div className="text-[11px] text-gray-400">Win Rate</div>
          <div className="text-[16px] font-bold font-mono mt-0.5 text-purple-600">{dealStats.winRate}%</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Target: 65%</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500" />
          <div className="text-[11px] text-gray-400">Avg Close Time</div>
          <div className="text-[16px] font-bold font-mono mt-0.5 text-amber-600">{dealStats.avgCloseTime} hari</div>
          <div className="text-[10px] text-amber-600 mt-0.5">dari lead to won</div>
        </div>
      </div>

      {/* Revenue per Bulan vs Target */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
          <div>
            <div className="text-[13px] font-semibold">Revenue per Bulan vs Target</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Hanya invoice Paid - batang biru = actual, garis = target</div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-end gap-[6px] h-[110px] mb-2">
            {monthlyRevenue.map((m) => {
              const h = Math.max((m.total / maxRevenue) * 100, 4);
              const isCurrent = m.bulan === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
              return (
                <div key={m.bulan} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm transition-opacity hover:opacity-70 cursor-pointer"
                    style={{ height: `${h}%`, minHeight: '4px', background: isCurrent ? '#2563EB' : '#93C5FD' }}
                    title={`${m.monthLabel}: ${formatRpShort(m.total)}`}
                  />
                  <div className={`text-[9px] font-mono ${isCurrent ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{m.monthLabel}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 flex-wrap pt-2.5 border-t border-black/5">
            <div className="text-center">
              <div className="text-[16px] font-bold font-mono text-blue-600">{formatRpShort(revenueSummary.thisMonthRevenue)}</div>
              <div className="text-[10px] text-gray-400">{thisMonthLabel} (bulan ini)</div>
            </div>
            <div className="text-center">
              <div className={`text-[16px] font-bold font-mono ${revenueSummary.vsLastMonthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pctStr(revenueSummary.vsLastMonthPct)}
              </div>
              <div className="text-[10px] text-gray-400">vs bulan lalu</div>
            </div>
            <div className="text-center">
              <div className="text-[16px] font-bold font-mono">{formatRpShort(revenueSummary.ytdRevenue)}</div>
              <div className="text-[10px] text-gray-400">YTD ({monthNames[0]}-{thisMonthLabel})</div>
            </div>
            <div className="text-center">
              <div className="text-[16px] font-bold font-mono text-amber-600">{revenueSummary.targetPct}%</div>
              <div className="text-[10px] text-gray-400">progress target {formatRpShort(revenueSummary.annualTarget)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Bulanan vs Bulan Sebelumnya */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
          <div>
            <div className="text-[13px] font-semibold">Revenue Bulanan vs Bulan Sebelumnya</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Perbandingan bulan ke bulan - hanya invoice Paid</div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {monthlyRevenue.slice(-6).map((m) => {
              const h = Math.max((m.total / maxRevenue) * 100, 4);
              return (
                <div key={m.bulan} className="flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm bg-blue-500 hover:opacity-70 cursor-pointer transition-opacity" style={{ height: `${h}px`, minHeight: '4px' }} />
                  <div className="text-[9px] font-mono text-gray-400">{m.monthLabel}</div>
                  <div className="text-[9px] font-mono text-gray-500">{formatRpShort(m.total)}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-5 flex-wrap pt-2.5 border-t border-black/5">
            <div className="text-center">
              <div className={`text-[17px] font-bold font-mono ${revenueSummary.vsLastMonthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pctStr(revenueSummary.vsLastMonthPct)}
              </div>
              <div className="text-[10px] text-gray-400">vs Bulan Lalu</div>
            </div>
            <div className="text-center">
              <div className="text-[17px] font-bold font-mono text-blue-600">+0%</div>
              <div className="text-[10px] text-gray-400">vs Tahun Lalu</div>
            </div>
            <div className="text-center">
              <div className="text-[17px] font-bold font-mono">{formatRpShort(revenueSummary.thisMonthRevenue)}</div>
              <div className="text-[10px] text-gray-400">Bulan Ini</div>
            </div>
            <div className="text-center">
              <div className="text-[17px] font-bold font-mono text-gray-500">{formatRpShort(revenueSummary.prevMonthRevenue)}</div>
              <div className="text-[10px] text-gray-400">Bulan Lalu</div>
            </div>
            <div className="ml-auto text-[11.5px] text-gray-600 self-center max-w-[300px]">
              Revenue {thisMonthLabel} {now.getFullYear()} {revenueSummary.vsLastMonthPct >= 0 ? `naik ${Math.abs(revenueSummary.vsLastMonthPct)}%` : `turun ${Math.abs(revenueSummary.vsLastMonthPct)}%`} dibanding bulan sebelumnya.
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: Funnel + Revenue per Service */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-[13px] font-semibold">Conversion Funnel</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Lead ke Deal Won</div>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-[6px]">
              {funnel.map((f) => {
                const pct = Math.round((f.count / maxFunnelCount) * 100);
                return (
                  <div key={f.stage} className="flex items-center gap-2">
                    <div className="text-[11.5px] text-gray-500 w-[96px] shrink-0">{f.stage}</div>
                    <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full flex items-center px-2 transition-all"
                        style={{ width: `${Math.max(pct, 8)}%`, background: f.color }}
                      >
                        <span className="text-[10.5px] font-semibold text-white">{f.count}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 w-6 text-right shrink-0">{f.count}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 flex-wrap mt-3 pt-2.5 border-t border-black/5">
              <div className="text-center">
                <div className="text-[16px] font-bold font-mono text-green-600">{Math.round(funnelMetrics.conversion)}%</div>
                <div className="text-[10px] text-gray-400">Conversion</div>
              </div>
              <div className="text-center">
                <div className="text-[16px] font-bold font-mono">{Math.round(funnelMetrics.leadToContact)}%</div>
                <div className="text-[10px] text-gray-400">Lead→Contact</div>
              </div>
              <div className="text-center">
                <div className="text-[16px] font-bold font-mono">{Math.round(funnelMetrics.negoToDeal)}%</div>
                <div className="text-[10px] text-gray-400">Nego→Deal</div>
              </div>
              <div className="text-center">
                <div className="text-[16px] font-bold font-mono text-red-600">{Math.round(funnelMetrics.lostRate)}%</div>
                <div className="text-[10px] text-gray-400">Lost Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue per Service */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-[13px] font-semibold">Revenue per Layanan</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{now.getFullYear()} YTD</div>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-3">
              {revenuePerService.map((svc) => (
                <div key={svc.service} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: svc.colorHex }} />
                  <div className="text-[12px] text-gray-700 w-[100px] shrink-0">{svc.service}</div>
                  <div className="flex-1 h-[18px] bg-gray-100 rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${svc.pct}%`, background: svc.colorHex }} />
                  </div>
                  <div className="text-[11px] font-mono text-gray-600 w-[80px] text-right shrink-0">{formatRpShort(svc.total)}</div>
                </div>
              ))}
            </div>
            {revenuePerService.length > 0 && (
              <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-[11.5px] font-semibold text-amber-800 mb-1">Insight</div>
                <div className="text-[11.5px] text-amber-700">
                  {revenuePerService[0]?.service} dominasi revenue — pertimbangkan push layanan lain di H2 {now.getFullYear()}.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Source Analysis */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[13px] font-semibold">Analisis Sumber Lead</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Mana channel yang paling profitable?</div>
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-3">
            {sourceAnalysis.map((src) => (
              <div key={src.source}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12.5px] font-medium">{src.source}</span>
                  <span className="text-[12px] font-mono">{src.dealCount} deals · {formatRpShort(src.totalValue)}</span>
                </div>
                <div className="h-[6px] bg-gray-100 rounded overflow-hidden">
                  <div className={`h-full rounded ${src.isBest ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${src.pct}%` }} />
                </div>
                <div className={`text-[10.5px] mt-0.5 ${src.isBest ? 'text-green-600' : 'text-blue-600'}`}>
                  Win rate {src.winRate}% · avg deal {formatRpShort(src.avgDealValue)}{src.isBest ? ' — TERBAIK' : ''}
                </div>
              </div>
            ))}
            {sourceAnalysis.length === 0 && (
              <div className="text-center text-gray-400 text-[12px] py-4">Belum ada data sumber lead.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
