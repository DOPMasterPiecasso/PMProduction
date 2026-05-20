'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Trash2, MessageSquare, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_TEMPLATE_INVOICE, DEFAULT_TEMPLATE_PAYMENT } from '@/lib/whatsapp';

interface User { id: string; nama: string; email: string; role: string; isActive: boolean }
interface Service { id: string; nama: string; deskripsi: string; colorHex: string; isActive: boolean }

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner / Manager', manager: 'Manager', ae: 'AE (Account Executive)', editor: 'Editor', admin: 'Admin',
};

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<{ nama: string; email: string; role: string }>({ nama: '', email: '', role: '' });

  const [editingService, setEditingService] = useState<string | null>(null);
  const [editSvcData, setEditSvcData] = useState<{ nama: string; deskripsi: string }>({ nama: '', deskripsi: '' });

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ nama: '', email: '', role: 'ae', password: 'staff123' });

  const [showAddService, setShowAddService] = useState(false);
  const [newSvc, setNewSvc] = useState({ nama: '', deskripsi: '', colorHex: '#2563EB' });

  const [activeTemplateTab, setActiveTemplateTab] = useState<'invoice' | 'payment'>('invoice');

  const serviceColors = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#94A3B8', '#DC2626', '#0891B2', '#D946EF'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users || []);
      setServices(data.services || []);
      setSystemSettings(data.systemSettings || {});
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── User CRUD ──────────────────────────────────────────────
  async function handleUpdateUser(id: string) {
    try {
      const res = await fetch(`/api/settings/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserData),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success('User diperbarui');
      setEditingUser(null);
      fetchData();
    } catch { toast.error('Gagal mengupdate user'); }
  }

  async function handleDeleteUser(id: string, name: string) {
    if (!confirm(`Hapus ${name} dari tim?`)) return;
    try {
      const res = await fetch(`/api/settings/users/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success(`${name} dihapus dari tim`);
      fetchData();
    } catch { toast.error('Gagal menghapus user'); }
  }

  async function handleAddUser() {
    if (!newUser.nama || !newUser.email) { toast.error('Nama dan email wajib diisi'); return; }
    try {
      const res = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success('Anggota baru ditambahkan');
      setShowAddUser(false);
      setNewUser({ nama: '', email: '', role: 'ae', password: 'staff123' });
      fetchData();
    } catch { toast.error('Gagal menambah anggota'); }
  }

  // ─── Service CRUD ───────────────────────────────────────────
  async function handleToggleService(svc: Service) {
    try {
      const res = await fetch(`/api/settings/services/${svc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !svc.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(svc.isActive ? 'Layanan dinonaktifkan' : 'Layanan diaktifkan');
      fetchData();
    } catch { toast.error('Gagal mengupdate layanan'); }
  }

  async function handleUpdateService(id: string) {
    try {
      const res = await fetch(`/api/settings/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSvcData),
      });
      if (!res.ok) throw new Error();
      toast.success('Layanan diperbarui');
      setEditingService(null);
      fetchData();
    } catch { toast.error('Gagal mengupdate layanan'); }
  }

  async function handleDeleteService(id: string, name: string) {
    if (!confirm(`Hapus layanan "${name}"?`)) return;
    try {
      const res = await fetch(`/api/settings/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(`Layanan "${name}" dihapus`);
      fetchData();
    } catch { toast.error('Gagal menghapus layanan'); }
  }

  async function handleAddService() {
    if (!newSvc.nama) { toast.error('Nama layanan wajib diisi'); return; }
    try {
      const res = await fetch('/api/settings/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSvc),
      });
      if (!res.ok) throw new Error();
      toast.success('Layanan baru ditambahkan');
      setShowAddService(false);
      setNewSvc({ nama: '', deskripsi: '', colorHex: '#2563EB' });
      fetchData();
    } catch { toast.error('Gagal menambah layanan'); }
  }

  // ─── System Settings ────────────────────────────────────────
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (Object.keys(systemSettings).length > 0) {
      setSettingsForm({
        studio_name: systemSettings.studio_name || '',
        wa_api_key: systemSettings.wa_api_key || '',
        wa_admin: systemSettings.wa_admin || '',
        email_admin: systemSettings.email_admin || '',
        fu_overdue_days: systemSettings.fu_overdue_days || '3',
        lead_inactive_days: systemSettings.lead_inactive_days || '7',
        target_revenue_tahunan: systemSettings.target_revenue_tahunan || '500000000',
        wa_template_invoice: systemSettings.wa_template_invoice || DEFAULT_TEMPLATE_INVOICE,
        wa_template_payment_confirm: systemSettings.wa_template_payment_confirm || DEFAULT_TEMPLATE_PAYMENT,
        invoice_reminder_days: systemSettings.invoice_reminder_days || '[1,3,5,7]',
        invoice_reminder_time: systemSettings.invoice_reminder_time || '08:00',
      });
    }
  }, [systemSettings]);

  const REMINDER_KEYS = ['invoice_reminder_days', 'invoice_reminder_time'];

  async function handleSaveSettings() {
    try {
      const promises = Object.entries(settingsForm).map(([key, value]) =>
        fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        })
      );
      await Promise.all(promises);
      toast.success('Pengaturan berhasil disimpan');
      fetchData();
    } catch { toast.error('Gagal menyimpan pengaturan'); }
  }

  async function handleSaveReminderSettings() {
    try {
      await Promise.all(REMINDER_KEYS.map((key) =>
        fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: settingsForm[key] || '' }),
        })
      ));
      toast.success('Pengaturan reminder disimpan');
      fetchData();
    } catch { toast.error('Gagal menyimpan pengaturan reminder'); }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="p-[12px_16px] md:p-[20px_24px] flex flex-col gap-[12px] md:gap-[16px]">
      <div>
        <h1 className="text-[18px] md:text-[20px] font-semibold tracking-[-0.3px]">Settings</h1>
        <p className="text-[12px] md:text-[13px] text-gray-400 mt-0.5">Kelola tim, layanan, dan preferensi sistem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        {/* ── Team Management ──────────────────────────────────── */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
            <div>
              <div className="text-[13px] font-semibold">Kelola Tim</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Anggota aktif & role</div>
            </div>
            <button onClick={() => setShowAddUser(true)} className="bg-[#18181B] text-white text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg hover:opacity-85 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Tambah Anggota
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                  <th className="text-left px-3 py-2.5">Nama</th>
                  <th className="text-left px-3 py-2.5">Role</th>
                  <th className="text-left px-3 py-2.5">Status</th>
                  <th className="text-left px-3 py-2.5">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isOwner = u.role === 'owner';
                  const isEditing = editingUser === u.id;
                  return (
                    <tr key={u.id} className="border-b border-black/5 hover:bg-gray-50/50">
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            <input value={editUserData.nama} onChange={(e) => setEditUserData({ ...editUserData, nama: e.target.value })} className="text-[12px] border border-black/10 rounded-md px-2 py-1 w-[130px] focus:outline-none focus:border-blue-400" />
                            <input value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} className="text-[10.5px] border border-black/10 rounded-md px-2 py-1 w-[140px] focus:outline-none focus:border-blue-400" />
                          </div>
                        ) : (
                          <>
                            <div className="text-[12.5px] font-medium">{u.nama}</div>
                            <div className="text-[10.5px] text-gray-400">{u.email}</div>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <select value={editUserData.role} onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })} className="text-[11px] border border-black/10 rounded-md px-2 py-1 bg-white focus:outline-none">
                            <option value="ae">AE (Account Executive)</option>
                            <option value="manager">Manager</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex text-[10.5px] font-medium px-2 py-0.5 rounded-full ${isOwner ? 'bg-purple-100 text-purple-700' : u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex text-[10.5px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktif</span>
                      </td>
                      <td className="px-3 py-2.5">
                        {isOwner ? (
                          <span className="text-[10.5px] text-gray-400 italic">Owner tidak dapat dihapus</span>
                        ) : isEditing ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleUpdateUser(u.id)} className="text-[10.5px] px-2 py-1 rounded-md border border-black/10 hover:bg-gray-100">Simpan</button>
                            <button onClick={() => handleDeleteUser(u.id, u.nama)} className="text-[10.5px] px-2 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50">Hapus</button>
                            <button onClick={() => setEditingUser(null)} className="text-[10.5px] px-2 py-1 text-gray-400 hover:text-gray-600">Batal</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingUser(u.id); setEditUserData({ nama: u.nama, email: u.email, role: u.role }); }} className="text-[10.5px] px-2.5 py-1 rounded-md border border-black/10 hover:bg-gray-100">Edit</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-black/5 text-[11px] text-gray-400">
            Login & autentikasi akan diintegrasikan saat sistem live. Saat ini role disimpan sebagai referensi.
          </div>
        </div>

        {/* ── Service Management ───────────────────────────────── */}
        <div className="bg-white border border-black/[.07] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
            <div>
              <div className="text-[13px] font-semibold">Kelola Layanan</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Jenis layanan yang tersedia</div>
            </div>
            <button onClick={() => setShowAddService(true)} className="bg-[#18181B] text-white text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg hover:opacity-85 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Tambah Layanan
            </button>
          </div>
          <div className="flex flex-col">
            {services.map((svc, idx) => {
              const isEditing = editingService === svc.id;
              const color = svc.colorHex || serviceColors[idx % serviceColors.length];
              return (
                <div key={svc.id} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-black/5 last:border-b-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex flex-col gap-1">
                        <input value={editSvcData.nama} onChange={(e) => setEditSvcData({ ...editSvcData, nama: e.target.value })} className="text-[12px] border border-black/10 rounded-md px-2 py-1 w-full focus:outline-none focus:border-blue-400" />
                        <input value={editSvcData.deskripsi} onChange={(e) => setEditSvcData({ ...editSvcData, deskripsi: e.target.value })} className="text-[10.5px] border border-black/10 rounded-md px-2 py-1 w-full focus:outline-none focus:border-blue-400" />
                      </div>
                    ) : (
                      <>
                        <div className="text-[13px] font-medium">{svc.nama}</div>
                        <div className="text-[10.5px] text-gray-400 truncate">{svc.deskripsi}</div>
                      </>
                    )}
                  </div>
                  <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {svc.isActive ? 'Aktif' : 'Non-aktif'}
                  </span>
                  {isEditing ? (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleUpdateService(svc.id)} className="text-[10.5px] px-2 py-1 rounded-md border border-black/10 hover:bg-gray-100">Simpan</button>
                      <button onClick={() => handleDeleteService(svc.id, svc.nama)} className="text-[10.5px] px-2 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                      <button onClick={() => setEditingService(null)} className="text-[10.5px] px-2 py-1 text-gray-400 hover:text-gray-600">Batal</button>
                    </div>
                  ) : (
                    <div className="flex gap-1 shrink-0">
                      {!svc.isActive && (
                        <button onClick={() => handleToggleService(svc)} className="text-[10.5px] px-2 py-1 rounded-md border border-black/10 hover:bg-gray-100">Aktifkan</button>
                      )}
                      <button onClick={() => { setEditingService(svc.id); setEditSvcData({ nama: svc.nama, deskripsi: svc.deskripsi || '' }); }} className="text-[10.5px] px-2 py-1 rounded-md border border-black/10 hover:bg-gray-100">
                        {svc.isActive ? 'Edit' : 'Edit'}
                      </button>
                      <button onClick={() => handleToggleService(svc)} className="text-[10.5px] px-2 py-1 rounded-md border border-black/10 hover:bg-gray-100">
                        {svc.isActive ? 'Nonaktifkan' : '-'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── System Preferences ────────────────────────────────── */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-black/5">
          <div className="text-[13px] font-semibold">Preferensi Sistem</div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'studio_name', label: 'Nama Studio / Agency', type: 'text' },
              { key: 'wa_api_key', label: 'WA API Key (Fonnte)', type: 'text' },
              { key: 'wa_admin', label: 'WA Admin (untuk notifikasi lead)', type: 'text' },
              { key: 'email_admin', label: 'Email Admin', type: 'email' },
              { key: 'fu_overdue_days', label: 'Batas FU Overdue (hari)', type: 'number' },
              { key: 'lead_inactive_days', label: 'Batas Lead Inactive (hari)', type: 'number' },
              { key: 'target_revenue_tahunan', label: 'Target Revenue Tahunan (Rp)', type: 'number' },
            ].map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-[11.5px] font-medium text-gray-500">{field.label}</label>
                <input
                  type={field.type}
                  value={settingsForm[field.key] || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, [field.key]: e.target.value })}
                  className="w-full text-[13px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleSaveSettings} className="bg-[#18181B] text-white text-[12.5px] font-medium px-4 py-2 rounded-lg hover:opacity-85">
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>

      {/* ── Invoice Reminder Settings ─────────────────────────── */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
          <div>
            <div className="text-[13px] font-semibold">Pengaturan Reminder Invoice</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Atur jadwal otomatis pengingat pembayaran via WhatsApp</div>
          </div>
          <button onClick={handleSaveReminderSettings} className="bg-[#18181B] text-white text-[11.5px] font-medium px-3 py-1.5 rounded-lg hover:opacity-85">
            Simpan
          </button>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* List Hari */}
            <div>
              <label className="text-[11.5px] font-medium text-gray-500 block mb-2">Daftar H-</label>
              {(() => {
                const current: number[] = JSON.parse(settingsForm.invoice_reminder_days || '[1,3,5,7]');
                if (current.length === 0) return <p className="text-[12px] text-gray-400 italic">Belum ada hari, tambah di samping.</p>;
                return (
                  <div className="flex flex-col gap-1.5">
                    {current.map((day) => (
                      <div key={day} className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-[12.5px] font-medium text-blue-700">H-{day}</span>
                        <button onClick={() => {
                          const updated = current.filter((d) => d !== day);
                          setSettingsForm({ ...settingsForm, invoice_reminder_days: JSON.stringify(updated) });
                        }} className="text-[11px] text-blue-400 hover:text-red-500 transition-colors">Hapus</button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            {/* Tambah Hari + Jam */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-gray-500 block mb-2">Tambah H-</label>
                <input type="number" min="1" placeholder="Contoh: 2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget;
                      const val = parseInt(input.value);
                      if (val > 0) {
                        const current: number[] = JSON.parse(settingsForm.invoice_reminder_days || '[1,3,5,7]');
                        if (!current.includes(val)) {
                          const updated = [...current, val].sort((a, b) => a - b);
                          setSettingsForm({ ...settingsForm, invoice_reminder_days: JSON.stringify(updated) });
                        }
                        input.value = '';
                      }
                    }
                  }}
                  className="w-full text-[13px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                />
                <p className="text-[10px] text-gray-400 mt-1">Ketik angka lalu Enter</p>
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-500 block mb-1">Jam pengiriman</label>
                <input type="time" value={settingsForm.invoice_reminder_time || '08:00'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, invoice_reminder_time: e.target.value })}
                  className="w-32 text-[13px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                />
                <p className="text-[10px] text-gray-400 mt-1">Perubahan jam berlaku setelah restart server.</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Reminder akan dikirim otomatis setiap hari. Kosongkan semua hari untuk mematikan fitur.</p>
        </div>
      </div>

      {/* ── WA Template ───────────────────────────────────────── */}
      <div className="bg-white border border-black/[.07] rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-green-600" />
              <div className="text-[13px] font-semibold">Template Pesan WhatsApp</div>
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5 ml-5.5">Atur pesan default yang dikirim ke klien</div>
          </div>
          <button
            onClick={handleSaveSettings}
            className="bg-[#18181B] text-white text-[11.5px] font-medium px-3 py-1.5 rounded-lg hover:opacity-85"
          >
            Simpan
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/5">
          <button
            onClick={() => setActiveTemplateTab('invoice')}
            className={`flex-1 text-[12px] py-2.5 font-medium transition-colors ${activeTemplateTab === 'invoice' ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            📄 Invoice Baru
          </button>
          <button
            onClick={() => setActiveTemplateTab('payment')}
            className={`flex-1 text-[12px] py-2.5 font-medium transition-colors ${activeTemplateTab === 'payment' ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✅ Konfirmasi Bayar
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11.5px] font-medium text-gray-600">Template</label>
              <button
                onClick={() => {
                  const key = activeTemplateTab === 'invoice' ? 'wa_template_invoice' : 'wa_template_payment_confirm';
                  const def = activeTemplateTab === 'invoice' ? DEFAULT_TEMPLATE_INVOICE : DEFAULT_TEMPLATE_PAYMENT;
                  setSettingsForm(prev => ({ ...prev, [key]: def }));
                }}
                className="flex items-center gap-1 text-[10.5px] text-gray-400 hover:text-gray-700 transition-colors"
                title="Reset ke template default"
              >
                <RotateCcw className="w-3 h-3" /> Reset default
              </button>
            </div>
            <textarea
              value={activeTemplateTab === 'invoice'
                ? (settingsForm.wa_template_invoice || DEFAULT_TEMPLATE_INVOICE)
                : (settingsForm.wa_template_payment_confirm || DEFAULT_TEMPLATE_PAYMENT)}
              onChange={(e) => {
                const key = activeTemplateTab === 'invoice' ? 'wa_template_invoice' : 'wa_template_payment_confirm';
                setSettingsForm(prev => ({ ...prev, [key]: e.target.value }));
              }}
              rows={12}
              className="w-full text-[12px] font-mono border border-black/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-400 resize-y leading-relaxed"
              placeholder="Ketik template pesan WA..."
            />
            {/* Placeholder guide */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10.5px] font-semibold text-gray-500 mb-2">Placeholder yang tersedia:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ['{{namaKlien}}', 'Nama klien'],
                  ['{{nomorInvoice}}', 'No. invoice'],
                  ['{{namaProject}}', 'Nama project'],
                  ['{{nominal}}', 'Total nominal'],
                  ['{{jatuhTempo}}', 'Tanggal jatuh tempo'],
                  ['{{status}}', 'Status invoice'],
                  ['{{kodeAkses}}', 'Kode akses invoice'],
                  ['{{linkInvoice}}', 'Link invoice'],
                  ['{{namaStudio}}', 'Nama studio'],
                ].map(([tag, desc]) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const key = activeTemplateTab === 'invoice' ? 'wa_template_invoice' : 'wa_template_payment_confirm';
                      setSettingsForm(prev => ({ ...prev, [key]: (prev[key] || '') + tag }));
                    }}
                    title={`Tambahkan ${desc}`}
                    className="text-[10px] font-mono bg-white border border-black/10 rounded px-1.5 py-0.5 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-gray-400 mt-1.5">Klik tag untuk menyisipkan ke template</div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-medium text-gray-600">Preview (data contoh)</label>
            <div className="border border-black/10 rounded-lg overflow-hidden flex-1">
              <div className="bg-[#ECE5DD] px-3 py-2 flex items-center gap-2 border-b border-black/5">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.119 1.532 5.852L.073 23.927l6.22-1.432C7.879 23.443 9.897 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.744-.518-5.301-1.426l-.378-.224-3.921.903.936-3.818-.247-.393A9.922 9.922 0 0 1 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" /></svg>
                </div>
                <span className="text-[11.5px] font-medium text-gray-700">WhatsApp Preview</span>
              </div>
              <div className="bg-[#E5DDD5] p-3 min-h-[200px]">
                <div className="bg-white rounded-lg rounded-tl-none shadow-sm px-3 py-2.5 max-w-[85%] text-[11.5px] leading-relaxed whitespace-pre-wrap text-gray-800">
                  {(() => {
                    const tpl = activeTemplateTab === 'invoice'
                      ? (settingsForm.wa_template_invoice || DEFAULT_TEMPLATE_INVOICE)
                      : (settingsForm.wa_template_payment_confirm || DEFAULT_TEMPLATE_PAYMENT);
                    const sampleVars: Record<string, string> = {
                      namaKlien: 'Budi Santoso',
                      nomorInvoice: 'INV-2026-001',
                      namaProject: 'Buku Tahunan SMAN 1',
                      nominal: 'Rp 15.000.000',
                      jatuhTempo: '30 Mei 2026',
                      status: 'Belum Dibayar',
                      kodeAkses: '*Kode Akses:* ABC123\n',
                      linkInvoice: '*Link Invoice:* http://localhost:3000/invoice/xxx\n',
                      namaStudio: settingsForm.studio_name || 'Parama Production',
                    };
                    return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => sampleVars[k] ?? `{{${k}}}`);
                  })()}
                </div>
                <div className="text-[9.5px] text-gray-400 text-right mt-1 mr-2">12:00 ✓✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Login Info ────────────────────────────────────────── */}
      <div className="bg-white border border-black/[.07] border-l-[3px] border-l-blue-500 rounded-xl shadow-sm">
        <div className="p-4">
          <div className="text-[13px] font-semibold text-blue-700 mb-1.5">Login & Autentikasi</div>
          <div className="text-[12.5px] text-gray-500 leading-relaxed">
            Sistem login multi-user (Manager / AE / Editor) akan aktif saat webapp diintegrasikan ke backend (Supabase / Node.js). Setiap user akan punya dashboard sesuai role masing-masing - AE hanya lihat klien mereka sendiri, Manager lihat semua data tim.
          </div>
          <div className="mt-2.5 flex gap-2 flex-wrap">
            <span className="inline-flex text-[10.5px] font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Manager - akses penuh</span>
            <span className="inline-flex text-[10.5px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">AE - klien & pipeline sendiri</span>
            <span className="inline-flex text-[10.5px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Editor - view only</span>
            <span className="inline-flex text-[10.5px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Admin - input data</span>
          </div>
        </div>
      </div>

      {/* ── Add User Modal ────────────────────────────────────── */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowAddUser(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
              <span className="text-[14px] font-semibold">Tambah Anggota Tim</span>
              <button onClick={() => setShowAddUser(false)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nama Lengkap</label>
                <input value={newUser.nama} onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" placeholder="Nama anggota" />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Email</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" placeholder="email@studio.id" />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 bg-white focus:outline-none">
                  <option value="ae">AE (Account Executive)</option>
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Password</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" placeholder="Default: staff123" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-black/[0.07]">
              <button onClick={() => setShowAddUser(false)} className="text-[12px] px-4 py-2 rounded-lg border border-black/10 text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleAddUser} className="bg-[#18181B] text-white text-[12px] px-4 py-2 rounded-lg font-medium hover:opacity-85">Tambah</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Service Modal ─────────────────────────────────── */}
      {showAddService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowAddService(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
              <span className="text-[14px] font-semibold">Tambah Layanan</span>
              <button onClick={() => setShowAddService(false)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 text-[16px]">×</button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Nama Layanan</label>
                <input value={newSvc.nama} onChange={(e) => setNewSvc({ ...newSvc, nama: e.target.value })} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" placeholder="Contoh: Video Production" />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Deskripsi</label>
                <input value={newSvc.deskripsi} onChange={(e) => setNewSvc({ ...newSvc, deskripsi: e.target.value })} className="w-full text-[12px] border border-black/10 rounded-lg px-3 py-2 focus:outline-none" placeholder="Deskripsi layanan" />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-gray-600 block mb-1">Warna</label>
                <div className="flex gap-2 flex-wrap">
                  {serviceColors.map((c) => (
                    <button key={c} onClick={() => setNewSvc({ ...newSvc, colorHex: c })}
                      className={`w-7 h-7 rounded-full border-2 ${newSvc.colorHex === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-black/[0.07]">
              <button onClick={() => setShowAddService(false)} className="text-[12px] px-4 py-2 rounded-lg border border-black/10 text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleAddService} className="bg-[#18181B] text-white text-[12px] px-4 py-2 rounded-lg font-medium hover:opacity-85">Tambah</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
