'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Search, Send, CheckCircle2, XCircle, Trash2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface MessageInvoice {
  id: string;
  nomorInvoice: string;
  nominal: number;
  status: string;
}

interface MessageLog {
  id: string;
  clientName: string;
  phoneNumber: string;
  message: string;
  messageType: string;
  status: string;
  sentAt: string;
  error: string | null;
  invoice: MessageInvoice | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function statusBadge(s: string) {
  switch (s) {
    case 'sent': return 'bg-green-100 text-green-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-500';
  }
}

function statusIcon(s: string) {
  switch (s) {
    case 'sent': return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
    case 'failed': return <XCircle className="w-3.5 h-3.5 text-red-600" />;
    default: return null;
  }
}

function typeLabel(t: string) {
  switch (t) {
    case 'invoice': return 'Invoice';
    case 'payment': return 'Pembayaran';
    case 'reminder': return 'Pengingat';
    default: return t;
  }
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMessages = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '50');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/messages?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages || []);
      setPagination(data.pagination);
    } catch {
      toast.error('Gagal memuat riwayat pesan');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  function handleSearch(val: string) {
    setSearch(val);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchMessages(1), 400);
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus log pesan ini?')) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success('Pesan dihapus');
      fetchMessages(pagination.page);
    } catch {
      toast.error('Gagal menghapus pesan');
    }
  }

  return (
    <div className="p-[20px_24px] flex flex-col gap-[16px]">
      <div>
        <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Riwayat Pesan</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Log pengiriman invoice via WhatsApp</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-black/10 rounded-lg px-3 py-2 max-w-xs flex-1">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input placeholder="Cari klien / nomor..." value={search} onChange={(e) => handleSearch(e.target.value)}
            className="text-[12px] bg-transparent outline-none flex-1 placeholder:text-gray-300" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="sent">Terkirim</option>
          <option value="failed">Gagal</option>
        </select>
      </div>

      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-[13px]">Belum ada riwayat pesan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                  <th className="text-left px-3 py-2.5">Status</th>
                  <th className="text-left px-3 py-2.5">Klien</th>
                  <th className="text-left px-3 py-2.5">Nomor</th>
                  <th className="text-left px-3 py-2.5">Invoice</th>
                  <th className="text-left px-3 py-2.5">Tipe</th>
                  <th className="text-left px-3 py-2.5">Waktu</th>
                  <th className="text-left px-3 py-2.5">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} className="border-b border-black/5 hover:bg-gray-50/50">
                    <td className="px-3 py-2.5">{statusIcon(m.status)}</td>
                    <td className="px-3 py-2.5 font-medium">{m.clientName}</td>
                    <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{m.phoneNumber}</td>
                    <td className="px-3 py-2.5">
                      {m.invoice ? (
                        <span className="text-blue-600 font-mono text-[11px]">{m.invoice.nomorInvoice}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600`}>
                        {typeLabel(m.messageType)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-[11px]">
                      {new Date(m.sentAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => handleDelete(m.id)}
                        className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-black/10 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      ><Trash2 className="w-3 h-3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/50 border-t border-black/5 text-[11px] text-gray-400">
                <span>{pagination.total} pesan (hal {pagination.page}/{pagination.totalPages})</span>
                <div className="flex gap-1">
                  <button onClick={() => fetchMessages(pagination.page - 1)} disabled={pagination.page <= 1}
                    className="px-2 py-1 rounded border border-black/10 hover:bg-white disabled:opacity-30"
                  ><ChevronLeft className="w-3 h-3" /></button>
                  <button onClick={() => fetchMessages(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                    className="px-2 py-1 rounded border border-black/10 hover:bg-white disabled:opacity-30"
                  ><ChevronRight className="w-3 h-3" /></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
