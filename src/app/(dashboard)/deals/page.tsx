'use client';

import { useEffect, useState, useCallback, useRef, Fragment } from 'react';
import { Search, Loader2, ChevronDown, ChevronRight, Upload, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface DealClient {
  id: string; namaKlien: string; namaContact: string | null; noHp: string | null;
  kota: { nama: string } | null;
}
interface DealService { id: string; nama: string; colorHex: string }
interface DealUser { id: string; nama: string; avatarInitial: string | null }
interface DealStage { id: string; nama: string; urutan: number; colorHex: string }
interface DealDoc { id: string; fileName: string; fileType: string | null; fileSizeBytes: number | null; fileUrl: string | null }

interface Deal {
  id: string;
  nilai: number;
  probability: number;
  isHot: boolean;
  dealStatus: string;
  deadline: string | null;
  notes: string | null;
  client: DealClient;
  service: DealService | null;
  assignedAe: DealUser | null;
  stage: DealStage | null;
  documents: DealDoc[];
}

interface MonthlyData {
  bulan: string;
  total: number;
  count: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

function formatRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
  if (n >= 1_000_000) return `Rp ${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(1).replace('.0', '')}K`;
  return `Rp ${n}`;
}

function svcBg(hex: string) {
  const map: Record<string, string> = {
    '#2563EB': '#EFF6FF', '#16A34A': '#F0FDF4',
    '#7C3AED': '#F5F3FF', '#D97706': '#FFFBEB', '#94A3B8': '#F8FAFC',
  };
  return map[hex] ?? '#F8FAFC';
}

function statusBadge(deal: Deal) {
  const s = deal.dealStatus;
  const stage = deal.stage?.nama || '';
  if (s === 'won') return <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Done</span>;
  if (s === 'lost') return <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Lost</span>;
  if (stage === 'Meeting' || stage === 'Negotiation') return <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Production</span>;
  return <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Confirmed</span>;
}

const DOC_TYPES = ['MOU / Kontrak', 'Brief Klien', 'Permintaan Khusus', 'Referensi / Moodboard', 'Strategi', 'Lainnya'];

function UploadModal({
  deals,
  onClose,
  onUploaded,
}: {
  deals: Deal[];
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [dealId, setDealId] = useState('');
  const [docType, setDocType] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!dealId) { toast.error('Pilih deal terlebih dahulu'); return; }
    if (!file) { toast.error('Pilih file terlebih dahulu'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dealId', dealId);
      const res = await fetch('/api/pipeline/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload gagal');
      toast.success('File berhasil diupload');
      onUploaded();
      onClose();
    } catch {
      toast.error('Gagal mengupload file');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold">Upload Dokumen Deal Client</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Pilih Deal</label>
            <select value={dealId} onChange={(e) => setDealId(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none">
              <option value="">— Pilih Deal —</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>{d.client.namaKlien} — {d.service?.nama || '-'} ({formatRp(d.nilai)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Tipe Dokumen</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none">
              <option value="">— Pilih Tipe —</option>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">File</label>
            <div
              className={`border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => fileRef.current?.click()}
            >
              {!file ? (
                <>
                  <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                  <div className="text-[12px] text-gray-400">{uploading ? 'Mengupload...' : 'Klik untuk pilih file'}</div>
                  <div className="text-[10.5px] text-gray-300 mt-1">PDF, DOC, PPT, JPG, PNG — maks 50MB</div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[12px] font-medium text-gray-700">{file.name}</div>
                  <div className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                ref={fileRef}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size > 50 * 1024 * 1024) { toast.error('File terlalu besar. Maksimal 50MB.'); return; }
                  setFile(f || null);
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Catatan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan dokumen ini..."
              rows={2}
              className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 resize-none text-[#18181B] placeholder:text-gray-300"
            />
          </div>
        </div>
        <div className="px-5 py-3 border-t border-black/[0.06] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium rounded-lg border border-black/10 text-gray-600 hover:bg-gray-50">Batal</button>
          <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 text-[12px] font-medium rounded-lg bg-[#18181B] text-white hover:bg-[#27272A] disabled:opacity-60">
            {uploading ? 'Mengupload...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

const IMG_TYPES = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'];

const EXT_IMG_MAP: Record<string, string> = {
  jpg: 'JPG', jpeg: 'JPEG', png: 'PNG', gif: 'GIF', webp: 'WEBP', svg: 'SVG', bmp: 'PNG',
};

function isImageType(fileType: string | null, fileName: string): boolean {
  if (fileType && IMG_TYPES.includes(fileType.toUpperCase())) return true;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return !!EXT_IMG_MAP[ext];
}

function DocPreview({ url, fileName, fileType, onClose }: { url: string; fileName: string; fileType: string | null; onClose: () => void }) {
  const isImage = isImageType(fileType, fileName);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/80 hover:text-white text-[20px]">×</button>
        {isImage ? (
          <img src={url} alt={fileName} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
        ) : (
          <iframe src={url} className="w-[80vw] h-[85vh] rounded-lg shadow-2xl bg-white" title={fileName} />
        )}
        <div className="text-white/60 text-[12px] text-center mt-2">{fileName}</div>
      </div>
    </div>
  );
}

function DocLink({ doc, onDelete }: { doc: DealDoc; onDelete?: () => void }) {
  const [preview, setPreview] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isImage = isImageType(doc.fileType, doc.fileName);

  async function handleDelete() {
    if (!confirm(`Hapus dokumen "${doc.fileName}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/deals/documents/${doc.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Dokumen berhasil dihapus');
      onDelete?.();
    } catch {
      toast.error('Gagal menghapus dokumen');
    } finally {
      setDeleting(false);
    }
  }

  if (!doc.fileUrl) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-black/10 rounded-lg text-[11.5px] text-gray-400">
        <span className="text-[10px] font-semibold text-gray-400">{doc.fileType || 'FILE'}</span>
        <span>{doc.fileName}</span>
        {doc.fileSizeBytes && <span className="text-[10px] text-gray-400 font-mono">{(doc.fileSizeBytes / 1024 / 1024).toFixed(1)} MB</span>}
        <span className="text-[9px] text-gray-300 italic">(file blm diupload)</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="flex items-center gap-2 px-3 py-2 bg-white border border-black/10 rounded-lg text-[11.5px] cursor-pointer hover:bg-blue-50 group"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => {
          if (isImage) setPreview(true);
          else window.open(doc.fileUrl!, '_blank');
        }}>
          <span className="text-[10px] font-semibold text-gray-500">{doc.fileType || 'FILE'}</span>
          <span className="truncate">{doc.fileName}</span>
          {doc.fileSizeBytes && <span className="text-[10px] text-gray-400 font-mono shrink-0">{(doc.fileSizeBytes / 1024 / 1024).toFixed(1)} MB</span>}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Hapus dokumen"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      {preview && <DocPreview url={doc.fileUrl} fileName={doc.fileName} fileType={doc.fileType} onClose={() => setPreview(false)} />}
    </>
  );
}

// ─── Edit Deal Modal ──────────────────────────────────────────
function EditDealModal({
  deal,
  onClose,
  onUpdated,
}: {
  deal: Deal;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [meta, setMeta] = useState<{ clients: {id: string, namaKlien: string}[]; services: DealService[]; stages: DealStage[]; aes: DealUser[] } | null>(null);
  const [form, setForm] = useState({
    clientId: deal.client.id,
    serviceId: deal.service?.id || '',
    stageId: deal.stage?.id || '',
    assignedAeId: deal.assignedAe?.id || '',
    nilai: String(deal.nilai),
    probability: String(deal.probability),
    notes: deal.notes || '',
    namaProject: '',
    isHot: deal.isHot,
    dealStatus: deal.dealStatus,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/pipeline/meta')
      .then((r) => r.json())
      .then((data) => {
        setMeta(data);
      })
      .catch(() => toast.error('Gagal memuat data form'));
  }, []);

  const inputCls = 'w-full text-[12px] border border-black/[0.1] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 text-[#18181B] placeholder:text-gray-300';

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: form.serviceId || null,
          stageId: form.stageId || null,
          assignedAeId: form.assignedAeId || null,
          nilai: Number(form.nilai) || 0,
          probability: Number(form.probability) || 0,
          notes: form.notes || null,
          isHot: form.isHot,
          dealStatus: form.dealStatus,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Deal berhasil diupdate');
      onUpdated();
      onClose();
    } catch {
      toast.error('Gagal mengupdate deal');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold">Edit Deal</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
        </div>
        {!meta ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-6 h-6 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-5 py-4 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Client</label>
              <input type="text" value={deal.client.namaKlien} disabled className={`${inputCls} opacity-60`} />
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nama Project</label>
              <input type="text" placeholder="Yearbook 2026/27" value={form.namaProject} onChange={(e) => setForm((f) => ({ ...f, namaProject: e.target.value }))} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Layanan</label>
                <select value={form.serviceId} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))} className={inputCls}>
                  <option value="">— Pilih Layanan —</option>
                  {meta.services.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Stage</label>
                <select value={form.stageId} onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value }))} className={inputCls}>
                  <option value="">— Pilih Stage —</option>
                  {meta.stages.filter((s) => !['Lost', 'Won'].includes(s.nama)).map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nilai Deal (Rp)</label>
                <input type="number" placeholder="35000000" value={form.nilai} onChange={(e) => setForm((f) => ({ ...f, nilai: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Probabilitas (%)</label>
                <input type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm((f) => ({ ...f, probability: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Deal Owner (AE)</label>
              <select value={form.assignedAeId} onChange={(e) => setForm((f) => ({ ...f, assignedAeId: e.target.value }))} className={inputCls}>
                <option value="">— Pilih AE —</option>
                {meta.aes.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Status Deal</label>
              <select value={form.dealStatus} onChange={(e) => setForm((f) => ({ ...f, dealStatus: e.target.value }))} className={inputCls}>
                <option value="active">Active</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isHot" checked={form.isHot} onChange={(e) => setForm((f) => ({ ...f, isHot: e.target.checked }))} className="w-3.5 h-3.5" />
              <label htmlFor="isHot" className="text-[11.5px] text-gray-600">Hot Deal</label>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Catatan</label>
              <textarea rows={3} placeholder="Catatan..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={`${inputCls} resize-none`} />
            </div>
          </div>
        )}
        <div className="px-5 py-3 border-t border-black/[0.06] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium rounded-lg border border-black/[0.1] text-gray-600 hover:bg-gray-50">Batal</button>
          <button onClick={handleSave} disabled={saving || !meta} className="px-4 py-2 text-[12px] font-medium rounded-lg bg-[#18181B] text-white hover:bg-[#27272A] disabled:opacity-60">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [meta, setMeta] = useState<{ services: DealService[]; users: DealUser[] }>({ services: [], users: [] });
  const [stats, setStats] = useState({ totalDeals: 0, totalNilai: 0, wonCount: 0, wonNilai: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState('');
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingRow, setUploadingRow] = useState<string | null>(null);
  const [chartOffset, setChartOffset] = useState(0);
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterService) params.set('serviceId', filterService);
      const res = await fetch(`/api/deals?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDeals(data.deals);
      setMonthlyData(data.monthlyData || []);
      setMeta(data.meta);
      setStats(data.stats);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [search, filterService]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  async function handleRowUpload(dealId: string, file: File) {
    if (file.size > 20 * 1024 * 1024) { toast.error('File terlalu besar. Maksimal 20MB.'); return; }
    setUploadingRow(dealId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dealId', dealId);
      const res = await fetch('/api/pipeline/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload gagal');
      toast.success('File berhasil diupload');
      fetchDeals();
    } catch {
      toast.error('Gagal mengupload file');
    } finally {
      setUploadingRow(null);
    }
  }

  function isDone(d: Deal) {
    return d.dealStatus === 'won';
  }

  const filteredDeals = deals.filter((d) => isDone(d));

  const maxOffset = Math.max(0, monthlyData.length - 6);
  const dealMonths = monthlyData.slice(-6 - chartOffset, monthlyData.length - chartOffset || undefined);
  function chartLabel() {
    if (dealMonths.length === 0) return '';
    const first = dealMonths[0].bulan.split('-');
    const last = dealMonths[dealMonths.length - 1].bulan.split('-');
    if (first[0] === last[0]) return `${MONTHS[parseInt(first[1]) - 1]}–${MONTHS[parseInt(last[1]) - 1]} ${first[0]}`;
    return `${MONTHS[parseInt(first[1]) - 1]} ${first[0]} – ${MONTHS[parseInt(last[1]) - 1]} ${last[0]}`;
  }

  return (
    <div className="p-[12px_16px] md:p-[20px_24px] flex flex-col gap-[12px] md:gap-[16px]">
      {showUploadModal && (
        <UploadModal
          deals={deals}
          onClose={() => setShowUploadModal(false)}
          onUploaded={fetchDeals}
        />
      )}
      {editingDeal && (
        <EditDealModal
          deal={editingDeal}
          onClose={() => setEditingDeal(null)}
          onUpdated={fetchDeals}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[18px] md:text-[20px] font-semibold tracking-[-0.3px]">Deal Clients</h1>
          <p className="text-[12px] md:text-[13px] text-gray-400 mt-0.5">Deal (Won) — evaluasi per bulan</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#18181B] text-white flex items-center px-3 py-2 rounded-lg text-[12.5px] font-medium hover:opacity-85 w-full sm:w-auto justify-center"
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Upload Dokumen
        </button>
      </div>

      {/* Stats & Monthly comparison */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
          <div>
            <div className="text-[13px] font-semibold">Deal per Bulan</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Jumlah deal & nilai - perbandingan bulanan</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setChartOffset(Math.min(chartOffset + 1, maxOffset))} disabled={chartOffset >= maxOffset} className="text-[13px] px-1.5 py-0.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">‹</button>
            <button onClick={() => setChartOffset(0)} className="text-[11px] px-2 py-0.5 rounded border border-black/10 hover:bg-gray-100 text-gray-600">Bulan ini</button>
            <button onClick={() => setChartOffset(Math.max(chartOffset - 1, 0))} disabled={chartOffset <= 0} className="text-[13px] px-1.5 py-0.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">›</button>
            <span className="text-[13px] font-semibold ml-1">{chartLabel()}</span>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            {dealMonths.length === 0 ? (
              <div className="col-span-6 text-center text-gray-400 text-[12px] py-4">Belum ada data deal</div>
            ) : (
              dealMonths.map((m) => {
                const [, mo] = m.bulan.split('-');
                return (
                  <div key={m.bulan} className="bg-gray-50 rounded-lg px-3 py-2.5 text-center border border-black/5">
                    <div className="text-[9px] font-semibold uppercase text-gray-400 tracking-wider">{MONTHS[parseInt(mo) - 1]}</div>
                    <div className="text-[15px] font-bold font-mono mt-1">{m.count}</div>
                    <div className="text-[9px] text-gray-400 font-mono">{formatRp(m.total)}</div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-end gap-2 h-[80px]">
            {dealMonths.map((m) => {
              const maxVal = Math.max(...dealMonths.map((x) => x.total), 1);
              const h = Math.max((m.total / maxVal) * 100, 8);
              const [, mo] = m.bulan.split('-');
              return (
                <div key={m.bulan} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-opacity hover:opacity-70 cursor-pointer" style={{ height: `${h}%`, background: '#2563EB', minHeight: '8px' }} />
                  <div className="text-[8px] text-gray-400 font-mono">{MONTHS[parseInt(mo) - 1]}</div>
                </div>
              );
            })}
          </div>
          {stats.totalNilai > 0 && (
            <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg text-[11px] text-gray-500">
              <strong className="text-gray-700">{stats.totalDeals} deal</strong> aktif & won · Total nilai: <strong className="text-gray-700">{formatRp(stats.totalNilai)}</strong> · Won: {stats.wonCount} deal ({formatRp(stats.wonNilai)})
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 bg-white border border-black/10 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input
            placeholder="Cari nama klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[12px] bg-transparent outline-none flex-1 placeholder:text-gray-300"
          />
        </div>
        <span className="text-[12px] px-3 py-2 bg-gray-100 rounded-lg text-gray-500 font-medium">Done</span>
        <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none">
          <option value="">Semua Layanan</option>
          {meta.services.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-[13px]">
            {search || filterService ? 'Tidak ada deal yang cocok.' : 'Belum ada deal.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Klien</th>
                  <th className="text-left px-4 py-3">Layanan</th>
                  <th className="text-left px-4 py-3">Nilai</th>
                  <th className="text-left px-4 py-3">AE</th>
                  <th className="text-left px-4 py-3">Deadline</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Files</th>
                  <th className="w-16 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => {
                  const isOpen = expandedDeal === deal.id;
                  const kota = deal.client.kota?.nama || '';
                  const svc = deal.service?.nama || '';
                  const contact = deal.client.namaContact || '';
                  const hp = deal.client.noHp || '';
                  const info = [kota, svc, contact, hp].filter(Boolean).join(' - ');

                  return (
                    <Fragment key={deal.id}>
                      <tr className="border-b border-black/5 hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpandedDeal(isOpen ? null : deal.id)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {isOpen ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                            <div>
                              <div className="font-semibold text-[12.5px]">{deal.client.namaKlien}</div>
                              <div className="text-[10.5px] text-gray-400">{contact} {hp ? `- ${hp}` : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {deal.service && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: svcBg(deal.service.colorHex), color: deal.service.colorHex }}>
                              {deal.service.nama}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] font-semibold text-green-600">{formatRp(deal.nilai)}</td>
                        <td className="px-4 py-3 text-[12px] text-gray-500">{deal.assignedAe?.nama || '-'}</td>
                        <td className={`px-4 py-3 font-mono text-[11.5px] ${deal.deadline && new Date(deal.deadline) < new Date() && deal.dealStatus !== 'won' ? 'text-red-600' : 'text-gray-500'}`}>
                          {deal.deadline ? new Date(deal.deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="px-4 py-3">{statusBadge(deal)}</td>
                        <td className="px-4 py-3 text-[11px] text-blue-600">
                          {deal.documents.length > 0 ? `${deal.documents.length} files` : '-'}
                        </td>
                        <td className="px-4 py-3 flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setEditingDeal(deal); }} className="text-[11px] px-2 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-gray-100 inline-flex items-center gap-1"><Pencil className="w-3 h-3" />Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); setExpandedDeal(isOpen ? null : deal.id); }} className="text-[11px] px-2.5 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-gray-100">Detail</button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={`${deal.id}-detail`}>
                          <td colSpan={8} className="bg-gray-50 px-6 py-4">
                            <div className="flex flex-col gap-3">
                              <div className="text-[11.5px] text-gray-500">{info || '-'}</div>
                              <div className="flex gap-2 flex-wrap">
                                {deal.documents.map((doc) => (
                                  <DocLink key={doc.id} doc={doc} onDelete={fetchDeals} />
                                ))}
                                <div
                                  className={`flex items-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-black/10 rounded-lg text-[11.5px] text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-600 ${uploadingRow === deal.id ? 'opacity-50 pointer-events-none' : ''}`}
                                  onClick={() => fileInputs.current[deal.id]?.click()}
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  {uploadingRow === deal.id ? 'Mengupload...' : '+ Upload file baru'}
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                                  ref={(el) => { fileInputs.current[deal.id] = el; }}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleRowUpload(deal.id, f);
                                    e.target.value = '';
                                  }}
                                />
                              </div>
                              <div className="flex items-start gap-2">
                                <textarea
                                  className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white resize-none min-h-[52px] focus:outline-none focus:ring-2 focus:ring-[#18181B]/10"
                                  placeholder="Catatan / permintaan khusus klien..."
                                  defaultValue={deal.notes || ''}
                                  onBlur={async (e) => {
                                    const val = e.target.value;
                                    if (val === (deal.notes || '')) return;
                                    setSavingNote(deal.id);
                                    try {
                                      const res = await fetch(`/api/deals/${deal.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ notes: val || null }),
                                      });
                                      if (!res.ok) throw new Error();
                                      toast.success('Catatan tersimpan');
                                    } catch {
                                      toast.error('Gagal menyimpan catatan');
                                    } finally {
                                      setSavingNote(null);
                                    }
                                  }}
                                />
                                {savingNote === deal.id && (
                                  <div className="w-4 h-4 mt-2 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin shrink-0" />
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-gray-50/50 border-t border-black/5 text-[11px] text-gray-400">
              Menampilkan {filteredDeals.length} deal.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
