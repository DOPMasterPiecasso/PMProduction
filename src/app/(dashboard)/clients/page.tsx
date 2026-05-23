'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────
interface Client {
  id: string;
  namaKlien: string;
  namaContact: string | null;
  noHp: string | null;
  email: string | null;
  tags: string | null;
  status: string;
  nextFuDate: string | null;
  catatan: string | null;
  invoiceAccessCode: string | null;
  clientType: { id: string; nama: string } | null;
  kota: { id: string; nama: string } | null;
  source: { id: string; nama: string } | null;
  service: { id: string; nama: string; colorHex: string } | null;
}
interface MetaOption { id: string; nama: string; }
interface MetaService extends MetaOption { colorHex: string; }
interface MetaCity extends MetaOption { provinsi: string | null }
interface Meta {
  clientTypes: MetaOption[];
  cities: MetaCity[];
  sources: MetaOption[];
  services: MetaService[];
}

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  qualified:   { label: 'Qualified',   cls: 'bg-[#DCFCE7] text-[#16A34A]' },
  ongoing:     { label: 'Ongoing',     cls: 'bg-[#DBEAFE] text-[#2563EB]' },
  unqualified: { label: 'Unqualified', cls: 'bg-[#FEF9C3] text-[#A16207]' },
  closed:      { label: 'Closed',      cls: 'bg-[#F4F4F5] text-[#6B7280]' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>;
}

function svcBg(hex: string) {
  const map: Record<string, string> = {
    '#2563EB': '#EFF6FF', '#16A34A': '#F0FDF4',
    '#7C3AED': '#F5F3FF', '#D97706': '#FFFBEB', '#94A3B8': '#F8FAFC',
  };
  return map[hex] ?? '#F8FAFC';
}

// ─── Empty Form ────────────────────────────────────────────────
function emptyForm() {
  return { namaKlien: '', clientTypeId: '', kotaId: '', namaContact: '', noHp: '', email: '', sourceId: '', serviceId: '', tags: '', status: 'unqualified', nextFuDate: '', catatan: '', invoiceAccessCode: '' };
}

