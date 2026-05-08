'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Loader2, CheckCircle2, Filter, Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ActivityType { id: string; nama: string; colorHex: string }
interface User { id: string; nama: string; avatarInitial: string | null }
interface Client { id: string; namaKlien: string }

interface Activity {
  id: string;
  clientId: string | null;
  dealId: string | null;
  typeId: string;
  picId: string | null;
  tanggalAktivitas: string;
  catatan: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  isDone: boolean;
  fileUrl: string | null;
  fileName: string | null;
  type: ActivityType | null;
  pic: User | null;
  client: { id: string; namaKlien: string } | null;
  deal: { id: string; client: { namaKlien: string } } | null;
}

interface ActivityForm {
  clientId: string;
  typeId: string;
  picId: string;
  tanggalAktivitas: string;
  catatan: string;
  nextAction: string;
  nextActionDate: string;
  isDone: boolean;
  fileUrl: string;
  fileName: string;
}

interface ActivityStats {
  overdue: number;
  today: number;
  upcoming: number;
  total: number;
}

const emptyForm: ActivityForm = {
  clientId: '',
  typeId: '',
  picId: '',
  tanggalAktivitas: new Date().toISOString().split('T')[0],
  catatan: '',
  nextAction: '',
  nextActionDate: '',
  isDone: false,
  fileUrl: '',
  fileName: '',
};

