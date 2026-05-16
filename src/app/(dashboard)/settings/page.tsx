'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
      });
    }
  }, [systemSettings]);

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

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="p-[20px_24px] flex flex-col gap-[16px]">
      <div>
        <h1 className="text-[20px] font-semibold tracking-[-0.3px]">Settings</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Kelola tim, layanan, dan preferensi sistem</p>
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
