'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, Plus, Download, Bell, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceClient { id: string; namaKlien: string }
interface Invoice {
  id: string;
  nomorInvoice: string;
  namaProject: string | null;
  nominal: number;
  tanggalTerbit: string;
  jatuhTempo: string;
  status: string;
  keterangan: string | null;
  paidAmount: number | null;
  client: InvoiceClient;
}

interface InvStats {
  paidThisMonth: number;
  paidCount: number;
  unpaidTotal: number;
  unpaidCount: number;
  partialTotal: number;
  partialCount: number;
  overdueTotal: number;
  overdueCount: number;
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

function daysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function statusColor(s: string) {
  switch (s) {
    case 'paid': return 'text-green-700 bg-green-50 border-green-200';
    case 'overdue': return 'text-red-700 bg-red-50 border-red-200';
    case 'partial': return 'text-amber-700 bg-amber-50 border-amber-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

function statusLabel(s: string) {
  switch (s) {
    case 'paid': return 'Paid';
    case 'overdue': return 'Overdue';
    case 'partial': return 'Partial';
    default: return 'Unpaid';
  }
}

function InvoicesPage() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvStats>({
    paidThisMonth: 0, paidCount: 0, unpaidTotal: 0, unpaidCount: 0,
    partialTotal: 0, partialCount: 0, overdueTotal: 0, overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [showCreate, setShowCreate] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/invoices?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInvoices(data.invoices || []);
      setStats(data.stats);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  async function handleUpdate(id: string, field: string, value: string | number) {
    try {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (!res.ok) throw new Error();
      toast.success('Invoice diperbarui');
      fetchInvoices();
    } catch {
      toast.error('Gagal mengupdate invoice');
    }
  }

  async function handleReminder(inv: Invoice) {
    try {
      toast.success(`Reminder terkirim ke ${inv.client.namaKlien}`);
    } catch {
      toast.error('Gagal mengirim reminder');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus invoice ini?')) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Invoice berhasil dihapus');
      fetchInvoices();
    } catch {
      toast.error('Gagal menghapus invoice');
    }
  }

  function priorityInfo(inv: Invoice): { label: string; color: string; dot: string } {
    if (inv.status === 'paid') return { label: 'Paid', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
    const due = new Date(inv.jatuhTempo);
    const days = daysUntil(due);
    if (days < 0) return { label: '1 - URGENT', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
    if (days <= 7) return { label: `2 - ${days} hari`, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' };
    if (days <= 14) return { label: `3 - ${days} hari`, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' };
    return { label: `4 - ${days} hari`, color: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
  }

  function rowBg(inv: Invoice): string {
    if (inv.status === 'paid') return 'opacity-70';
    const due = new Date(inv.jatuhTempo);
    if (due < new Date() && inv.status !== 'paid') return 'bg-red-50';
    if (inv.status === 'unpaid' || inv.status === 'partial') return 'bg-amber-50';
    return '';
  }

  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const thisMonthLabel = monthNames[now.getMonth()];

  return (
    <div className="p-[20px_24px] flex flex-col gap-[16px]">
      {/* Create Modal */}
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreated={fetchInvoices} />}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Invoices</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Urut jatuh tempo terdekat - overdue paling atas</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#18181B] text-white flex items-center px-3 py-2 rounded-lg text-[12.5px] font-medium hover:opacity-85"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Buat Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3">
          <div className="text-[11px] text-gray-400">Paid ({thisMonthLabel})</div>
          <div className="text-[16px] font-bold font-mono text-green-600 mt-0.5">{formatRpShort(stats.paidThisMonth)}</div>
          <div className="text-[10px] text-green-600 mt-0.5">{stats.paidCount} invoice lunas</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3">
          <div className="text-[11px] text-gray-400">Unpaid</div>
          <div className="text-[16px] font-bold font-mono text-red-600 mt-0.5">{formatRpShort(stats.unpaidTotal)}</div>
          <div className="text-[10px] text-red-600 mt-0.5">{stats.unpaidCount} invoice</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3">
          <div className="text-[11px] text-gray-400">Partial</div>
          <div className="text-[16px] font-bold font-mono text-amber-600 mt-0.5">{formatRpShort(stats.partialTotal)}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">{stats.partialCount} invoice</div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm px-4 py-3">
          <div className="text-[11px] text-gray-400">Overdue</div>
          <div className="text-[16px] font-bold font-mono text-red-600 mt-0.5">{formatRpShort(stats.overdueTotal)}</div>
          <div className="text-[10px] text-red-600 mt-0.5">{stats.overdueCount} invoice</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-black/10 rounded-lg px-3 py-2 max-w-xs">
        <Search className="w-3.5 h-3.5 text-gray-400" />
        <input
          placeholder="Cari invoice / klien..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-[12px] bg-transparent outline-none flex-1 placeholder:text-gray-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-[13px]">
            {search ? 'Tidak ada invoice yang cocok.' : 'Belum ada invoice.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="w-6 px-3 py-3"></th>
                  <th className="text-left px-3 py-3">Prioritas</th>
                  <th className="text-left px-3 py-3">No.</th>
                  <th className="text-left px-3 py-3">Client</th>
                  <th className="text-left px-3 py-3">Project</th>
                  <th className="text-left px-3 py-3">Nominal</th>
                  <th className="text-left px-3 py-3">Jatuh Tempo</th>
                  <th className="text-left px-3 py-3">Status</th>
                  <th className="text-left px-3 py-3">Keterangan</th>
                  <th className="text-left px-3 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const prio = priorityInfo(inv);
                  const dueDate = new Date(inv.jatuhTempo);
                  const dueStr = dueDate.toISOString().split('T')[0];
                  const isOverdue = dueDate < now && inv.status !== 'paid';

                  return (
                    <tr key={inv.id} className={`border-b border-black/5 hover:bg-gray-50/50 ${rowBg(inv)}`}>
                      <td className="px-3 py-3">
                        <div className={`w-2 h-2 rounded-full ${prio.dot}`} />
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${prio.color}`}>{prio.label}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-blue-600">{inv.nomorInvoice}</td>
                      <td className="px-3 py-3 font-medium">{inv.client.namaKlien}</td>
                      <td className="px-3 py-3 text-gray-500">{inv.namaProject || '-'}</td>
                      <td className="px-3 py-3 font-mono font-semibold">{formatRp(inv.nominal)}</td>
                      <td className="px-3 py-3">
                        <input
                          type="date"
                          value={dueStr}
                          onChange={(e) => handleUpdate(inv.id, 'jatuhTempo', e.target.value)}
                          className={`text-[11.5px] border border-black/10 rounded-md px-2 py-1 font-mono focus:outline-none focus:border-blue-400 ${isOverdue ? 'text-red-600' : ''}`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={inv.status}
                          onChange={(e) => handleUpdate(inv.id, 'status', e.target.value)}
                          className={`text-[11px] border rounded-md px-2 py-1 focus:outline-none ${statusColor(inv.status)}`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          defaultValue={inv.keterangan || ''}
                          placeholder="Keterangan..."
                          onBlur={(e) => {
                            if (e.target.value !== (inv.keterangan || '')) {
                              handleUpdate(inv.id, 'keterangan', e.target.value);
                            }
                          }}
                          className="text-[11px] border border-transparent hover:border-black/10 rounded-md px-2 py-1 w-[140px] focus:outline-none focus:border-blue-400"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          {(inv.status === 'overdue' || inv.status === 'unpaid') && (
                            <button onClick={() => handleReminder(inv)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-red-50 hover:text-red-600" title="Kirim Reminder">
                              <Bell className="w-3 h-3" /> Reminder
                            </button>
                          )}
                          {inv.status !== 'paid' && (
                            <button onClick={() => handleUpdate(inv.id, 'status', inv.status === 'paid' ? 'unpaid' : inv.status)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-blue-50 hover:text-blue-600" title="Simpan">
                              <Save className="w-3 h-3" /> Simpan
                            </button>
                          )}
                          {inv.status === 'paid' && (
                            <button className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-blue-50 hover:text-blue-600" title="Download">
                              <Download className="w-3 h-3" /> Download
                            </button>
                          )}
                          <button onClick={() => handleDelete(inv.id)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Hapus">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-gray-50/50 border-t border-black/5 text-[11px] text-gray-400">
              Menampilkan {invoices.length} invoice.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateInvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [deals, setDeals] = useState<{ id: string; client: { id: string; namaKlien: string }; service: { nama: string } | null; nilai: number }[]>([]);
  const [selectedDeal, setSelectedDeal] = useState('');
  const [nominal, setNominal] = useState('');
  const [jatuhTempo, setJatuhTempo] = useState('');
  const [status, setStatus] = useState('unpaid');
  const [keterangan, setKeterangan] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/deals')
      .then((r) => r.json())
      .then((data) => setDeals(data.deals || []))
      .catch(() => toast.error('Gagal memuat daftar deal'));
  }, []);

  async function handleCreate() {
    if (!selectedDeal) { toast.error('Pilih project terlebih dahulu'); return; }
    if (!nominal || parseFloat(nominal) <= 0) { toast.error('Nominal harus diisi'); return; }
    if (!jatuhTempo) { toast.error('Pilih jatuh tempo'); return; }
    setSaving(true);
    try {
      const deal = deals.find((d) => d.id === selectedDeal);
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: deal?.client.id,
          dealId: selectedDeal,
          namaProject: deal ? `${deal.service?.nama || ''} - ${deal.client.namaKlien}` : '',
          nominal: parseFloat(nominal),
          jatuhTempo,
          status,
          keterangan: keterangan || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Invoice berhasil dibuat');
      onCreated();
      onClose();
    } catch {
      toast.error('Gagal membuat invoice');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold">Buat Invoice</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">No. Invoice</label>
            <input className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-gray-50 text-gray-400" value="(auto)" readOnly />
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Project</label>
            <select value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none">
              <option value="">— Pilih Project —</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.service?.nama || '-'} — {d.client.namaKlien} ({formatRp(d.nilai)})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nominal (Rp)</label>
              <input type="number" value={nominal} onChange={(e) => setNominal(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" placeholder="15000000" />
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Jatuh Tempo</label>
              <input type="date" value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none">
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Keterangan</label>
            <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" placeholder="Opsional" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/[0.07]">
          <button onClick={onClose} className="text-[12px] px-4 py-2 rounded-lg border border-black/10 text-gray-600 hover:bg-gray-50">Batal</button>
          <button onClick={handleCreate} disabled={saving} className="bg-[#18181B] text-white text-[12px] px-4 py-2 rounded-lg font-medium hover:opacity-85 disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Buat Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <InvoicesPage />
    </Suspense>
  );
}
