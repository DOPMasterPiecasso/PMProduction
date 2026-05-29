'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, MoreHorizontal, Loader2, Trash2, Pencil, X, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientCombobox } from '@/components/ui/client-combobox';

interface Source { id: string; nama: string }
interface Service { id: string; nama: string; colorHex: string }
interface User { id: string; nama: string; avatarInitial: string | null }
interface ClientItem { id: string; namaKlien: string; namaContact: string | null; noHp: string | null; email: string | null; sourceId: string | null; serviceId: string | null }

interface Lead {
  id: string;
  namaInstitusi: string;
  namaContact: string | null;
  noHp: string | null;
  status: string;
  tanggalMasuk: string;
  catatan: string | null;
  source: Source | null;
  service: Service | null;
  assignedTo: User | null;
}

interface LeadForm {
  namaInstitusi: string;
  namaContact: string;
  noHp: string;
  sourceId: string;
  serviceId: string;
  assignedToId: string;
  status: string;
  catatan: string;
  clientId: string;
}

const emptyForm: LeadForm = {
  namaInstitusi: '',
  namaContact: '',
  noHp: '',
  sourceId: '',
  serviceId: '',
  assignedToId: '',
  status: 'baru',
  catatan: '',
  clientId: '',
};

const statusColors: Record<string, string> = {
  baru: 'bg-amber-100 text-amber-700',
  dihubungi: 'bg-blue-100 text-blue-700',
  qualified: 'bg-green-100 text-green-700',
  unqualified: 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<string, string> = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  qualified: 'Qualified',
  unqualified: 'Unqualified',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return `Hari Ini, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  if (days === 1) return 'Kemarin, ' + `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function LeadDialog({
  open,
  onOpenChange,
  form,
  setForm,
  sources,
  services,
  users,
  clients,
  saving,
  onSubmit,
  title,
  onClientSelect,
  onAddClient,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: LeadForm;
  setForm: (f: LeadForm) => void;
  sources: Source[];
  services: Service[];
  users: User[];
  clients: ClientItem[];
  saving: boolean;
  onSubmit: () => void;
  title: string;
  onClientSelect: (client: ClientItem | null) => void;
  onAddClient: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Nama Institusi *</label>
            <div className="flex gap-2">
              <ClientCombobox
                clients={clients}
                selectedClientId={form.clientId}
                onClientSelect={onClientSelect}
                onInputChange={(val) => setForm({ ...form, namaInstitusi: val, clientId: '' })}
                placeholder="Cari atau ketik nama institusi..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onAddClient}
                className="h-9 w-9 shrink-0"
                title="Tambah client baru"
              >
                <UserPlus className="size-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Nama Contact</label>
              <Input
                value={form.namaContact}
                onChange={(e) => setForm({ ...form, namaContact: e.target.value })}
                placeholder="cth: Pak Ahmad"
              />
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">No. HP</label>
              <Input
                value={form.noHp}
                onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                placeholder="0812xxxx"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Sumber</label>
              <Select value={form.sourceId} onValueChange={(v) => setForm({ ...form, sourceId: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih sumber">
                    {form.sourceId ? sources.find(s => s.id === form.sourceId)?.nama : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Layanan</label>
              <Select value={form.serviceId} onValueChange={(v) => setForm({ ...form, serviceId: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih layanan">
                    {form.serviceId ? services.find(s => s.id === form.serviceId)?.nama : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Assign ke</label>
              <Select value={form.assignedToId} onValueChange={(v) => setForm({ ...form, assignedToId: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih AE">
                    {form.assignedToId ? users.find(u => u.id === form.assignedToId)?.nama : ''}
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
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih status">
                    {form.status ? statusLabels[form.status] : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Catatan</label>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Catatan tambahan..."
              className="h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground resize-none"
            />
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<{ sources: Source[]; services: Service[]; users: User[]; clients: ClientItem[] }>({ sources: [], services: [], users: [], clients: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ namaKlien: '', namaContact: '', noHp: '', email: '', sourceId: '', serviceId: '' });
  const [clientSaving, setClientSaving] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLeads(data.leads);
      if (data.meta) setMeta(data.meta);
    } catch (e) {
      toast.error('Gagal memuat data leads');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleClientSelect = (client: ClientItem | null) => {
    if (client) {
      setForm({
        ...form,
        clientId: client.id,
        namaInstitusi: client.namaKlien,
        namaContact: client.namaContact || '',
        noHp: client.noHp || '',
        sourceId: client.sourceId || '',
        serviceId: client.serviceId || '',
      });
    } else {
      setForm({ ...form, clientId: '' });
    }
  };

  const handleOpenAddClient = () => {
    setClientForm({
      namaKlien: form.namaInstitusi,
      namaContact: form.namaContact,
      noHp: form.noHp,
      email: '',
      sourceId: form.sourceId,
      serviceId: form.serviceId,
    });
    setClientDialogOpen(true);
  };

  const handleCreateClient = async () => {
    if (!clientForm.namaKlien.trim()) {
      toast.error('Nama klien wajib diisi');
      return;
    }
    setClientSaving(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const c = data.client;
      const newClient: ClientItem = {
        id: c.id,
        namaKlien: c.namaKlien,
        namaContact: c.namaContact,
        noHp: c.noHp,
        email: c.email,
        sourceId: c.sourceId,
        serviceId: c.serviceId,
      };
      setClientDialogOpen(false);
      setMeta((prev) => ({ ...prev, clients: [...prev.clients, newClient] }));
      handleClientSelect(newClient);
      toast.success('Client berhasil dibuat');
    } catch {
      toast.error('Gagal membuat client');
    } finally {
      setClientSaving(false);
    }
  };

  const openEdit = (lead: Lead) => {
    setEditId(lead.id);
    setForm({
      namaInstitusi: lead.namaInstitusi,
      namaContact: lead.namaContact || '',
      noHp: lead.noHp || '',
      sourceId: lead.source?.id || '',
      serviceId: lead.service?.id || '',
      assignedToId: lead.assignedTo?.id || '',
      status: lead.status,
      catatan: lead.catatan || '',
      clientId: '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.namaInstitusi.trim()) {
      toast.error('Nama institusi wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `/api/leads/${editId}` : '/api/leads';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editId ? 'Lead berhasil diupdate' : 'Lead berhasil dibuat');
      setDialogOpen(false);
      fetchLeads();
    } catch (e) {
      toast.error(editId ? 'Gagal mengupdate lead' : 'Gagal membuat lead');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus lead ini?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Lead berhasil dihapus');
      fetchLeads();
    } catch {
      toast.error('Gagal menghapus lead');
    }
  };

  const stats = {
    total: leads.length,
    baru: leads.filter((l) => l.status === 'baru').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    unqualified: leads.filter((l) => l.status === 'unqualified').length,
  };

  return (
    <div className="p-[12px_16px] md:p-[20px_24px] flex flex-col gap-[12px] md:gap-[16px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[18px] md:text-[20px] font-semibold tracking-[-0.3px] text-[#18181B]">Inbox Leads</h1>
          <p className="text-[12px] md:text-[13px] text-[#A0A0A8]">Kelola dan kurasi semua prospek yang masuk sebelum dipindahkan ke Pipeline.</p>
        </div>
        <div className="flex gap-[8px]">
          <button
            onClick={openCreate}
            className="bg-[#18181B] text-white flex items-center px-[12px] py-[8px] rounded-[8px] text-[12.5px] font-medium hover:opacity-85 transition-opacity"
          >
            <Plus className="w-[14px] h-[14px] mr-[8px]" />
            Lead Manual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-black/[.07] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04)] p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Leads</div>
            <div className="text-[20px] font-semibold font-mono">{stats.total}</div>
          </div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04)] p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Lead Baru</div>
            <div className="text-[20px] font-semibold font-mono text-amber-600">{stats.baru}</div>
          </div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04)] p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Qualified</div>
            <div className="text-[20px] font-semibold font-mono text-green-600">{stats.qualified}</div>
          </div>
        </div>
        <div className="bg-white border border-black/[.07] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04)] p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Unqualified</div>
            <div className="text-[20px] font-semibold font-mono text-gray-400">{stats.unqualified}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-black/[.07] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04)] flex flex-col h-full">
        <div className="p-4 border-b border-black/5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-[300px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari nama klien, kontak..."
              className="pl-9 text-[12.5px] bg-gray-50/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-[14px]">Belum ada leads</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#EFEEEA]/50">
              <TableRow>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Lead / Kontak</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider hidden sm:table-cell">Sumber</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider hidden sm:table-cell">Layanan</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider hidden md:table-cell">Tanggal Masuk</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer hover:bg-gray-50/50">
                  <TableCell>
                    <div className="font-medium text-[13px]">{lead.namaInstitusi}</div>
                    <div className="text-[11.5px] text-gray-500 mt-0.5">{lead.namaContact || '-'}</div>
                  </TableCell>
                  <TableCell className="text-[12.5px] text-gray-600 hidden sm:table-cell">{lead.source?.nama || '-'}</TableCell>
                  <TableCell className="text-[12.5px] text-gray-600 hidden sm:table-cell">{lead.service?.nama || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-medium px-2 py-0.5 text-[11px] border-transparent ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {statusLabels[lead.status] || lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[12.5px] text-gray-600 hidden md:table-cell">{formatDate(lead.tanggalMasuk)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => openEdit(lead)}>
                          <Pencil className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(lead.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </div>

      <LeadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        sources={meta.sources}
        services={meta.services}
        users={meta.users}
        clients={meta.clients}
        saving={saving}
        onSubmit={handleSubmit}
        title={editId ? 'Edit Lead' : 'Tambah Lead Manual'}
        onClientSelect={handleClientSelect}
        onAddClient={handleOpenAddClient}
      />

      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Tambah Client Baru</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Nama Klien *</label>
              <Input
                value={clientForm.namaKlien}
                onChange={(e) => setClientForm({ ...clientForm, namaKlien: e.target.value })}
                placeholder="cth: SMA Harapan Bangsa"
              />
            </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Nama Contact</label>
                <Input
                  value={clientForm.namaContact}
                  onChange={(e) => setClientForm({ ...clientForm, namaContact: e.target.value })}
                  placeholder="cth: Pak Ahmad"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">No. HP</label>
                <Input
                  value={clientForm.noHp}
                  onChange={(e) => setClientForm({ ...clientForm, noHp: e.target.value })}
                  placeholder="0812xxxx"
                />
              </div>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 mb-1 block">Email</label>
              <Input
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                placeholder="cth: sekolah@email.com"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <DialogClose render={<Button variant="outline" disabled={clientSaving}>Batal</Button>} />
            <Button onClick={handleCreateClient} disabled={clientSaving}>
              {clientSaving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
