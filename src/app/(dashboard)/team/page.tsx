'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string; name: string; av: string; bg: string; c: string;
  deals: number; rev: number; act: number; fu: number; ov: number;
  inactive: number; status: string;
  targetDeals: number; targetRevenue: number;
}

interface TeamData {
  teamData: TeamMember[];
  totals: { totalAct: number; totalFu: number; totalOv: number; totalDeals: number };
  alerts: { type: 'danger' | 'warn'; message: string }[];
  bulan: string;
  monthLabel: string;
}

function formatRpShort(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
  return `Rp ${n}`;
}

function statusBadge(status: string) {
  switch (status) {
    case 'warn': return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">FU Overdue</span>;
    case 'low': return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Low Activity</span>;
    default: return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">On Track</span>;
  }
}

export default function TeamPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filterAE, setFilterAE] = useState('');
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  const bulan = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthLabel = `${monthNames[month]} ${year}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/team?bulan=${bulan}`);
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

  const filteredData = data?.teamData.filter((d) => !filterAE || d.name.includes(filterAE)) || [];

  async function saveTarget(userId: string, targetDeals: number, targetRevenue: number) {
    try {
      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bulan, targetDeals, targetRevenue }),
      });
      if (!res.ok) throw new Error();
      toast.success('Target KPI disimpan');
      fetchData();
    } catch { toast.error('Gagal menyimpan target'); }
  }

  // Leaderboards
  const sortedByRev = [...(data?.teamData || [])].sort((a, b) => b.rev - a.rev);
  const sortedByAct = [...(data?.teamData || [])].sort((a, b) => b.act - a.act);
  const maxRev = sortedByRev[0]?.rev || 1;

  if (loading && !data) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="p-[12px_16px] md:p-[20px_24px] flex flex-col gap-[12px] md:gap-[16px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] md:text-[20px] font-semibold tracking-[-0.3px]">Tim & KPI</h1>
          <p className="text-[12px] md:text-[13px] text-gray-400 mt-0.5">Data otomatis per bulan - navigasi bulan di kanan</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-black/10 rounded-lg px-2 py-1.5">
            <button onClick={() => moveMonth(-1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="text-[12.5px] font-semibold min-w-[100px] text-center">{monthLabel}</span>
            <button onClick={() => moveMonth(1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <select value={filterAE} onChange={(e) => setFilterAE(e.target.value)} className="text-[11.5px] border border-black/10 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
            <option value="">Semua AE</option>
            {data?.teamData.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Alerts */}
      {data?.alerts.map((a, i) => (
        <div key={i} className={`text-[12px] px-4 py-2.5 rounded-lg border ${a.type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          {a.message}
        </div>
      ))}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
          <div className="text-[11px] text-gray-400">Total Aktivitas</div>
          <div className="text-[16px] font-bold font-mono mt-0.5">{data?.totals.totalAct || 0}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">bulan ini</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-green-500" />
          <div className="text-[11px] text-gray-400">FU Selesai</div>
          <div className="text-[16px] font-bold font-mono mt-0.5 text-green-600">{data?.totals.totalFu || 0}</div>
          <div className="text-[10px] text-green-600 mt-0.5">{data && data.totals.totalAct > 0 ? `${Math.round(data.totals.totalFu / data.totals.totalAct * 100)}% completion` : '-'}</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500" />
          <div className="text-[11px] text-gray-400">FU Overdue</div>
          <div className="text-[16px] font-bold font-mono mt-0.5 text-red-600">{data?.totals.totalOv || 0}</div>
          <div className="text-[10px] text-red-600 mt-0.5">perlu diselesaikan</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500" />
          <div className="text-[11px] text-gray-400">Deals Closed</div>
          <div className="text-[16px] font-bold font-mono mt-0.5 text-amber-600">{data?.totals.totalDeals || 0}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">bulan ini</div>
        </div>
      </div>

      {/* KPI per AE Table */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
          <div>
            <div className="text-[13px] font-semibold">KPI per AE</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{monthLabel} - data otomatis + target manual</div>
          </div>
          <div className="text-[11.5px] text-gray-400">Target KPI bisa diisi manual per AE</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black/5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="text-left px-4 py-3">AE</th>
                <th className="text-left px-4 py-3">Deals Actual</th>
                <th className="text-left px-4 py-3">Target Deals</th>
                <th className="text-left px-4 py-3">Revenue Actual</th>
                <th className="text-left px-4 py-3">Target Revenue</th>
                <th className="text-left px-4 py-3">Aktivitas</th>
                <th className="text-left px-4 py-3">FU Selesai</th>
                <th className="text-left px-4 py-3">FU Overdue</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-gray-400">Tidak ada data.</td></tr>
              ) : (
                filteredData.map((d) => (
                  <tr key={d.id} className="border-b border-black/5 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ background: d.bg, color: d.c }}>{d.av}</div>
                        <span className="text-[12.5px] font-medium">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-green-600 font-semibold">{d.deals}</td>
                    <td className="px-4 py-3">
                      <input
                        id={`td-${d.id}`}
                        type="number"
                        defaultValue={d.targetDeals}
                        className="w-[60px] text-[11px] border border-black/10 rounded-md px-2 py-1 font-mono focus:outline-none focus:border-blue-400"
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val !== d.targetDeals) saveTarget(d.id, val, d.targetRevenue);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">{formatRpShort(d.rev)}</td>
                    <td className="px-4 py-3">
                      <input
                        id={`tr-${d.id}`}
                        type="text"
                        defaultValue={`Rp ${d.targetRevenue.toLocaleString('id-ID')}`}
                        className="w-[100px] text-[11px] border border-black/10 rounded-md px-2 py-1 font-mono focus:outline-none focus:border-blue-400"
                        onBlur={(e) => {
                          const clean = e.target.value.replace(/[^0-9]/g, '');
                          const val = parseInt(clean);
                          if (!isNaN(val) && val !== d.targetRevenue) saveTarget(d.id, d.targetDeals, val);
                        }}
                      />
                    </td>
                    <td className={`px-4 py-3 font-mono ${d.act < 10 ? 'text-red-600 font-semibold' : ''}`}>{d.act}</td>
                    <td className="px-4 py-3 font-mono">{d.fu}</td>
                    <td className="px-4 py-3 font-mono">
                      <span className={d.ov > 0 ? 'text-amber-600' : 'text-green-600'}>{d.ov}</span>
                    </td>
                    <td className="px-4 py-3">{statusBadge(d.status)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          const dealsInput = document.getElementById(`td-${d.id}`) as HTMLInputElement;
                          const revInput = document.getElementById(`tr-${d.id}`) as HTMLInputElement;
                          const targetDeals = parseInt(dealsInput?.value || '0');
                          const clean = (revInput?.value || '').replace(/[^0-9]/g, '');
                          const targetRevenue = parseInt(clean) || 0;
                          saveTarget(d.id, targetDeals, targetRevenue);
                        }}
                        className="text-[10.5px] px-3 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-gray-100"
                      >
                        Simpan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-4 py-2.5 bg-gray-50/50 border-t border-black/5 text-[11px] text-gray-400">
            Menampilkan {filteredData.length} AE.
          </div>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Revenue Leaderboard */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-[13px] font-semibold">Revenue Leaderboard</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{monthLabel}</div>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-2">
              {sortedByRev.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0" style={{ background: d.bg, color: d.c }}>{d.av}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium">{d.name}</div>
                    <div className="h-[4px] bg-gray-100 rounded overflow-hidden mt-[3px]">
                      <div className="h-full rounded" style={{ width: `${Math.round((d.rev / maxRev) * 100)}%`, background: i === 0 ? '#F59E0B' : '#3B82F6' }} />
                    </div>
                  </div>
                  <div className="text-[12px] font-mono font-medium">{formatRpShort(d.rev)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Leaderboard */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-[13px] font-semibold">Activity Leaderboard</div>
            <div className="text-[11px] text-gray-400 mt-0.5">by jumlah aktivitas</div>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-2">
              {sortedByAct.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0" style={{ background: d.bg, color: d.c }}>{d.av}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium">{d.name}</div>
                    <div className="text-[10.5px] text-gray-400">{d.ov > 0 ? `${d.ov} FU overdue` : 'On track'}</div>
                  </div>
                  <div className="text-[12px] font-mono font-medium">{d.act}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
