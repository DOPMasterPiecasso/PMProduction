'use client';

import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, Plus, Upload, Bell, Save, Trash2, FileText, ChevronDown, ChevronRight, List, ExternalLink, Send, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { renderTemplate, DEFAULT_TEMPLATE_TERM, DEFAULT_TEMPLATE_TERM_PAYMENT } from '@/lib/whatsapp';

interface InvoiceClient { id: string; namaKlien: string; invoiceAccessCode?: string | null }
interface InvDoc { id: string; fileName: string; fileType: string | null; fileSizeBytes: number | null; fileUrl: string | null; uploadedAt: string }
interface InvTerm { id: string; terminKe: number; percentage: number | null; amount: number; jatuhTempo: string; status: string; paidAt: string | null; paidAmount: number | null; keterangan: string | null; documents?: InvDoc[] }
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
  documents: InvDoc[];
  terms: InvTerm[];
}

interface InvStats {
  paidThisMonth: number; paidCount: number;
  unpaidTotal: number; unpaidCount: number;
  partialTotal: number; partialCount: number;
  overdueTotal: number; overdueCount: number;
}

interface ClientGroup {
  clientId: string;
  clientName: string;
  invoices: Invoice[];
  totalNominal: number;
  totalPaid: number;
  totalRemaining: number;
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
  const diff = date.getTime() - Date.now();
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

function termBadge(s: string) {
  switch (s) {
    case 'paid': return 'bg-green-100 text-green-700';
    case 'overdue': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-500';
  }
}

function InvoiceFilesModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const [docs, setDocs] = useState<InvDoc[]>(invoice.documents || []);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    if (file.size > 20 * 1024 * 1024) { toast.error('File terlalu besar. Maksimal 20MB.'); return; }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { toast.error('Hanya file PDF yang diperbolehkan.'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invoiceId', invoice.id);
      const res = await fetch('/api/invoices/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal upload file');
      setDocs((prev) => [...prev, data.document]);
      toast.success('File berhasil diupload');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Gagal upload file'); }
    finally { setUploading(false); }
  }

  async function handleDelete(docId: string) {
    if (!confirm('Hapus file ini?')) return;
    setDeleting(docId);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setDocs((prev) => prev.filter((d) => d.id !== docId));
      toast.success('File berhasil dihapus');
    } catch { toast.error('Gagal menghapus file'); }
    finally { setDeleting(null); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold">File Invoice — {invoice.nomorInvoice}</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          <div className={`border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
            <div className="text-[12px] text-gray-400">{uploading ? 'Mengupload...' : 'Klik untuk upload file invoice'}</div>
             <div className="text-[10.5px] text-gray-300 mt-1">PDF — maks 20MB</div>
             <input type="file" className="hidden" ref={fileRef} accept=".pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }}
            />
          </div>
          {docs.length === 0 ? (
            <div className="text-center text-gray-300 text-[12px] py-6">Belum ada file</div>
          ) : (
            <div className="flex flex-col gap-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 px-3 py-2 bg-white border border-black/10 rounded-lg text-[11.5px] group">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate flex-1 text-[11.5px]">{doc.fileName}</span>
                  <a href={doc.fileUrl || '#'} target="_blank" rel="noreferrer"
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-blue-600 hover:bg-blue-50"
                    title="Lihat PDF"
                  ><ExternalLink className="w-3.5 h-3.5" /></a>
                  {doc.fileSizeBytes && <span className="text-[10px] text-gray-400 font-mono shrink-0">{(doc.fileSizeBytes / 1024 / 1024).toFixed(1)} MB</span>}
                  <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >{deleting === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-black/[0.06] flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium rounded-lg bg-[#18181B] text-white hover:bg-[#27272A]">Tutup</button>
        </div>
      </div>
    </div>
  );
}

function TerminModal({ invoice, onClose, onUpdated, onSendTerm }: { invoice: Invoice; onClose: () => void; onUpdated: () => void; onSendTerm?: (term: InvTerm) => void }) {
  const [terms, setTerms] = useState<InvTerm[]>(invoice.terms || []);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formKe, setFormKe] = useState(terms.length + 1);
  const [formPct, setFormPct] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDue, setFormDue] = useState('');
  const [formKet, setFormKet] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKe, setEditKe] = useState(1);
  const [editPct, setEditPct] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDue, setEditDue] = useState('');
  const [editKet, setEditKet] = useState('');
  const [uploadingTerm, setUploadingTerm] = useState<string | null>(null);
  const [uploadingTermDel, setUploadingTermDel] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTargetTermRef = useRef<string | null>(null);

  async function handleTermUpdate(termId: string, field: string, value: string | number) {
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id, termId, [field]: value }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.invoice?.terms) setTerms(data.invoice.terms);
      toast.success('Termin diperbarui');
      onUpdated();
    } catch { toast.error('Gagal mengupdate termin'); }
    finally { setSaving(false); }
  }

  function openForm() {
    setFormKe(terms.length + 1);
    setFormPct('');
    setFormAmount('');
    setFormDue('');
    setFormKet('');
    setShowForm(true);
  }

  async function handleSaveTerm() {
    if (!formAmount || parseFloat(formAmount) <= 0) { toast.error('Nominal termin harus diisi'); return; }
    if (!formDue) { toast.error('Pilih jatuh tempo termin'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoice.id, addTerm: true,
          terminKe: formKe,
          percentage: formPct ? parseFloat(formPct) : null,
          amount: parseFloat(formAmount),
          jatuhTempo: formDue,
          keterangan: formKet || null,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.invoice?.terms) setTerms(data.invoice.terms);
      toast.success('Termin ditambahkan');
      setShowForm(false);
      onUpdated();
    } catch { toast.error('Gagal menambah termin'); }
    finally { setSaving(false); }
  }

  function openEdit(t: InvTerm) {
    setEditingId(t.id);
    setEditKe(t.terminKe);
    setEditPct(t.percentage ? String(t.percentage) : '');
    setEditAmount(String(t.amount));
    setEditDue(new Date(t.jatuhTempo).toISOString().split('T')[0]);
    setEditKet(t.keterangan || '');
  }

  async function handleSaveEdit() {
    if (!editAmount || parseFloat(editAmount) <= 0) { toast.error('Nominal termin harus diisi'); return; }
    if (!editDue) { toast.error('Pilih jatuh tempo termin'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoice.id,
          editTerm: editingId,
          terminKe: editKe,
          percentage: editPct ? parseFloat(editPct) : null,
          amount: parseFloat(editAmount),
          jatuhTempo: editDue,
          keterangan: editKet || null,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.invoice?.terms) setTerms(data.invoice.terms);
      toast.success('Termin diperbarui');
      setEditingId(null);
      onUpdated();
    } catch { toast.error('Gagal mengupdate termin'); }
    finally { setSaving(false); }
  }

  async function handleDeleteTerm(termId: string) {
    if (!confirm('Hapus termin ini?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id, deleteTerm: termId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.invoice?.terms) setTerms(data.invoice.terms);
      toast.success('Termin dihapus');
      setEditingId(null);
      onUpdated();
    } catch { toast.error('Gagal menghapus termin'); }
    finally { setSaving(false); }
  }

  async function handleTermFileUpload(termId: string, file: File) {
    if (file.size > 20 * 1024 * 1024) { toast.error('File terlalu besar. Maksimal 20MB.'); return; }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { toast.error('Hanya file PDF yang diperbolehkan.'); return; }
    setUploadingTerm(termId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invoiceId', invoice.id);
      formData.append('termId', termId);
      const res = await fetch('/api/invoices/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal upload file');
      setTerms((prev) => prev.map((t) =>
        t.id === termId ? { ...t, documents: [...(t.documents || []), data.document] } : t
      ));
      toast.success('File terupload');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Gagal upload file'); }
    finally { setUploadingTerm(null); }
  }

  async function handleDeleteTermDoc(termId: string, docId: string) {
    if (!confirm('Hapus file ini?')) return;
    setUploadingTermDel(docId);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setTerms((prev) => prev.map((t) =>
        t.id === termId ? { ...t, documents: t.documents?.filter((d) => d.id !== docId) } : t
      ));
      toast.success('File dihapus');
    } catch { toast.error('Gagal menghapus file'); }
    finally { setUploadingTermDel(null); }
  }

  const totalTermAmount = terms.reduce((s, t) => s + t.amount, 0);
  const totalPaidTerms = terms.filter((t) => t.status === 'paid').reduce((s, t) => s + (t.paidAmount || t.amount), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <div>
            <span className="text-[14px] font-semibold">Termin — {invoice.nomorInvoice}</span>
            <span className="text-[11px] text-gray-400 ml-2">{invoice.client.namaKlien}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-gray-50 rounded-lg px-3 py-2"><div className="text-[10px] text-gray-400">Total Invoice</div><div className="text-[13px] font-semibold font-mono">{formatRp(invoice.nominal)}</div></div>
            <div className="bg-green-50 rounded-lg px-3 py-2"><div className="text-[10px] text-green-600">Telah Dibayar</div><div className="text-[13px] font-semibold font-mono text-green-700">{formatRp(totalPaidTerms)}</div></div>
            <div className="bg-amber-50 rounded-lg px-3 py-2"><div className="text-[10px] text-amber-600">Sisa</div><div className="text-[13px] font-semibold font-mono text-amber-700">{formatRp(invoice.nominal - totalPaidTerms)}</div></div>
            <div className="bg-blue-50 rounded-lg px-3 py-2"><div className="text-[10px] text-blue-600">Jumlah Termin</div><div className="text-[13px] font-semibold font-mono text-blue-700">{terms.length} termin</div></div>
          </div>

          {terms.length === 0 && !showForm ? (
            <div className="text-center text-gray-400 text-[12px] py-6">Belum ada termin.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {terms.map((t) => {
                const dueDate = new Date(t.jatuhTempo);
                const dueStr = dueDate.toISOString().split('T')[0];
                const isOverdue = dueDate < new Date() && t.status !== 'paid';
                const isEditing = editingId === t.id;
                return isEditing ? (
                  <div key={t.id} className="border-2 border-blue-200 bg-blue-50/30 rounded-xl p-4 flex flex-col gap-3">
                    <div className="text-[12px] font-semibold text-blue-700">Edit Termin {t.terminKe}</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 block mb-1">Termin Ke</label>
                        <input type="number" value={editKe} onChange={(e) => setEditKe(parseInt(e.target.value) || 1)}
                          className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 block mb-1">Persentase (%)</label>
                        <input type="number" value={editPct} onChange={(e) => setEditPct(e.target.value)}
                          className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" placeholder="30" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 block mb-1">Jumlah (Rp)</label>
                        <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" placeholder="5000000" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 block mb-1">Jatuh Tempo</label>
                        <input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)}
                          className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 block mb-1">Keterangan</label>
                        <input type="text" value={editKet} onChange={(e) => setEditKet(e.target.value)}
                          className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" placeholder="Opsional" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button onClick={() => setEditingId(null)} className="text-[11px] px-3 py-1.5 rounded-lg border border-black/10 text-gray-600 hover:bg-gray-50">Batal</button>
                      <button onClick={handleSaveEdit} disabled={saving}
                        className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                      >{saving ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                  </div>
                ) : (
                  <div key={t.id} className={`border rounded-xl px-4 py-3 ${t.status === 'paid' ? 'bg-green-50/50 border-green-200' : isOverdue ? 'bg-red-50/50 border-red-200' : 'border-black/10'}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold">Termin {t.terminKe}</span>
                        {t.percentage && <span className="text-[11px] text-gray-400">({t.percentage}%)</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono font-semibold">{formatRp(t.amount)}</span>
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => onSendTerm?.(t)}
                            className="w-6 h-6 flex items-center justify-center rounded text-green-500 hover:text-green-700 hover:bg-green-50"
                            title="Kirim WhatsApp Termin"><Send className="w-3 h-3" /></button>
                          <button onClick={() => openEdit(t)}
                            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 text-[11px]"
                            title="Edit">✎</button>
                          <button onClick={() => handleDeleteTerm(t.id)}
                            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 text-[11px]"
                            title="Hapus">✕</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
                      <select value={t.status} onChange={(e) => handleTermUpdate(t.id, 'termStatus', e.target.value)}
                        className={`text-[10px] border rounded-md px-2 py-0.5 focus:outline-none ${termBadge(t.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <span>Jatuh tempo: {dueStr}</span>
                      {t.status === 'paid' && t.paidAt && <span>Lunas: {new Date(t.paidAt).toLocaleDateString('id-ID')}</span>}
                      {t.keterangan && <span className="text-gray-400">— {t.keterangan}</span>}
                    </div>
                    {t.documents && t.documents.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {t.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-1 bg-white border border-black/10 rounded-md px-2 py-1 text-[10px] group">
                            <span className="truncate max-w-[100px]">{doc.fileName}</span>
                            <a href={doc.fileUrl || '#'} target="_blank" rel="noreferrer"
                              className="shrink-0 w-4 h-4 flex items-center justify-center rounded text-gray-300 hover:text-blue-600 hover:bg-blue-50"
                              title="Lihat PDF"
                            ><ExternalLink className="w-3 h-3" /></a>
                            <button onClick={() => handleDeleteTermDoc(t.id, doc.id)} disabled={uploadingTermDel === doc.id}
                              className="shrink-0 w-4 h-4 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >{uploadingTermDel === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2">
                      <button onClick={() => { uploadTargetTermRef.current = t.id; fileRef.current?.click(); }}
                        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600"
                      >{uploadingTerm === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Upload File</button>
                       <input type="file" className="hidden" ref={fileRef} accept=".pdf"
                        onChange={(e) => { const f = e.target.files?.[0]; const target = uploadTargetTermRef.current; if (f && target) handleTermFileUpload(target, f); e.target.value = ''; }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showForm && (
            <div className="border-2 border-blue-200 bg-blue-50/30 rounded-xl p-4 flex flex-col gap-3">
              <div className="text-[12px] font-semibold text-blue-700">Termin Baru</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 block mb-1">Termin Ke</label>
                  <input type="number" value={formKe} onChange={(e) => setFormKe(parseInt(e.target.value) || 1)}
                    className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 block mb-1">Persentase (%)</label>
                  <input type="number" value={formPct} onChange={(e) => setFormPct(e.target.value)}
                    className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" placeholder="30" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 block mb-1">Jumlah (Rp)</label>
                  <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" placeholder="5000000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 block mb-1">Jatuh Tempo</label>
                  <input type="date" value={formDue} onChange={(e) => setFormDue(e.target.value)}
                    className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 block mb-1">Keterangan</label>
                  <input type="text" value={formKet} onChange={(e) => setFormKet(e.target.value)}
                    className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" placeholder="Opsional" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-1">
                <button onClick={() => setShowForm(false)} className="text-[11px] px-3 py-1.5 rounded-lg border border-black/10 text-gray-600 hover:bg-gray-50">Batal</button>
                <button onClick={handleSaveTerm} disabled={saving}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                >{saving ? 'Menyimpan...' : 'Simpan Termin'}</button>
              </div>
            </div>
          )}

          {!showForm && (
            <button onClick={openForm}
              className="flex items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-xl py-3 text-[12px] text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
            ><Plus className="w-3.5 h-3.5" /> Tambah Termin</button>
          )}
        </div>
        <div className="px-5 py-3 border-t border-black/[0.06] flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium rounded-lg bg-[#18181B] text-white hover:bg-[#27272A]">Tutup</button>
        </div>
      </div>
    </div>
  );
}

function SendInvoiceModal({ invoice, onClose, onSent }: { invoice: Invoice; onClose: () => void; onSent: () => void }) {
  const [sending, setSending] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [messageType, setMessageType] = useState<'invoice' | 'payment_confirm'>('invoice');
  const [customMessage, setCustomMessage] = useState('');

  const fetchPreview = useCallback(async (type: 'invoice' | 'payment_confirm') => {
    setLoadingPreview(true);
    try {
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id, messageType: type, preview: true }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCustomMessage(data.message || '');
    } catch {
      setCustomMessage('Gagal memuat preview pesan');
    } finally {
      setLoadingPreview(false);
    }
  }, [invoice.id]);

  useEffect(() => { fetchPreview(messageType); }, [messageType, fetchPreview]);

  async function handleSend() {
    if (!customMessage.trim()) { toast.error('Pesan tidak boleh kosong'); return; }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id, messageType, message: customMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim');
      setResult({ success: true, message: 'Pesan berhasil dikirim via WhatsApp' });
      onSent();
    } catch (e) {
      setResult({ success: false, message: e instanceof Error ? e.message : 'Gagal mengirim pesan' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold">Kirim Invoice via WhatsApp</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="text-[11px] text-gray-500">{invoice.nomorInvoice} — {invoice.client.namaKlien}</div>
            <div className="text-[13px] font-semibold mt-0.5">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(invoice.nominal)}
            </div>
          </div>

          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1.5">Tipe Pesan</label>
            <div className="flex gap-2">
              <button onClick={() => { if (!sending && !result?.success) setMessageType('invoice'); }}
                className={`flex-1 text-[11px] px-3 py-2 rounded-lg border font-medium ${messageType === 'invoice' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-black/10 text-gray-600 hover:bg-gray-50'}`}
              >Invoice Baru</button>
              <button onClick={() => { if (!sending && !result?.success) setMessageType('payment_confirm'); }}
                className={`flex-1 text-[11px] px-3 py-2 rounded-lg border font-medium ${messageType === 'payment_confirm' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-black/10 text-gray-600 hover:bg-gray-50'}`}
              >Konfirmasi Bayar</button>
            </div>
          </div>

          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1.5">
              Pesan <span className="text-gray-400 font-normal">(bisa diedit)</span>
            </label>
            {loadingPreview ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
            ) : (
              <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 resize-y min-h-[120px] leading-relaxed"
                rows={8}
              />
            )}
          </div>

          {result && (
            <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-[12px] ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{result.message}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/[0.07]">
          <button onClick={onClose} className="text-[12px] px-4 py-2 rounded-lg border border-black/10 text-gray-600 hover:bg-gray-50">
            {result?.success ? 'Tutup' : 'Batal'}
          </button>
          {!result?.success && (
            <button onClick={handleSend} disabled={sending || loadingPreview}
              className="bg-green-600 text-white text-[12px] px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
            >{sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} {sending ? 'Mengirim...' : 'Kirim WhatsApp'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function SendTermModal({ invoice, term, onClose, onSent }: { invoice: Invoice; term: InvTerm; onClose: () => void; onSent: () => void }) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [messageType, setMessageType] = useState<'term_reminder' | 'term_payment_confirm'>('term_reminder');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    const due = new Date(term.jatuhTempo);
    const dueStr = due.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const nominal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(term.amount);
    const accessCode = invoice.client.invoiceAccessCode;
    const vars: Record<string, string> = {
      namaKlien: invoice.client.namaKlien,
      nomorInvoice: invoice.nomorInvoice,
      namaProject: invoice.namaProject || '-',
      nominal,
      jatuhTempo: dueStr,
      terminKe: String(term.terminKe),
      nominalTermin: nominal,
      jatuhTempoTermin: dueStr,
      kodeAkses: accessCode ? `*Kode Akses:* ${accessCode}\n` : '',
      linkInvoice: `*Link Invoice:* ${window.location.origin}/invoice/${invoice.id}\n`,
      namaStudio: 'CreativeOS',
    };
    const template = messageType === 'term_payment_confirm' ? DEFAULT_TEMPLATE_TERM_PAYMENT : DEFAULT_TEMPLATE_TERM;
    setCustomMessage(renderTemplate(template, vars));
  }, [invoice, term, messageType]);

  async function handleSend() {
    if (!customMessage.trim()) { toast.error('Pesan tidak boleh kosong'); return; }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          message: customMessage,
          messageType: messageType === 'term_payment_confirm' ? 'payment_confirm' : 'invoice',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim');
      setResult({ success: true, message: 'Pesan berhasil dikirim via WhatsApp' });
      onSent();
    } catch (e) {
      setResult({ success: false, message: e instanceof Error ? e.message : 'Gagal mengirim pesan' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold">Kirim Termin via WhatsApp</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="text-[11px] text-gray-500">{invoice.nomorInvoice} — {invoice.client.namaKlien}</div>
            <div className="text-[13px] font-semibold mt-0.5">Termin {term.terminKe} — {formatRp(term.amount)}</div>
            <div className="text-[11px] text-gray-500 mt-1">Jatuh tempo: {new Date(term.jatuhTempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>

          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1.5">Tipe Pesan</label>
            <div className="flex gap-2">
              <button onClick={() => { if (!sending && !result?.success) setMessageType('term_reminder'); }}
                className={`flex-1 text-[11px] px-3 py-2 rounded-lg border font-medium ${messageType === 'term_reminder' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-black/10 text-gray-600 hover:bg-gray-50'}`}
              >Pengingat Termin</button>
              <button onClick={() => { if (!sending && !result?.success) setMessageType('term_payment_confirm'); }}
                className={`flex-1 text-[11px] px-3 py-2 rounded-lg border font-medium ${messageType === 'term_payment_confirm' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-black/10 text-gray-600 hover:bg-gray-50'}`}
              >Konfirmasi Bayar</button>
            </div>
          </div>

          <div>
            <label className="text-[11.5px] font-medium text-gray-600 block mb-1.5">
              Pesan <span className="text-gray-400 font-normal">(bisa diedit)</span>
            </label>
            <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 resize-y min-h-[120px] leading-relaxed"
              rows={8}
            />
          </div>

          {result && (
            <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-[12px] ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{result.message}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/[0.07]">
          <button onClick={onClose} className="text-[12px] px-4 py-2 rounded-lg border border-black/10 text-gray-600 hover:bg-gray-50">
            {result?.success ? 'Tutup' : 'Batal'}
          </button>
          {!result?.success && (
            <button onClick={handleSend} disabled={sending}
              className="bg-green-600 text-white text-[12px] px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
            >{sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} {sending ? 'Mengirim...' : 'Kirim WhatsApp'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReminderModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const [reminders, setReminders] = useState<Record<number, boolean>>({});
  const [availableDays, setAvailableDays] = useState<number[]>([1, 3, 5, 7]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [remRes, settingsRes] = await Promise.all([
        fetch(`/api/invoices/${invoice.id}/reminders`),
        fetch('/api/settings'),
      ]);
      const remData = await remRes.json();
      const settingsData = await settingsRes.json();
      const days: number[] = JSON.parse(settingsData.systemSettings?.invoice_reminder_days || '[1,3,5,7]');
      setAvailableDays(days);
      const map: Record<number, boolean> = {};
      for (const r of remData.reminders || []) map[r.daysBefore] = r.isActive;
      setReminders(map);
    } catch { toast.error('Gagal memuat data reminder'); }
    finally { setLoading(false); }
  }, [invoice.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function toggleReminder(daysBefore: number, active: boolean) {
    setSaving(daysBefore);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysBefore, isActive: active }),
      });
      if (!res.ok) throw new Error();
      setReminders((prev) => ({ ...prev, [daysBefore]: active }));
      toast.success(active ? 'Reminder diaktifkan' : 'Reminder dinonaktifkan');
    } catch { toast.error('Gagal menyimpan reminder'); }
    finally { setSaving(null); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold">Reminder Otomatis</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="text-[11px] text-gray-500">{invoice.nomorInvoice} — {invoice.client.namaKlien}</div>
            <div className="text-[13px] font-semibold mt-0.5">{formatRp(invoice.nominal)}</div>
          </div>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
          ) : (
            <div className="flex flex-col gap-2">
              {availableDays.map((day) => {
                const active = !!reminders[day];
                return (
                  <label key={day} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${active ? 'border-blue-300 bg-blue-50' : 'border-black/10 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={active} disabled={saving === day} onChange={() => toggleReminder(day, !active)} className="rounded" />
                    <div className="flex-1">
                      <span className="text-[12.5px] font-medium">H-{day}</span>
                      <span className="text-[11px] text-gray-400 ml-2">{day === 1 ? 'Besok' : `${day} hari sebelum jatuh tempo`}</span>
                    </div>
                    {saving === day && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                  </label>
                );
              })}
              {availableDays.length === 0 && (
                <p className="text-[12px] text-gray-400 text-center py-4">Tidak ada opsi reminder. Atur di Settings &gt; Pengaturan Reminder Invoice.</p>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end px-5 py-3 border-t border-black/[0.07]">
          <button onClick={onClose} className="text-[12px] px-4 py-2 rounded-lg bg-[#18181B] text-white hover:opacity-85">Tutup</button>
        </div>
      </div>
    </div>
  );
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
  const [filesInvoice, setFilesInvoice] = useState<Invoice | null>(null);
  const [terminInvoice, setTerminInvoice] = useState<Invoice | null>(null);
  const [sendInvoice, setSendInvoice] = useState<Invoice | null>(null);
  const [sendTermInvoice, setSendTermInvoice] = useState<Invoice | null>(null);
  const [sendTerm, setSendTerm] = useState<InvTerm | null>(null);
  const [reminderInvoice, setReminderInvoice] = useState<Invoice | null>(null);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

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
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  async function handleDelete(id: string) {
    if (!confirm('Hapus invoice ini?')) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Invoice berhasil dihapus');
      fetchInvoices();
    } catch { toast.error('Gagal menghapus invoice'); }
  }

  function toggleClient(clientId: string) {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId); else next.add(clientId);
      return next;
    });
  }

  const groups: ClientGroup[] = (() => {
    const map = new Map<string, Invoice[]>();
    for (const inv of invoices) {
      const existing = map.get(inv.client.id) || [];
      existing.push(inv);
      map.set(inv.client.id, existing);
    }
    const result: ClientGroup[] = [];
    for (const [clientId, invs] of map) {
      result.push({
        clientId, clientName: invs[0].client.namaKlien,
        invoices: invs,
        totalNominal: invs.reduce((s, i) => s + i.nominal, 0),
        totalPaid: invs.reduce((s, i) => s + (i.paidAmount || 0), 0),
        totalRemaining: invs.reduce((s, i) => s + (i.nominal - (i.paidAmount || 0)), 0),
      });
    }
    result.sort((a, b) => b.totalRemaining - a.totalRemaining);
    return result;
  })();

  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const thisMonthLabel = monthNames[now.getMonth()];

  return (
    <div className="p-[20px_24px] flex flex-col gap-[16px]">
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreated={fetchInvoices} />}
      {filesInvoice && <InvoiceFilesModal invoice={filesInvoice} onClose={() => { setFilesInvoice(null); fetchInvoices(); }} />}
      {terminInvoice && <TerminModal invoice={terminInvoice} onClose={() => setTerminInvoice(null)} onUpdated={fetchInvoices} onSendTerm={(term) => { setSendTermInvoice(terminInvoice); setSendTerm(term); }} />}
      {sendInvoice && <SendInvoiceModal invoice={sendInvoice} onClose={() => setSendInvoice(null)} onSent={fetchInvoices} />}
      {sendTermInvoice && sendTerm && <SendTermModal invoice={sendTermInvoice} term={sendTerm} onClose={() => { setSendTermInvoice(null); setSendTerm(null); }} onSent={fetchInvoices} />}
      {reminderInvoice && <ReminderModal invoice={reminderInvoice} onClose={() => setReminderInvoice(null)} />}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Invoices</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Group by client — klik client untuk lihat detail</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-[#18181B] text-white flex items-center px-3 py-2 rounded-lg text-[12.5px] font-medium hover:opacity-85"
        ><Plus className="w-3.5 h-3.5 mr-1.5" /> Buat Invoice</button>
      </div>

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

      <div className="flex items-center gap-2 bg-white border border-black/10 rounded-lg px-3 py-2 max-w-xs">
        <Search className="w-3.5 h-3.5 text-gray-400" />
        <input placeholder="Cari klien / invoice..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="text-[12px] bg-transparent outline-none flex-1 placeholder:text-gray-300" />
      </div>

      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : groups.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-[13px]">{search ? 'Tidak ada yang cocok.' : 'Belum ada invoice.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="w-6 px-3 py-3"></th>
                  <th className="text-left px-3 py-3">Client</th>
                  <th className="text-left px-3 py-3">Jml Invoice</th>
                  <th className="text-left px-3 py-3">Total Tagihan</th>
                  <th className="text-left px-3 py-3">Total Dibayar</th>
                  <th className="text-left px-3 py-3">Sisa</th>
                  <th className="text-left px-3 py-3">Termin</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const isExpanded = expandedClients.has(g.clientId);
                  const allPaid = g.invoices.every((i) => i.status === 'paid');
                  const hasOverdue = g.invoices.some((i) => i.status === 'overdue' || (i.status !== 'paid' && new Date(i.jatuhTempo) < now));
                  return (
                    <React.Fragment key={g.clientId}>
                      <tr onClick={() => toggleClient(g.clientId)}
                        className={`border-b border-black/5 cursor-pointer hover:bg-gray-50/50 ${allPaid ? 'opacity-70' : ''} ${hasOverdue ? 'bg-red-50/30' : ''}`}
                      >
                        <td className="px-3 py-3">{isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}</td>
                        <td className="px-3 py-3 font-medium">{g.clientName}</td>
                        <td className="px-3 py-3 font-mono">{g.invoices.length}</td>
                        <td className="px-3 py-3 font-mono font-semibold">{formatRp(g.totalNominal)}</td>
                        <td className="px-3 py-3 font-mono text-green-600">{formatRp(g.totalPaid)}</td>
                        <td className={`px-3 py-3 font-mono font-semibold ${g.totalRemaining > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatRp(g.totalRemaining)}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1">
                            {g.invoices.map((inv) => (
                              <span key={inv.id} className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${inv.terms.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                {inv.terms.filter((t) => t.status === 'paid').length}/{inv.terms.length}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && g.invoices.map((inv) => {
                        const dueDate = new Date(inv.jatuhTempo);
                        const dueStr = dueDate.toISOString().split('T')[0];
                        const isOverdue = dueDate < now && inv.status !== 'paid';
                        const prioLabel = inv.status === 'paid' ? 'Paid' : isOverdue ? '1 - URGENT' : `2 - ${daysUntil(dueDate)} hari`;
                        const prioColor = inv.status === 'paid' ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
                        return (
                          <tr key={inv.id} className="border-b border-black/5 bg-gray-50/30">
                            <td colSpan={7} className="px-3 py-2">
                              <div className="ml-6 flex items-center gap-3 flex-wrap">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${prioColor}`}>{prioLabel}</span>
                                <span className="font-mono text-blue-600 text-[11px]">{inv.nomorInvoice}</span>
                                <span className="text-gray-500 text-[11px]">{inv.namaProject || '-'}</span>
                                <span className="font-mono font-semibold text-[11px]">{formatRp(inv.nominal)}</span>
                                <span className="text-[11px]">Jatuh tempo: <input type="date" value={dueStr}
                                  onChange={(e) => { fetch('/api/invoices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: inv.id, jatuhTempo: e.target.value }) }).then(() => { toast.success('Diperbarui'); fetchInvoices(); }).catch(() => toast.error('Gagal')); }}
                                  className={`border border-black/10 rounded px-1 py-0.5 text-[11px] font-mono ${isOverdue ? 'text-red-600' : ''}`}
                                /></span>
                                <select value={inv.status}
                                  onChange={(e) => { fetch('/api/invoices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: inv.id, status: e.target.value }) }).then(() => { toast.success('Status diubah'); fetchInvoices(); }).catch(() => toast.error('Gagal')); }}
                                  className={`text-[10px] border rounded-md px-1.5 py-0.5 focus:outline-none ${statusColor(inv.status)}`}
                                >
                                  <option value="unpaid">Unpaid</option>
                                  <option value="partial">Partial</option>
                                  <option value="paid">Paid</option>
                                  <option value="overdue">Overdue</option>
                                </select>
                                <div className="flex gap-1 ml-auto">
                                  <button onClick={(e) => { e.stopPropagation(); setReminderInvoice(inv); }}
                                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-amber-600 hover:bg-amber-50"
                                  ><Bell className="w-3 h-3" /> Reminder</button>
                                  <button onClick={(e) => { e.stopPropagation(); setSendInvoice(inv); }}
                                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-green-600 hover:bg-green-50"
                                  ><Send className="w-3 h-3" /> WA</button>
                                  {inv.terms.length > 0 && (
                                    <button onClick={(e) => { e.stopPropagation(); setTerminInvoice(inv); }}
                                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                    ><List className="w-3 h-3" /> {inv.terms.length} termin</button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); setFilesInvoice(inv); }}
                                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                  ><FileText className="w-3 h-3" /> {inv.documents.length > 0 ? `${inv.documents.length} file` : 'File'}</button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }}
                                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                  ><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-gray-50/50 border-t border-black/5 text-[11px] text-gray-400">
              {invoices.length} invoice dari {groups.length} klien
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
    fetch('/api/deals').then((r) => r.json()).then((data) => setDeals(data.deals || [])).catch(() => toast.error('Gagal memuat daftar deal'));
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
          jatuhTempo, status, keterangan: keterangan || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Invoice berhasil dibuat');
      onCreated();
      onClose();
    } catch { toast.error('Gagal membuat invoice'); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
          <span className="text-[14px] font-semibold">Buat Invoice</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div><label className="text-[11.5px] font-medium text-gray-600 block mb-1">No. Invoice</label><input className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-gray-50 text-gray-400" value="(auto)" readOnly /></div>
          <div><label className="text-[11.5px] font-medium text-gray-600 block mb-1">Project</label>
            <select value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none">
              <option value="">— Pilih Project —</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.service?.nama || '-'} — {d.client.namaKlien} ({formatRp(d.nilai)})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nominal (Rp)</label><input type="number" value={nominal} onChange={(e) => setNominal(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" placeholder="15000000" /></div>
            <div><label className="text-[11.5px] font-medium text-gray-600 block mb-1">Jatuh Tempo</label><input type="date" value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" /></div>
          </div>
          <div><label className="text-[11.5px] font-medium text-gray-600 block mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none">
              <option value="unpaid">Unpaid</option><option value="partial">Partial</option><option value="paid">Paid</option>
            </select>
          </div>
          <div><label className="text-[11.5px] font-medium text-gray-600 block mb-1">Keterangan</label><input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" placeholder="Opsional" /></div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/[0.07]">
          <button onClick={onClose} className="text-[12px] px-4 py-2 rounded-lg border border-black/10 text-gray-600 hover:bg-gray-50">Batal</button>
          <button onClick={handleCreate} disabled={saving} className="bg-[#18181B] text-white text-[12px] px-4 py-2 rounded-lg font-medium hover:opacity-85 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Buat Invoice'}</button>
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