// ─── Client Form Modal ────────────────────────────────────────
function ClientModal({
  meta,
  editing,
  onClose,
  onSaved,
}: {
  meta: Meta;
  editing: Client | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() => {
    if (editing) {
      return {
        namaKlien: editing.namaKlien,
        clientTypeId: editing.clientType?.id ?? '',
        kotaId: editing.kota?.id ?? '',
        namaContact: editing.namaContact ?? '',
        noHp: editing.noHp ?? '',
        email: editing.email ?? '',
        sourceId: '',
        serviceId: editing.service?.id ?? '',
        tags: editing.tags ?? '',
        status: editing.status,
        nextFuDate: editing.nextFuDate ? editing.nextFuDate.slice(0, 10) : '',
        catatan: editing.catatan ?? '',
        invoiceAccessCode: editing.invoiceAccessCode ?? '',
      };
    }
    return emptyForm();
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.namaKlien.trim()) { toast.error('Nama klien wajib diisi'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/clients/${editing.id}` : '/api/clients';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error');
      toast.success(editing ? 'Klien berhasil diperbarui' : 'Klien berhasil ditambahkan');
      onSaved();
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  const inp = 'w-full text-[12px] border border-black/[0.1] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 text-[#18181B] placeholder:text-gray-300';
  const sel = inp;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold text-[#18181B]">{editing ? 'Edit Klien' : 'Tambah Klien Baru'}</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors text-[16px]">×</button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3 max-h-[72vh] overflow-y-auto">
          {/* Info hint */}
          <div className="text-[11.5px] text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            Masukkan semua kontak — qualified maupun belum. Kurasi status kapan saja.
          </div>

          {/* Nama Klien */}
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nama Klien *</label>
            <input placeholder="SMA Nusantara Jaya" value={form.namaKlien} onChange={(e) => set('namaKlien', e.target.value)} className={inp} />
          </div>

          {/* Tipe & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Tipe</label>
              <select value={form.clientTypeId} onChange={(e) => set('clientTypeId', e.target.value)} className={sel}>
                <option value="">— Pilih Tipe —</option>
                {meta.clientTypes.map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={sel}>
                <option value="unqualified">Unqualified</option>
                <option value="qualified">Qualified</option>
                <option value="ongoing">Ongoing</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Kota & Layanan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Kota</label>
              <select value={form.kotaId} onChange={(e) => set('kotaId', e.target.value)} className={sel}>
                <option value="">— Pilih Kota —</option>
                {meta.cities.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Layanan</label>
              <select value={form.serviceId} onChange={(e) => set('serviceId', e.target.value)} className={sel}>
                <option value="">— Pilih Layanan —</option>
                {meta.services.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>
          </div>

          {/* Contact Person & HP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nama Contact</label>
              <input placeholder="Pak Budi" value={form.namaContact} onChange={(e) => set('namaContact', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">No. HP</label>
              <input placeholder="0812-3456-7890" value={form.noHp} onChange={(e) => set('noHp', e.target.value)} className={inp} />
            </div>
          </div>

          {/* Email & Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Email</label>
              <input type="email" placeholder="budi@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Sumber Lead</label>
              <select value={form.sourceId} onChange={(e) => set('sourceId', e.target.value)} className={sel}>
                <option value="">— Pilih Source —</option>
                {meta.sources.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>
          </div>

          {/* Tags & Next FU */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Tags</label>
              <input placeholder="yearbook, loyal" value={form.tags} onChange={(e) => set('tags', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Next Follow-Up</label>
              <input type="date" value={form.nextFuDate} onChange={(e) => set('nextFuDate', e.target.value)} className={inp} />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Catatan</label>
            <textarea rows={2} placeholder="Catatan tambahan..." value={form.catatan} onChange={(e) => set('catatan', e.target.value)} className={`${inp} resize-none`} />
          </div>

          {/* Invoice Access Code */}
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Kode Akses Invoice</label>
            <div className="flex gap-2">
              <input placeholder="Kosongkan jika tidak perlu proteksi" value={form.invoiceAccessCode} onChange={(e) => set('invoiceAccessCode', e.target.value)} className={`${inp} flex-1`} />
              <button type="button" onClick={() => { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code = ''; for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]; set('invoiceAccessCode', code); }}
                className="px-3 py-2 text-[11px] font-medium rounded-lg border border-black/[0.1] text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
              >Generate</button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Client harus memasukkan kode ini untuk melihat invoice. Biarkan kosong jika tidak ingin proteksi.</p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-black/[0.06] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium rounded-lg border border-black/[0.1] text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 text-[12px] font-medium rounded-lg bg-[#18181B] text-white hover:bg-[#27272A] transition-colors disabled:opacity-60">
            {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Klien'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────
function DeleteModal({ client, onClose, onDeleted }: { client: Client; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(`${client.namaKlien} berhasil dihapus`);
      onDeleted();
      onClose();
    } catch {
      toast.error('Gagal menghapus klien');
    } finally {
      setDeleting(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <div className="text-[14px] font-semibold text-[#18181B]">Hapus Klien</div>
        <p className="text-[12.5px] text-gray-500">Yakin ingin menghapus <strong>{client.namaKlien}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium rounded-lg border border-black/[0.1] text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-[12px] font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60">
            {deleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterKota, setFilterKota] = useState('');
  const [filterProvinsi, setFilterProvinsi] = useState('');
  const [filterService, setFilterService] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchClients = useCallback(async (q = search, s = filterStatus, t = filterType, k = filterKota, p = filterProvinsi, sv = filterService) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (s) params.set('status', s);
      if (t) params.set('type', t);
      if (k) params.set('kota', k);
      if (p) params.set('provinsi', p);
      if (sv) params.set('serviceId', sv);
      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClients(data.clients);
      if (!meta) setMeta(data.meta);
    } catch {
      toast.error('Gagal memuat data klien');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterType, filterKota, filterProvinsi, filterService, meta]);

  useEffect(() => { fetchClients(); }, []);

  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchClients(val, filterStatus, filterType, filterKota, filterProvinsi, filterService), 400);
  }

  function handleFilterStatus(val: string) {
    setFilterStatus(val);
    fetchClients(search, val, filterType, filterKota, filterProvinsi, filterService);
  }

  function handleFilterType(val: string) {
    setFilterType(val);
    fetchClients(search, filterStatus, val, filterKota, filterProvinsi, filterService);
  }

  function handleFilterKota(val: string) {
    setFilterKota(val);
    fetchClients(search, filterStatus, filterType, val, filterProvinsi, filterService);
  }

  function handleFilterProvinsi(val: string) {
    setFilterProvinsi(val);
    fetchClients(search, filterStatus, filterType, filterKota, val, filterService);
  }

  function handleFilterService(val: string) {
    setFilterService(val);
    fetchClients(search, filterStatus, filterType, filterKota, filterProvinsi, val);
  }

  // Stats
  const stats = {
    total: clients.length,
    qualified: clients.filter((c) => c.status === 'qualified').length,
    ongoing: clients.filter((c) => c.status === 'ongoing').length,
    unqualified: clients.filter((c) => c.status === 'unqualified').length,
    closed: clients.filter((c) => c.status === 'closed').length,
  };

  async function exportCSV() {
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const allClients: Client[] = data.clients;

      const headers = ['Nama Klien', 'Tipe', 'Kota', 'Contact Person', 'No. HP', 'Email', 'Sumber', 'Layanan', 'Tags', 'Status', 'Next Follow-Up', 'Catatan'];
      const rows = allClients.map((c) => [
        c.namaKlien,
        c.clientType?.nama || '',
        c.kota?.nama || '',
        c.namaContact || '',
        c.noHp || '',
        c.email || '',
        '',
        c.service?.nama || '',
        c.tags || '',
        c.status,
        c.nextFuDate ? new Date(c.nextFuDate).toLocaleDateString('id-ID') : '',
        c.catatan || '',
      ]);

      let csv = '\uFEFF';
      csv += headers.join(',') + '\n';
      rows.forEach((row) => {
        csv += row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-klien-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Berhasil mengekspor ${allClients.length} klien`);
    } catch {
      toast.error('Gagal mengekspor CSV');
    }
  }

  return (
    <>
      {/* Modals */}
      {showModal && meta && (
        <ClientModal
          meta={meta}
          editing={editingClient}
          onClose={() => { setShowModal(false); setEditingClient(null); }}
          onSaved={() => fetchClients()}
        />
      )}
      {deletingClient && (
        <DeleteModal
          client={deletingClient}
          onClose={() => setDeletingClient(null)}
          onDeleted={() => fetchClients()}
        />
      )}

      <div className="p-[12px_16px] md:p-6 flex flex-col gap-4 md:gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight text-[#18181B]">Database Klien</h1>
            <p className="text-[11.5px] text-gray-400 mt-0.5">Masukkan semua kontak — kurasi status qualified/unqualified</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 text-[12px] font-medium rounded-lg border border-black/[0.1] text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => { setEditingClient(null); setShowModal(true); }}
              className="inline-flex items-center gap-1.5 bg-[#18181B] text-white text-[12px] font-medium px-3.5 py-2 rounded-lg hover:bg-[#27272A] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
              Tambah Klien
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { label: 'Total Database', val: stats.total, color: '#18181B' },
            { label: 'Qualified',      val: stats.qualified,   color: '#16A34A' },
            { label: 'Ongoing',        val: stats.ongoing,     color: '#2563EB' },
            { label: 'Unqualified',    val: stats.unqualified, color: '#D97706' },
            { label: 'Closed',         val: stats.closed,      color: '#9CA3AF' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-black/[0.06] rounded-xl px-4 py-3 shadow-sm" style={{ borderTop: `2px solid ${s.color}` }}>
              <div className="text-[18px] font-bold font-mono" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[10.5px] text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-white border border-black/[0.08] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              placeholder="Cari nama, kota, tags..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="text-[12px] bg-transparent outline-none flex-1 text-[#18181B] placeholder:text-gray-300"
            />
          </div>
          <select value={filterStatus} onChange={(e) => handleFilterStatus(e.target.value)} className="text-[12px] border border-black/[0.08] rounded-lg px-3 py-2 bg-white text-[#18181B] focus:outline-none">
            <option value="">Semua Status</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
            <option value="ongoing">Ongoing</option>
            <option value="closed">Closed</option>
          </select>
          <select value={filterType} onChange={(e) => handleFilterType(e.target.value)} className="text-[12px] border border-black/[0.08] rounded-lg px-3 py-2 bg-white text-[#18181B] focus:outline-none">
            <option value="">Semua Tipe</option>
            {meta?.clientTypes.map((t) => <option key={t.id} value={t.nama}>{t.nama}</option>)}
          </select>
          <select value={filterKota} onChange={(e) => handleFilterKota(e.target.value)} className="text-[12px] border border-black/[0.08] rounded-lg px-3 py-2 bg-white text-[#18181B] focus:outline-none">
            <option value="">Semua Kota</option>
            {meta?.cities.map((c) => <option key={c.id} value={c.nama}>{c.nama}</option>)}
          </select>
          <select value={filterProvinsi} onChange={(e) => handleFilterProvinsi(e.target.value)} className="text-[12px] border border-black/[0.08] rounded-lg px-3 py-2 bg-white text-[#18181B] focus:outline-none">
            <option value="">Semua Provinsi</option>
            {meta?.cities.filter((c, i, a) => c.provinsi && a.findIndex(x => x.provinsi === c.provinsi) === i).map((c) => (
              <option key={c.id} value={c.provinsi!}>{c.provinsi}</option>
            ))}
          </select>
          <select value={filterService} onChange={(e) => handleFilterService(e.target.value)} className="text-[12px] border border-black/[0.08] rounded-lg px-3 py-2 bg-white text-[#18181B] focus:outline-none">
            <option value="">Semua Layanan</option>
            {meta?.services.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-black/[0.06] rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-14">
              <div className="w-7 h-7 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-[13px]">
              <div className="text-3xl mb-2">🗂️</div>
              {search || filterStatus || filterType ? 'Tidak ada klien yang cocok dengan filter.' : 'Belum ada klien. Klik "+ Tambah Klien" untuk memulai.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-black/[0.06] text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-4 py-3">Nama Klien</th>
                    <th className="text-left px-4 py-3">Tipe</th>
                    <th className="text-left px-4 py-3">Kota</th>
                    <th className="text-left px-4 py-3">Contact</th>
                    <th className="text-left px-4 py-3">No. HP</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Sumber</th>
                    <th className="text-left px-4 py-3">Layanan</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Next FU</th>
                    <th className="text-right px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b border-black/[0.04] hover:bg-gray-50/60 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#18181B]">{c.namaKlien}</div>
                        {c.tags && (
                          <div className="text-[10px] text-gray-400 mt-0.5">{c.tags}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{c.clientType?.nama ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{c.kota?.nama ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{c.namaContact ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-gray-500">{c.noHp ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{c.email ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{c.source?.nama ?? '—'}</td>
                      <td className="px-4 py-3">
                        {c.service ? (
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: svcBg(c.service.colorHex), color: c.service.colorHex }}
                          >
                            {c.service.nama}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-gray-400">
                        {c.nextFuDate ? (
                          <span className={new Date(c.nextFuDate) < new Date() ? 'text-red-500 font-medium' : ''}>
                            {new Date(c.nextFuDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => { setEditingClient(c); setShowModal(true); }}
                            className="text-[11px] px-2.5 py-1 rounded-md border border-black/[0.08] text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingClient(c)}
                            className="text-[11px] px-2.5 py-1 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2.5 bg-[#F9F9FB] border-t border-black/[0.04] text-[11px] text-gray-400">
                Menampilkan {clients.length} klien.{' '}
                {clients.filter((c) => c.status === 'unqualified').length > 0 && (
                  <span>Status &quot;Unqualified&quot; = kontak potensial yang belum siap diprospek.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