const typeColors: Record<string, string> = {
  Call: 'bg-blue-100 text-blue-700',
  Meeting: 'bg-green-100 text-green-700',
  'Chat/WA': 'bg-green-100 text-green-700',
  Proposal: 'bg-amber-100 text-amber-700',
  Visit: 'bg-purple-100 text-purple-700',
  Email: 'bg-gray-100 text-gray-600',
  'Follow Up': 'bg-red-100 text-red-700',
};

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplay(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function ActivityDialog({
  open,
  onOpenChange,
  form,
  setForm,
  activityTypes,
  users,
  clients,
  saving,
  onSubmit,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: ActivityForm;
  setForm: (f: ActivityForm) => void;
  activityTypes: ActivityType[];
  users: User[];
  clients: Client[];
  saving: boolean;
  onSubmit: () => void;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Tipe *</label>
              <Select value={form.typeId} onValueChange={(v) => setForm({ ...form, typeId: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe">
                    {form.typeId ? activityTypes.find(t => t.id === form.typeId)?.nama : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Tanggal *</label>
              <Input
                type="date"
                value={form.tanggalAktivitas}
                onChange={(e) => setForm({ ...form, tanggalAktivitas: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Client / Project</label>
            <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v ?? '' })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih client">
                  {form.clientId ? clients.find(c => c.id === form.clientId)?.namaKlien : ''}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.namaKlien}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">PIC</label>
            <Select value={form.picId} onValueChange={(v) => setForm({ ...form, picId: v ?? '' })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih PIC">
                  {form.picId ? users.find(u => u.id === form.picId)?.nama : ''}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Catatan / Hasil</label>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Apa yang terjadi? Hasil meeting/call/chat..."
              className="h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground resize-none"
            />
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Upload File Proposal / Strategi</label>
            <div
              onClick={() => document.getElementById('activity-file-input')?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              {form.fileUrl ? (
                <div className="flex items-center justify-center gap-2 text-[12px]">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 truncate max-w-[200px]">{form.fileName || 'File terupload'}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setForm({ ...form, fileUrl: '', fileName: '' }); }}
                    className="p-0.5 rounded hover:bg-red-50 text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                  <div className="text-[11px] text-gray-400">Klik untuk upload file</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">PDF, DOC, PPT, JPG - max 20MB</div>
                </>
              )}
              <input
                id="activity-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 20 * 1024 * 1024) {
                    toast.error('File terlalu besar. Maksimal 20MB');
                    return;
                  }
                  const fd = new FormData();
                  fd.append('file', file);
                  try {
                    const res = await fetch('/api/aktivitas/upload', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setForm({ ...form, fileUrl: data.fileUrl, fileName: data.fileName });
                    toast.success('File berhasil diupload');
                  } catch {
                    toast.error('Gagal upload file');
                  }
                  e.target.value = '';
                }}
              />
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <div className="text-[11px] text-red-700 font-medium">Wajib isi Next Action dan Next Action Date — tidak bisa disimpan tanpa rencana tindak lanjut.</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-[11.5px] font-semibold text-amber-700 mb-2">Rencana Tindak Lanjut</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Next Action</label>
                <Input
                  value={form.nextAction}
                  onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
                  placeholder="Telepon konfirmasi, kirim revisi..."
                />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Next Action Date</label>
                <Input
                  type="date"
                  value={form.nextActionDate}
                  onChange={(e) => setForm({ ...form, nextActionDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <DialogClose render={<Button variant="outline" disabled={saving}>Batal</Button>} />
          <Button onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AktivitasPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [calEvents, setCalEvents] = useState<Record<string, string[]>>({});
  const [meta, setMeta] = useState<{ activityTypes: ActivityType[]; users: User[]; clients: Client[] }>({ activityTypes: [], users: [], clients: [] });
  const [stats, setStats] = useState<ActivityStats>({ overdue: 0, today: 0, upcoming: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [calDate, setCalDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overdue');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [picFilter, setPicFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const todayKey = formatDate(today);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('tab', activeTab);
      if (selectedDate) params.set('date', selectedDate);
      params.set('month', `${calDate.getFullYear()}-${String(calDate.getMonth() + 1).padStart(2, '0')}`);
      if (picFilter) params.set('picId', picFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/aktivitas?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActivities(data.activities);
      setCalEvents(data.calEvents || {});
      setStats(data.stats);
      if (data.meta) setMeta(data.meta);
    } catch {
      toast.error('Gagal memuat data aktivitas');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDate, calDate, picFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm, tanggalAktivitas: formatDate(new Date()) });
    setDialogOpen(true);
  };

  const openEdit = (a: Activity) => {
    setEditId(a.id);
    setForm({
      clientId: a.clientId || '',
      typeId: a.typeId || '',
      picId: a.picId || '',
      tanggalAktivitas: formatDate(new Date(a.tanggalAktivitas)),
      catatan: a.catatan || '',
      nextAction: a.nextAction || '',
      nextActionDate: a.nextActionDate ? formatDate(new Date(a.nextActionDate)) : '',
      isDone: a.isDone,
      fileUrl: a.fileUrl || '',
      fileName: a.fileName || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.typeId || !form.tanggalAktivitas) {
      toast.error('Tipe aktivitas dan tanggal wajib diisi');
      return;
    }
    if (!form.nextAction || !form.nextActionDate) {
      toast.error('Next Action dan Next Action Date wajib diisi — tidak bisa disimpan tanpa rencana tindak lanjut');
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `/api/aktivitas/${editId}` : '/api/aktivitas';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editId ? 'Aktivitas berhasil diupdate' : 'Aktivitas berhasil dicatat');
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error(editId ? 'Gagal mengupdate aktivitas' : 'Gagal mencatat aktivitas');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus aktivitas ini?')) return;
    try {
      const res = await fetch(`/api/aktivitas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Aktivitas berhasil dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus aktivitas');
    }
  };

  const markDone = async (id: string) => {
    try {
      const res = await fetch(`/api/aktivitas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDone: true }) });
      if (!res.ok) throw new Error();
      toast.success('Aktivitas selesai');
      fetchData();
    } catch {
      toast.error('Gagal update');
    }
  };

  const handleCalMove = (dir: number) => {
    setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + dir, 1));
  };

  const handleCalToday = () => {
    setCalDate(new Date());
  };

  const handleDayClick = (key: string) => {
    setSelectedDate(key === selectedDate ? null : key);
    setActiveTab('');
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setSelectedDate(null);
  };

  const tabs = [
    { key: 'overdue', label: 'Overdue', count: stats.overdue, color: 'bg-red-100 text-red-700' },
    { key: 'today', label: 'Hari Ini', count: stats.today, color: 'bg-amber-100 text-amber-700' },
    { key: 'upcoming', label: 'Upcoming', count: stats.upcoming, color: 'bg-blue-100 text-blue-700' },
    { key: 'all', label: 'Semua Aktivitas', count: stats.total, color: 'bg-gray-100 text-gray-600' },
  ];

  const filteredActivities = activities.filter((a) => {
    if (search && !a.catatan?.toLowerCase().includes(search.toLowerCase()) && !a.client?.namaKlien.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Build calendar
  const firstDay = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay();
  const dim = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();
  const prevDim = new Date(calDate.getFullYear(), calDate.getMonth(), 0).getDate();

  const calDays: { day: number; key: string; other: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) {
    calDays.push({ day: prevDim - firstDay + i + 1, key: '', other: true });
  }
  for (let d = 1; d <= dim; d++) {
    const key = `${calDate.getFullYear()}-${String(calDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calDays.push({ day: d, key, other: false });
  }
  const rem = calDays.length % 7 === 0 ? 0 : 7 - (calDays.length % 7);
  for (let r = 1; r <= rem; r++) {
    calDays.push({ day: r, key: '', other: true });
  }

  return (
    <div className="p-[20px_24px] flex flex-col gap-[16px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.3px] text-[#18181B]">Aktivitas & Log</h1>
          <p className="text-[13px] text-[#A0A0A8]">Log semua interaksi + reminder follow-up</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#18181B] text-white flex items-center px-[12px] py-[8px] rounded-[8px] text-[12.5px] font-medium hover:opacity-85 transition-opacity"
        >
          <Plus className="w-[14px] h-[14px] mr-[8px]" />
          Catat Aktivitas
        </button>
      </div>

      {/* FU Summary strip */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              activeTab === tab.key ? 'ring-2 ring-offset-1 ring-black/20 ' + tab.color : tab.color + ' hover:opacity-80'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white border border-black/[.07] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04)]">
        <div className="flex items-center justify-between p-3 border-b border-black/5">
          <div className="flex items-center gap-2">
            <button onClick={() => handleCalMove(-1)} className="btn-prev text-gray-500 hover:text-gray-900 text-lg leading-none px-1">&#8249;</button>
            <button onClick={handleCalToday} className="text-[11px] px-2 py-1 rounded-md border border-black/10 hover:bg-gray-100">Hari ini</button>
            <button onClick={() => handleCalMove(1)} className="btn-next text-gray-500 hover:text-gray-900 text-lg leading-none px-1">&#8250;</button>
            <span className="text-[14px] font-semibold ml-1">{MONTHS[calDate.getMonth()]} {calDate.getFullYear()}</span>
          </div>
          <div className="flex gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Overdue</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Follow-up</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Selesai</span>
          </div>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-black/5">
          {DAYS.map((d) => (
            <div key={d} className="text-center py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calDays.map((cd, idx) => {
            if (cd.other) {
              return <div key={idx} className="min-h-[60px] border border-black/5 p-1.5 opacity-30"><div className="text-[11px] text-gray-400">{cd.day}</div></div>;
            }
            const evts = calEvents[cd.key] || [];
            const isToday = cd.key === todayKey;
            const isSelected = cd.key === selectedDate;
            return (
              <div
                key={idx}
                onClick={() => handleDayClick(cd.key)}
                className={`min-h-[60px] border border-black/5 p-1.5 cursor-pointer transition-colors hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-inset ring-blue-400 bg-blue-50' : ''}`}
              >
                <div className={`text-[11.5px] font-medium mb-1 ${isToday ? 'bg-[#18181B] text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                  {isToday ? cd.day : cd.day}
                </div>
                {evts.slice(0, 2).map((e, i) => (
                  <div
                    key={i}
                    className={`text-[9px] px-1 py-0.5 rounded mb-0.5 truncate text-white ${
                      e === 'overdue' ? 'bg-red-500' : e === 'done' ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                  >
                    {e === 'overdue' ? 'Overdue' : e === 'done' ? 'Done' : 'Follow-up'}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Panel */}
      <div className="bg-white border border-black/[.07] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04)]">
        <div className="flex items-center justify-between p-3 border-b border-black/5">
          <div>
            <div className="text-[13px] font-semibold">
              {selectedDate
                ? `${parseInt(selectedDate.split('-')[2])} ${MONTHS[parseInt(selectedDate.split('-')[1]) - 1]} ${selectedDate.split('-')[0]}`
                : tabs.find(t => t.key === activeTab)?.label || 'Aktivitas'}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {selectedDate ? `${activities.length} aktivitas` : 'Klik tanggal untuk filter per hari'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={picFilter} onValueChange={(v) => setPicFilter(v ?? '')}>
              <SelectTrigger className="h-7 text-[11.5px]">
                <SelectValue placeholder="Semua PIC">
                  {picFilter ? meta.users.find(u => u.id === picFilter)?.nama : 'Semua PIC'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua PIC</SelectItem>
                {meta.users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-[13px]">Tidak ada aktivitas</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {filteredActivities.map((a) => {
              const isOverdue = a.nextActionDate && new Date(a.nextActionDate) < new Date() && !a.isDone;
              const isTodayFu = a.nextActionDate && formatDate(new Date(a.nextActionDate)) === formatDate(new Date()) && !a.isDone;
              const rowBg = isOverdue ? 'bg-red-50' : isTodayFu ? 'bg-amber-50' : '';
              const dotColor = a.isDone ? 'bg-green-500' : isOverdue ? 'bg-red-500' : isTodayFu ? 'bg-amber-500' : 'bg-green-500';
              return (
                <div key={a.id} className={`flex items-start gap-3 p-3 border-b border-black/5 ${rowBg} hover:bg-gray-50/50`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[12.5px]">{a.client?.namaKlien || a.deal?.client?.namaKlien || '-'}</span>
                      <span className={`text-[10.5px] px-1.5 py-0.5 rounded-full ${typeColors[a.type?.nama || ''] || 'bg-gray-100 text-gray-600'}`}>
                        {a.type?.nama || '-'}
                      </span>
                      <span className={`text-[10.5px] font-mono ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
                        {formatDisplay(a.tanggalAktivitas)}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-gray-500 mt-0.5 truncate">{a.catatan || '-'}</div>
                    <div className="text-[11px] text-gray-400 mt-1">PIC: {a.pic?.nama || '-'}</div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {!a.isDone && (
                      <button
                        onClick={() => markDone(a.id)}
                        className="p-1 rounded hover:bg-green-50 text-green-600"
                        title="Tandai selesai"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => openEdit(a)} className="text-[11px] px-2 py-1 rounded border border-black/10 hover:bg-gray-100">
                      Update
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="text-[11px] px-2 py-1 rounded border border-black/10 text-red-600 hover:bg-red-50">
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Activity Log Table */}
      <div className="bg-white border border-black/[.07] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04)]">
        <div className="p-3 border-b border-black/5 flex items-center gap-3">
          <div className="relative flex-1 max-w-[300px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari client/catatan..."
              className="pl-8 text-[12px] h-7 bg-gray-50/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#EFEEEA]/50">
                  <th className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 p-2.5 text-left">Tanggal</th>
                  <th className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 p-2.5 text-left">Tipe</th>
                  <th className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 p-2.5 text-left">Client</th>
                  <th className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 p-2.5 text-left">PIC</th>
                  <th className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 p-2.5 text-left">Catatan</th>
                  <th className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 p-2.5 text-left">Next Action</th>
                  <th className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 p-2.5 text-left">Next Date</th>
                  <th className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 p-2.5 text-left">File</th>
                  <th className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 p-2.5 text-left">Status</th>
                  <th className="w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((a) => {
                  const isOverdue = a.nextActionDate && new Date(a.nextActionDate) < new Date() && !a.isDone;
                  return (
                    <tr key={a.id} className="border-b border-black/5 hover:bg-gray-50/50 cursor-pointer" onClick={() => openEdit(a)}>
                      <td className="p-2.5 text-[12px] font-mono text-gray-500">{formatDisplay(a.tanggalAktivitas)}</td>
                      <td className="p-2.5">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${typeColors[a.type?.nama || ''] || 'bg-gray-100 text-gray-600'}`}>
                          {a.type?.nama || '-'}
                        </span>
                      </td>
                      <td className="p-2.5 text-[12.5px] font-medium">{a.client?.namaKlien || a.deal?.client?.namaKlien || '-'}</td>
                      <td className="p-2.5 text-[12px] text-gray-600">{a.pic?.nama || '-'}</td>
                      <td className="p-2.5 text-[12px] text-gray-500 max-w-[130px] truncate">{a.catatan || '-'}</td>
                      <td className="p-2.5 text-[12px] text-blue-600">{a.nextAction || '-'}</td>
                      <td className={`p-2.5 text-[12px] font-mono ${isOverdue ? 'text-red-600 font-medium' : 'text-amber-600'}`}>
                        {a.nextActionDate ? formatDisplay(a.nextActionDate) : '-'}
                      </td>
                      <td className="p-2.5">
                        {a.fileUrl ? (
                          <a
                            href={a.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            {a.fileName || 'File'}
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        {a.isDone ? (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Selesai</span>
                        ) : isOverdue ? (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Overdue</span>
                        ) : (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Aktif</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                          className="text-[11px] px-2 py-1 rounded border border-black/10 text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog */}
      <ActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        activityTypes={meta.activityTypes}
        users={meta.users}
        clients={meta.clients}
        saving={saving}
        onSubmit={handleSubmit}
        title={editId ? 'Edit Aktivitas' : 'Catat Aktivitas'}
      />
    </div>
  );
}
