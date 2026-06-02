'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface MetaOption { id: string; nama: string; }
interface MetaService extends MetaOption { colorHex: string; }
interface MetaStage extends MetaOption { urutan: number; probabilityDefault: number; isTerminal: boolean; }

interface Deal {
  id: string;
  nilai: number;
  namaProject: string | null;
  probability: number;
  isHot: boolean;
  dealStatus: string;
  notes: string | null;
  lostReason: string | null;
  tanggalMasuk: string;
  deadline: string | null;
  stageId: string | null;
  client: { namaKlien: string };
  service: { id: string; nama: string; colorHex: string } | null;
  assignedAe: { id: string; nama: string; avatarInitial: string | null } | null;
  stage: { nama: string; urutan: number; colorHex: string } | null;
  documents: { id: string; fileName: string; fileUrl: string | null }[];
}

interface Stage {
  id: string;
  nama: string;
  urutan: number;
  colorHex: string;
  isTerminal: boolean;
  probabilityDefault: number;
  dealCount: number;
  totalNilai: number;
}

function formatRpFull(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function formatRp(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
}

function probBadgeStyle(prob: number): string {
  if (prob >= 75) return 'bg-[#DCFCE7] text-[#16A34A]';
  if (prob >= 45) return 'bg-[#FEF9C3] text-[#A16207]';
  return 'bg-[#FEE2E2] text-[#DC2626]';
}

function svcBg(hex: string) {
  const map: Record<string, string> = {
    '#2563EB': '#EFF6FF', '#16A34A': '#F0FDF4',
    '#7C3AED': '#F5F3FF', '#D97706': '#FFFBEB', '#94A3B8': '#F8FAFC',
  };
  return map[hex] ?? '#F8FAFC';
}

function stageLabel(nama: string) {
  if (nama === 'Lost') return 'Lost / Kalah';
  if (nama === 'Won') return 'Deal';
  return nama;
}

// ─── Add Deal Modal ──────────────────────────────────────────
function AddDealModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [meta, setMeta] = useState<{ clients: {id: string, namaKlien: string}[]; services: MetaService[]; stages: MetaStage[]; aes: MetaOption[] } | null>(null);
  const [form, setForm] = useState({
    clientId: '', serviceId: '', stageId: '', assignedAeId: '',
    nilai: '', probability: '50', notes: '', namaProject: '',
  });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/pipeline/meta')
      .then((r) => r.json())
      .then((data) => {
        setMeta(data);
        setForm((f) => ({
          ...f,
          clientId: '',
          serviceId: '',
          stageId: data.stages[0]?.id ?? '',
          assignedAeId: '',
          probability: String(data.stages[0]?.probabilityDefault ?? 50),
        }));
      })
      .catch(() => toast.error('Gagal memuat data form'));
  }, []);

  function set(k: string, v: string) {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === 'stageId' && meta) {
        const stage = meta.stages.find((s) => s.id === v);
        if (stage) next.probability = String(stage.probabilityDefault);
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (!form.clientId || !form.stageId) {
      toast.error('Client dan Stage wajib dipilih');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nilai: Number(form.nilai) || 0, probability: Number(form.probability), namaProject: form.namaProject || null }),
      });
      if (!res.ok) throw new Error();
      const responseData = await res.json();
      
      if (selectedFile && responseData.deal) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('dealId', responseData.deal.id);
        await fetch('/api/pipeline/upload', { method: 'POST', body: formData });
      }

      toast.success('Deal berhasil ditambahkan ke pipeline');
      onCreated();
      onClose();
    } catch {
      toast.error('Gagal menyimpan deal');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full text-[12px] border border-black/[0.1] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 text-[#18181B] placeholder:text-gray-300';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold text-[#18181B]">Tambah Deal ke Pipeline</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-[16px] font-medium">×</button>
        </div>

        {/* Body */}
        {!meta ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-6 h-6 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-5 py-4 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
            {/* Client */}
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Client *</label>
              <select value={form.clientId} onChange={(e) => set('clientId', e.target.value)} className={inputCls}>
                <option value="">— Pilih Klien —</option>
                {meta.clients.map((c) => <option key={c.id} value={c.id}>{c.namaKlien}</option>)}
              </select>
            </div>

            {/* Nama Project */}
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nama Project</label>
              <input
                type="text" placeholder="Yearbook 2026/27 SMA X" value={form.namaProject}
                onChange={(e) => set('namaProject', e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Layanan & Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Layanan</label>
                <select value={form.serviceId} onChange={(e) => set('serviceId', e.target.value)} className={inputCls}>
                  <option value="">— Pilih Layanan —</option>
                  {meta.services.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Stage *</label>
                <select value={form.stageId} onChange={(e) => set('stageId', e.target.value)} className={inputCls}>
                  {meta.stages.filter((s) => !s.isTerminal).map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
            </div>

            {/* Nilai & Probabilitas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nilai Deal (Rp)</label>
                <input
                  type="number" placeholder="35000000" value={form.nilai}
                  onChange={(e) => set('nilai', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Probabilitas (%)</label>
                <input
                  type="number" min="0" max="100" value={form.probability}
                  onChange={(e) => set('probability', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* AE */}
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Deal Owner (AE)</label>
              <select value={form.assignedAeId} onChange={(e) => set('assignedAeId', e.target.value)} className={inputCls}>
                <option value="">— Pilih AE —</option>
                {meta.aes.map((u) => <option key={u.id} value={u.id}>{u.nama}</option>)}
              </select>
            </div>

            {/* Upload zone */}
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Upload Proposal / Penawaran Harga</label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {!selectedFile ? (
                  <>
                    <div className="text-[12px] text-gray-400">Upload proposal harga, deck presentasi, atau strategi</div>
                    <div className="text-[10.5px] text-gray-300 mt-1">PDF, PPT, DOC, JPG — maks 20MB</div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {selectedFile.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-auto max-h-24 object-contain rounded-md border border-gray-200 shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                    )}
                    <div className="text-[11.5px] font-medium text-gray-700 truncate max-w-full px-2">{selectedFile.name}</div>
                    <div className="text-[10px] text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size > 20 * 1024 * 1024) {
                      toast.error('File terlalu besar. Maksimal 20MB.');
                      return;
                    }
                    setSelectedFile(f || null);
                  }}
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Catatan</label>
              <textarea
                rows={2} placeholder="Catatan tambahan untuk deal ini..."
                value={form.notes} onChange={(e) => set('notes', e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/[0.06] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium rounded-lg border border-black/[0.1] text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
          <button
            onClick={handleSubmit} disabled={saving || !meta}
            className="px-4 py-2 text-[12px] font-medium rounded-lg bg-[#18181B] text-white hover:bg-[#27272A] transition-colors disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : 'Tambah Deal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Detail Modal ────────────────────────────────────────
function DealModal({
  deal,
  stages,
  onClose,
  onUpdated,
}: {
  deal: Deal;
  stages: Stage[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [selectedStageId, setSelectedStageId] = useState(deal.stageId ?? '');
  const [catatan, setCatatan] = useState(deal.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    serviceId: deal.service?.id || '',
    nilai: String(deal.nilai),
    probability: String(deal.probability),
    assignedAeId: deal.assignedAe?.id || '',
    isHot: deal.isHot,
    dealStatus: deal.dealStatus,
    namaProject: deal.namaProject || '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aeList, setAeList] = useState<{ id: string; nama: string }[]>([]);

  useEffect(() => {
    fetch('/api/pipeline/meta')
      .then((r) => r.json())
      .then((data) => setAeList(data.aes || []))
      .catch(() => {});
  }, []);

  async function handleUpdate() {
    try {
      const body: Record<string, unknown> = { dealId: deal.id, stageId: selectedStageId, notes: catatan };
      if (showEdit) {
        body.serviceId = editForm.serviceId || null;
        body.nilai = Number(editForm.nilai) || 0;
        body.probability = Number(editForm.probability) || 0;
        body.assignedAeId = editForm.assignedAeId || null;
        body.isHot = editForm.isHot;
        body.dealStatus = editForm.dealStatus;
        body.namaProject = editForm.namaProject || null;
      }
      const res = await fetch('/api/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('dealId', deal.id);
        const uploadRes = await fetch('/api/pipeline/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('Upload gagal');
      }

      toast.success('Deal berhasil diperbarui');
      onUpdated();
      onClose();
    } catch {
      toast.error('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  const isArchived = deal.dealStatus === 'archived';

  async function handleArchive() {
    setArchiving(true);
    try {
      const newStatus = isArchived ? 'active' : 'archived';
      const res = await fetch('/api/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: deal.id, stageId: deal.stageId, dealStatus: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(isArchived ? 'Deal dikembalikan' : 'Deal diarsipkan');
      onUpdated();
      onClose();
    } catch {
      toast.error(isArchived ? 'Gagal mengembalikan deal' : 'Gagal mengarsipkan deal');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch('/api/pipeline', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: deal.id }),
      });
      if (!res.ok) throw new Error();
      toast.success('Deal berhasil dihapus');
      onUpdated();
      onClose();
    } catch {
      toast.error('Gagal menghapus deal');
    } finally {
      setDeleting(false);
    }
  }

  const inputCls = 'w-full text-[12px] border border-black/[0.1] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 text-[#18181B] placeholder:text-gray-300';
  const svcHex = deal.service?.colorHex ?? '#94A3B8';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold text-[#18181B]">Detail Deal</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(!showEdit)}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors text-[14px] ${showEdit ? 'bg-[#18181B] text-white' : 'text-gray-400 hover:bg-gray-100'}`}
              title="Edit deal"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-[16px] font-medium"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
          {/* Client + nilai */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[14px] font-semibold text-[#18181B]">{deal.client.namaKlien}</div>
              <div className="text-[11.5px] text-gray-400 mt-0.5">
                {(editForm.namaProject || deal.namaProject) ? `${editForm.namaProject || deal.namaProject} · ` : ''}
                {deal.service?.nama || '—'} ·                 {stageLabel(stages.find(s => s.id === selectedStageId)?.nama || '—')}
                {editForm.isHot && <span className="ml-1 text-[#EA580C]">🔥</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[16px] font-bold text-[#16A34A] font-mono">{formatRpFull(Number(editForm.nilai) || deal.nilai)}</div>
              <div className="text-[10.5px] text-gray-400">
                {editForm.probability}% prob · AE: {deal.assignedAe?.nama ?? '—'}
              </div>
            </div>
          </div>

          {/* Edit fields */}
          {showEdit && (
            <div className="border border-[#2563EB]/20 rounded-xl bg-[#EFF6FF] px-4 py-3 flex flex-col gap-3">
              <div className="text-[11px] font-semibold text-[#2563EB]">Edit Fields</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10.5px] font-medium text-gray-600 block mb-1">Nilai Deal (Rp)</label>
                  <input type="number" value={editForm.nilai} onChange={(e) => setEditForm((f) => ({ ...f, nilai: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10.5px] font-medium text-gray-600 block mb-1">Probabilitas (%)</label>
                  <input type="number" min="0" max="100" value={editForm.probability} onChange={(e) => setEditForm((f) => ({ ...f, probability: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-[10.5px] font-medium text-gray-600 block mb-1">Nama Project</label>
                <input type="text" value={editForm.namaProject} onChange={(e) => setEditForm((f) => ({ ...f, namaProject: e.target.value }))} className={inputCls} placeholder="Yearbook 2026/27" />
              </div>
              <div>
                <label className="text-[10.5px] font-medium text-gray-600 block mb-1">Assign AE</label>
                <select value={editForm.assignedAeId} onChange={(e) => setEditForm((f) => ({ ...f, assignedAeId: e.target.value }))} className={inputCls}>
                  <option value="">Pilih AE</option>
                  {aeList.map((ae) => (
                    <option key={ae.id} value={ae.id}>{ae.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10.5px] font-medium text-gray-600 block mb-1">Status Deal</label>
                <select value={editForm.dealStatus} onChange={(e) => setEditForm((f) => ({ ...f, dealStatus: e.target.value }))} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="won">Deal</option>
                  <option value="lost">Lost</option>
                  <option value="unqualified">Unqualified</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editIsHot" checked={editForm.isHot} onChange={(e) => setEditForm((f) => ({ ...f, isHot: e.target.checked }))} className="w-3.5 h-3.5" />
                <label htmlFor="editIsHot" className="text-[11px] text-gray-600">Hot Deal</label>
              </div>
            </div>
          )}

          {/* File upload zone */}
          <div className="border-t border-black/[0.06] pt-4">
            <div className="text-[11.5px] font-medium text-gray-600 mb-2">Upload Proposal / File Penawaran</div>
            <div
              className={`border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {!selectedFile ? (
                <>
                  <div className="text-[12px] text-gray-400">
                    {uploading ? 'Mengupload...' : 'Upload proposal harga, presentasi, atau strategi'}
                  </div>
                  {!uploading && <div className="text-[10.5px] text-gray-300 mt-1">PDF, PPT, DOC, JPG — maks 20MB per file</div>}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {selectedFile.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-auto max-h-24 object-contain rounded-md border border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                  )}
                  <div className="text-[11.5px] font-medium text-gray-700 truncate max-w-full px-2">{selectedFile.name}</div>
                  <div className="text-[10px] text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size > 20 * 1024 * 1024) {
                    toast.error('File terlalu besar. Maksimal 20MB.');
                    return;
                  }
                  setSelectedFile(f || null);
                }} 
              />
            </div>
            {deal.documents.length === 0 ? (
              <div className="text-[11.5px] text-gray-300 mt-2">Belum ada file yang diupload</div>
            ) : (
              <div className="flex flex-col gap-1 mt-2">
                {deal.documents.map((doc) => (
                  <a key={doc.id} href={doc.fileUrl || '#'} target="_blank" rel="noreferrer" className="text-[11.5px] text-blue-500 flex items-center gap-1 hover:underline w-fit">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {doc.fileName}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Update stage + catatan */}
          <div className="border-t border-black/[0.06] pt-4 flex flex-col gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Update Stage</label>
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="w-full text-[12px] border border-black/[0.1] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 text-[#18181B]"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{stageLabel(s.nama)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Catatan Update</label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Update terbaru dari deal ini?"
                rows={3}
                className="w-full text-[12px] border border-black/[0.1] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 resize-none text-[#18181B] placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {!confirmArchive && !confirmDelete ? (
              <>
                <button
                  onClick={() => setConfirmArchive(true)}
                  className={`px-3 py-2 text-[11.5px] font-medium rounded-lg border transition-colors ${isArchived ? 'border-gray-200 text-gray-500 hover:bg-gray-50' : 'border-red-200 text-red-500 hover:bg-red-50'}`}
                >
                  {isArchived ? 'Kembalikan' : 'Archive'}
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-2 text-[11.5px] font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  Hapus
                </button>
              </>
            ) : confirmArchive ? (
              <div className="flex items-center gap-2">
                <span className={`text-[11.5px] ${isArchived ? 'text-gray-600' : 'text-red-600'}`}>{isArchived ? 'Kembalikan deal ini?' : 'Arsipkan deal ini?'}</span>
                <button
                  onClick={handleArchive}
                  disabled={archiving}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-lg text-white disabled:opacity-60 ${isArchived ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  {archiving ? '...' : isArchived ? 'Ya, Kembalikan' : 'Ya, Arsipkan'}
                </button>
                <button
                  onClick={() => setConfirmArchive(false)}
                  className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-black/[0.1] text-gray-500 hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-red-600">Hapus deal ini?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {deleting ? '...' : 'Ya, Hapus'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-black/[0.1] text-gray-500 hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-medium rounded-lg border border-black/[0.1] text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="px-4 py-2 text-[12px] font-medium rounded-lg bg-[#18181B] text-white hover:bg-[#27272A] transition-colors disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Card ───────────────────────────────────────────────
function DealCard({
  deal,
  isWon,
  isLost,
  isDragging,
  onDragStart,
  onClick,
}: {
  deal: Deal;
  isWon: boolean;
  isLost: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}) {
  const svcHex = deal.service?.colorHex ?? '#94A3B8';
  const isUnqualifiedCard = deal.dealStatus === 'unqualified';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={[
        'bg-white rounded-lg border cursor-pointer select-none',
        'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md',
        isDragging ? 'opacity-40 scale-95' : '',
        deal.isHot ? 'border-[#F97316]/40 shadow-[0_0_0_1px_rgba(249,115,22,0.12)]' : 'border-black/[0.07] shadow-sm',
        isWon ? 'border-[#16A34A]/25 bg-[#F0FDF4]/40' : '',
        isLost ? 'border-gray-200 bg-gray-50/60 opacity-70' : '',
        isUnqualifiedCard ? 'border-amber-200 bg-amber-50/40 opacity-80' : '',
      ].join(' ')}
      style={{ padding: '9px 10px' }}
    >
      {deal.isHot && <div className="text-[9px] font-semibold text-[#EA580C] mb-1">🔥 Hot</div>}
      {isUnqualifiedCard && <div className="text-[9px] font-semibold text-amber-600 mb-1">✕ Unqualified</div>}
      <div className="text-[12px] font-semibold text-[#18181B] leading-tight truncate">{deal.client.namaKlien}</div>
      {deal.namaProject && <div className="text-[10px] text-gray-500 truncate">{deal.namaProject}</div>}
      {deal.service && (
        <div
          className="text-[9.5px] font-medium mt-0.5 px-1.5 py-0.5 rounded inline-block truncate max-w-full"
          style={{ background: svcBg(svcHex), color: svcHex }}
        >
          {deal.service.nama}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11.5px] font-mono font-semibold text-[#18181B]">Rp {formatRp(deal.nilai)}</span>
        {!isLost && (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${probBadgeStyle(deal.probability)}`}>
            {deal.probability}%
          </span>
        )}
      </div>
      {deal.assignedAe && (
        <div className="text-[10px] text-gray-400 mt-1.5 truncate">AE: {deal.assignedAe.nama}</div>
      )}
      <div className="text-[10px] mt-1 truncate">
        {deal.documents.length > 0
          ? <span className="text-blue-500">{deal.documents.length} file</span>
          : <span className="text-gray-300">Tidak ada file</span>}
      </div>
      {isLost && (deal.lostReason ?? deal.notes) && (
        <div className="text-[10px] text-gray-400 mt-1 truncate">{deal.lostReason ?? deal.notes}</div>
      )}
      {isLost && (
        <button
          className="mt-2 text-[10px] px-2 py-0.5 rounded bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
          onClick={(e) => { e.stopPropagation(); toast.success(`${deal.client.namaKlien} dipindah ke DB`); }}
        >
          Simpan ke DB
        </button>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAddDeal, setShowAddDeal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/pipeline');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStages(data.stages);
      setDeals(data.deals);
    } catch {
      toast.error('Gagal memuat data pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function onDragStart(e: React.DragEvent, dealId: string) {
    setDraggingId(dealId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  }

  function onDragLeave() { setDragOverStage(null); }

  async function onDrop(e: React.DragEvent, targetStageId: string) {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggingId) return;
    const targetStage = stages.find((s) => s.id === targetStageId);
    const deal = deals.find((d) => d.id === draggingId);
    if (!deal || !targetStage || deal.stageId === targetStageId) return;

    setDeals((prev) => prev.map((d) =>
      d.id === draggingId
        ? { ...d, stageId: targetStageId, probability: targetStage.probabilityDefault, stage: targetStage }
        : d
    ));
    try {
      const res = await fetch('/api/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: draggingId, stageId: targetStageId }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Deal dipindah ke ${targetStage.nama}`);
      fetchData();
    } catch {
      toast.error('Gagal memindahkan deal');
      fetchData();
    }
    setDraggingId(null);
  }

  const activeDeals = deals.filter((d) => d.dealStatus !== 'archived' && d.dealStatus !== 'unqualified');
  const totalPipeline = activeDeals.filter((d) => d.dealStatus === 'active').reduce((s, d) => s + d.nilai, 0);
  const totalWeighted = activeDeals.reduce((s, d) => s + d.nilai * (d.probability / 100), 0);
  const wonTotal = activeDeals.filter((d) => d.dealStatus === 'won').reduce((s, d) => s + d.nilai, 0);

  const filteredDeals = deals.filter((d) => {
    if (showArchived) return d.dealStatus === 'archived';
    return d.dealStatus !== 'archived' && d.dealStatus !== 'unqualified';
  });
  const totalPerStage: Record<string, { totalNilai: number; dealCount: number }> = {};
  for (const d of filteredDeals) {
    const sid = d.stageId || '';
    if (!totalPerStage[sid]) totalPerStage[sid] = { totalNilai: 0, dealCount: 0 };
    totalPerStage[sid].totalNilai += d.nilai;
    totalPerStage[sid].dealCount += 1;
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-gray-400">Memuat pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Add Deal Modal ── */}
      {showAddDeal && (
        <AddDealModal
          onClose={() => setShowAddDeal(false)}
          onCreated={fetchData}
        />
      )}

      {/* ── Deal Detail Modal ── */}
      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          stages={stages}
          onClose={() => setSelectedDeal(null)}
          onUpdated={fetchData}
        />
      )}

      <div className="p-[12px_16px] md:p-6 flex flex-col gap-4 md:gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight text-[#18181B]">Pipeline</h1>
            <p className="text-[11.5px] text-gray-400 mt-0.5">Qualified leads — drag card untuk pindah stage · klik untuk detail</p>
          </div>
          <button
            onClick={() => setShowAddDeal(true)}
            className="inline-flex items-center gap-1.5 bg-[#18181B] text-white text-[12px] font-medium px-3.5 py-2 rounded-lg hover:bg-[#27272A] transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
            Add Deal
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {stages.map((stage) => {
            const st = totalPerStage[stage.id] || { totalNilai: 0, dealCount: 0 };
            return (
              <div key={stage.id} className="bg-white border border-black/[0.06] rounded-xl p-3 shadow-sm" style={{ borderTop: `3px solid ${stage.colorHex}` }}>
                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1 truncate" style={{ color: stage.colorHex }}>
                  {stageLabel(stage.nama)}
                </div>
                <div className="text-[15px] font-bold font-mono text-[#18181B]">{formatRpFull(st.totalNilai)}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {st.dealCount} deal{st.dealCount !== 1 ? 's' : ''}
                  {stage.nama === 'Lost' && st.dealCount > 0 && ' — kembali ke DB'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Insight */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-4 py-2.5 text-[11.5px] text-[#15803D] flex flex-wrap gap-x-6 gap-y-1">
          <span>🎯 Pipeline aktif: <strong>Rp {formatRp(totalPipeline)}</strong></span>
          <span>📊 Weighted: <strong>Rp {formatRp(totalWeighted)}</strong></span>
          <span>✅ Won YTD: <strong>Rp {formatRp(wonTotal)}</strong></span>
        </div>

        {/* Kanban board */}
        <div className="bg-white border border-black/[0.06] rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-black/[0.06] flex items-center gap-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`text-[11.5px] px-3 py-1 rounded-md font-medium transition-colors ${showArchived ? 'bg-[#18181B] text-white' : 'bg-[#F4F4F5] text-gray-500 hover:bg-gray-200'}`}
            >
              {showArchived ? 'Sembunyikan Archive' : 'Tampilkan Archived'}
            </button>
            <span className="text-[11px] text-gray-400">
              {showArchived ? `${filteredDeals.length} archived` : `${activeDeals.length} deal aktif`}
            </span>
          </div>

          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <div className="flex gap-3 p-4 min-w-max">
              {stages.map((stage) => {
                const colDeals = deals.filter((d) => {
                  if (d.stageId !== stage.id) return false;
                  if (showArchived) return d.dealStatus === 'archived';
                  return d.dealStatus !== 'archived' && d.dealStatus !== 'unqualified';
                });
                const isLost = stage.nama === 'Lost';
                const isWon = stage.nama === 'Won';

                return (
                  <div
                    key={stage.id}
                    className={`flex flex-col rounded-xl transition-all ${dragOverStage === stage.id ? 'bg-[#F0F9FF]' : 'bg-[#F9F9FB]'}`}
                    style={{
                      minWidth: '155px', flex: 1,
                      border: dragOverStage === stage.id ? '2px dashed #60A5FA' : '2px dashed transparent',
                    }}
                    onDragOver={(e) => onDragOver(e, stage.id)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, stage.id)}
                  >
                    <div className="sticky top-0 z-10 bg-[#F9F9FB] rounded-t-xl" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.05)' }}>
                      <div className="px-3 py-2.5 flex items-center justify-between">
                        <span className="text-[11px] font-semibold truncate" style={{ color: isLost ? '#DC2626' : isWon ? '#16A34A' : stage.colorHex }}>
                          {stageLabel(stage.nama)}
                        </span>
                        <span className="text-[10px] bg-white border border-black/[0.08] text-gray-500 rounded-full px-1.5 py-0.5 font-mono">
                          {colDeals.length}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono px-3 pb-2 font-semibold" style={{ color: isWon ? '#16A34A' : isLost ? '#9CA3AF' : '#18181B' }}>
                        Rp {formatRp(colDeals.reduce((s, d) => s + d.nilai, 0))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 px-2 pb-2 min-h-[80px]">
                      {colDeals.length === 0 && (
                        <div className="text-[10.5px] text-gray-300 text-center py-4 px-2">
                          {isLost ? 'Drag deal jika kalah' : 'Drag deal ke sini'}
                        </div>
                      )}
                      {colDeals.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          isWon={isWon}
                          isLost={isLost}
                          isDragging={draggingId === deal.id}
                          onDragStart={(e) => onDragStart(e, deal.id)}
                          onClick={() => setSelectedDeal(deal)}
                        />
                      ))}
                      {isLost && colDeals.length > 0 && (
                        <div className="text-[10px] text-gray-300 text-center mt-1 py-1.5 bg-white/60 rounded-lg">
                          Drag deal ke sini jika kalah
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
