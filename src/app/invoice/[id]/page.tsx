'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, FileText, Lock, Loader2, KeyRound, Eye } from 'lucide-react';

interface InvDoc {
  id: string; fileName: string; fileType: string | null; fileSizeBytes: number | null; fileUrl: string | null;
}
interface InvTerm {
  id: string; terminKe: number; percentage: number | null; amount: number; jatuhTempo: string; status: string; paidAt: string | null; paidAmount: number | null; documents: InvDoc[];
}
interface InvoiceData {
  id: string; nomorInvoice: string; namaProject: string | null; nominal: number; tanggalTerbit: string; jatuhTempo: string; status: string; keterangan: string | null; paidAmount: number | null;
  client: { namaKlien: string; namaContact: string | null; noHp: string | null; email: string | null };
  documents: InvDoc[]; terms: InvTerm[];
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
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
    case 'paid': return 'Lunas';
    case 'overdue': return 'Jatuh Tempo';
    case 'partial': return 'Dibayar Sebagian';
    default: return 'Belum Dibayar';
  }
}

export default function InvoicePreviewPage() {
  const params = useParams();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasAccessCode, setHasAccessCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!id) return;
    const verified = sessionStorage.getItem(`inv_code_${id}`);
    if (verified) {
      setCodeVerified(true);
    }
    fetch(`/api/invoices/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setNotFound(true); return; }
        setInvoice(data.invoice);
        setHasAccessCode(data.hasAccessCode);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleVerify() {
    if (!code.trim()) { setCodeError('Masukkan kode akses'); return; }
    setVerifying(true);
    setCodeError('');
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        sessionStorage.setItem(`inv_code_${id}`, 'true');
        setCodeVerified(true);
      } else {
        setCodeError(data.error || 'Kode akses salah');
      }
    } catch {
      setCodeError('Gagal verifikasi. Coba lagi.');
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3">📄</div>
          <div className="text-[14px] font-medium">Invoice tidak ditemukan</div>
        </div>
      </div>
    );
  }

  if (hasAccessCode && !codeVerified) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-black/[.07] w-full max-w-sm overflow-hidden">
          <div className="px-6 py-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-center">
              <div className="text-[15px] font-semibold">Invoice Terproteksi</div>
              <div className="text-[12px] text-gray-400 mt-1">Masukkan kode akses untuk melihat invoice ini</div>
            </div>
            <div className="w-full flex flex-col gap-2">
              <input
                type="password"
                value={code}
                onChange={(e) => { setCode(e.target.value); setCodeError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
                placeholder="Kode akses"
                className="w-full text-[13px] border border-black/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 text-center"
                autoFocus
              />
              {codeError && <div className="text-[11px] text-red-500 text-center">{codeError}</div>}
            </div>
            <button onClick={handleVerify} disabled={verifying}
              className="w-full bg-blue-600 text-white text-[12px] font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >{verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />} {verifying ? 'Memverifikasi...' : 'Buka Invoice'}</button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const due = new Date(invoice.jatuhTempo);
  const dueStr = due.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const terbit = new Date(invoice.tanggalTerbit);
  const terbitStr = terbit.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const totalTerms = invoice.terms.reduce((s, t) => s + t.amount, 0);
  const paidTerms = invoice.terms.filter((t) => t.status === 'paid').reduce((s, t) => s + (t.paidAmount || t.amount), 0);

  return (
    <div className="min-h-screen bg-[#F5F4F0] py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-black/[.07] overflow-hidden">
        <div className="px-6 py-5 border-b border-black/[.07] flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold">Invoice {invoice.nomorInvoice}</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">{invoice.client.namaKlien}</p>
          </div>
          <span className={`text-[11px] font-medium px-3 py-1.5 rounded-full border ${statusColor(invoice.status)}`}>
            {statusLabel(invoice.status)}
          </span>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Project</div>
              <div className="font-medium">{invoice.namaProject || '-'}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Nominal</div>
              <div className="font-semibold font-mono text-[15px]">{formatRp(invoice.nominal)}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Tanggal Terbit</div>
              <div>{terbitStr}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Jatuh Tempo</div>
              <div className={due < new Date() && invoice.status !== 'paid' ? 'text-red-600 font-medium' : ''}>{dueStr}</div>
            </div>
          </div>

          {invoice.keterangan && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-[12px] text-gray-600">
              {invoice.keterangan}
            </div>
          )}

          {invoice.documents.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">File Invoice</div>
              <div className="flex flex-col gap-1.5">
                {invoice.documents.map((doc) => (
                  <a key={doc.id} href={doc.fileUrl || '#'} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-black/10 rounded-lg text-[12px] hover:bg-gray-50 transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate flex-1">{doc.fileName}</span>
                    {doc.fileSizeBytes && (
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">{(doc.fileSizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                    )}
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-600 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {invoice.terms.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Rincian Termin</div>
              <div className="flex flex-col gap-1.5">
                {invoice.terms.map((t) => {
                  const tDue = new Date(t.jatuhTempo);
                  const tDueStr = tDue.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                  const isOverdue = tDue < new Date() && t.status !== 'paid';
                  return (
                    <div key={t.id} className={`px-3 py-2 rounded-lg border text-[12px] ${t.status === 'paid' ? 'bg-green-50 border-green-200' : isOverdue ? 'bg-red-50 border-red-200' : 'border-black/10'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Termin {t.terminKe}</span>
                          {t.percentage && <span className="text-gray-400">({t.percentage}%)</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-medium">{formatRp(t.amount)}</span>
                          <span className="text-gray-400 text-[11px]">{tDueStr}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${t.status === 'paid' ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                            {t.status === 'paid' ? 'Lunas' : isOverdue ? 'Overdue' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      {t.documents && t.documents.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-black/[0.06]">
                          {t.documents.map((doc) => (
                            <a key={doc.id} href={doc.fileUrl || '#'} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 px-2 py-1 bg-white border border-black/10 rounded-md text-[10px] hover:bg-gray-50 transition-colors group"
                            >
                              <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[120px]">{doc.fileName}</span>
                              <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-blue-600 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-3 px-3 py-2 bg-gray-50 rounded-lg text-[12px]">
                <span className="font-medium">Total Dibayar</span>
                <span className="font-mono font-semibold text-green-700">{formatRp(paidTerms)}</span>
              </div>
              {totalTerms !== invoice.nominal && (
                <div className="flex items-center justify-between mt-1 px-3 py-2 bg-gray-50 rounded-lg text-[12px]">
                  <span className="font-medium">Sisa</span>
                  <span className="font-mono font-semibold text-red-600">{formatRp(invoice.nominal - paidTerms)}</span>
                </div>
              )}
            </div>
          )}

          {invoice.terms.length === 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between text-[13px]">
              <span className="font-medium">Status Pembayaran</span>
              <span className={`font-semibold ${invoice.status === 'paid' ? 'text-green-600' : invoice.status === 'overdue' ? 'text-red-600' : 'text-amber-600'}`}>
                {statusLabel(invoice.status)}
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-black/[.07] bg-gray-50/50 text-center text-[11px] text-gray-400">
          Invoice ini dibuat secara otomatis melalui CreativeOS
        </div>
      </div>
    </div>
  );
}
