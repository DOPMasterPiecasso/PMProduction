"use client";

import { useState } from "react";
import { updateUser, deleteUser } from "@/app/actions/team";
import { toast } from "sonner";

type User = {
  id: string;
  nama: string;
  email: string;
  role: string;
};

export function TeamManagementClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleUpdate = async (id: string, name: string, email: string, role: string) => {
    setLoading(id);
    const res = await updateUser(id, name, email, role);
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success(`${name} diperbarui!`);
      setEditingId(null);
    }
    setLoading(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus ${name} dari tim?`)) return;
    
    setLoading(id);
    const res = await deleteUser(id);
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success(`${name} dihapus dari tim`);
      setUsers(users.filter(u => u.id !== id));
      setEditingId(null);
    }
    setLoading(null);
  };

  return (
    <div className="bg-white border border-black/[.07] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04)] overflow-hidden font-sans">
      {/* Header Card */}
      <div className="p-[13px_16px] border-b border-black/[.07] flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-[#18181B] tracking-[-0.2px]">Kelola Tim</div>
          <div className="text-[11px] text-[#A0A0A8] mt-[1px]">Anggota aktif & role</div>
        </div>
        <button className="bg-[#18181B] text-white border border-[#18181B] text-[11.5px] font-medium p-[4px_9px] rounded-[8px] hover:opacity-85 transition-all whitespace-nowrap">
          + Tambah Anggota
        </button>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-[7px_11px] text-[10px] font-semibold text-[#A0A0A8] uppercase tracking-[0.4px] border-b border-black/[.07] bg-[#EFEEEA]">Nama</th>
              <th className="p-[7px_11px] text-[10px] font-semibold text-[#A0A0A8] uppercase tracking-[0.4px] border-b border-black/[.07] bg-[#EFEEEA]">Role</th>
              <th className="p-[7px_11px] text-[10px] font-semibold text-[#A0A0A8] uppercase tracking-[0.4px] border-b border-black/[.07] bg-[#EFEEEA]">Status</th>
              <th className="p-[7px_11px] text-[10px] font-semibold text-[#A0A0A8] uppercase tracking-[0.4px] border-b border-black/[.07] bg-[#EFEEEA]">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isOwner = u.role === "owner";
              const isEditing = editingId === u.id;

              return (
                <tr key={u.id} className="border-b border-black/[.07] hover:bg-[#FAFAF8] transition-colors last:border-b-0 cursor-pointer group">
                  <td className="p-[9px_11px] align-middle">
                    {isOwner || !isEditing ? (
                      <>
                        <div className="text-[12.5px] font-medium text-[#18181B]">{u.nama}</div>
                        <div className="text-[10.5px] text-[#A0A0A8]">{u.email}</div>
                      </>
                    ) : (
                      <div className="flex flex-col">
                        <input 
                          type="text"
                          defaultValue={u.nama}
                          onChange={(e) => {
                            const newUsers = [...users];
                            const idx = newUsers.findIndex(x => x.id === u.id);
                            newUsers[idx].nama = e.target.value;
                            setUsers(newUsers);
                          }}
                          className="text-[12px] p-[3px_7px] w-[130px] border border-black/[.13] rounded-[8px] outline-none focus:border-[#2563EB] transition-colors"
                        />
                        <input 
                          type="text"
                          defaultValue={u.email}
                          onChange={(e) => {
                            const newUsers = [...users];
                            const idx = newUsers.findIndex(x => x.id === u.id);
                            newUsers[idx].email = e.target.value;
                            setUsers(newUsers);
                          }}
                          className="text-[10.5px] p-[2px_6px] w-[140px] border border-black/[.13] rounded-[8px] outline-none focus:border-[#2563EB] transition-colors mt-[3px]"
                        />
                      </div>
                    )}
                  </td>
                  <td className="p-[9px_11px] align-middle">
                    {isOwner ? (
                      <span className="inline-flex items-center text-[11px] font-medium bg-[#F5F3FF] text-[#6D28D9] p-[2px_7px] rounded-[20px] whitespace-nowrap">Owner / Manager</span>
                    ) : !isEditing ? (
                      <span className="inline-flex items-center text-[11px] font-medium bg-[#EFF6FF] text-[#1D4ED8] p-[2px_7px] rounded-[20px] whitespace-nowrap">
                        {u.role === 'manager' ? 'Manager' : 'AE (Account Executive)'}
                      </span>
                    ) : (
                      <select 
                        value={u.role}
                        onChange={(e) => {
                          const newUsers = [...users];
                          const idx = newUsers.findIndex(x => x.id === u.id);
                          newUsers[idx].role = e.target.value;
                          setUsers(newUsers);
                        }}
                        className="text-[11px] p-[3px_8px] border border-black/[.13] rounded-[8px] outline-none focus:border-[#2563EB] bg-white cursor-pointer transition-colors"
                      >
                        <option value="ae">AE (Account Executive)</option>
                        <option value="manager">Manager</option>
                      </select>
                    )}
                  </td>
                  <td className="p-[9px_11px] align-middle">
                    <span className="inline-flex items-center text-[11px] font-medium bg-[#F0FDF4] text-[#15803D] p-[2px_7px] rounded-[20px] whitespace-nowrap">Aktif</span>
                  </td>
                  <td className="p-[9px_11px] align-middle">
                    {isOwner ? (
                      null
                    ) : !isEditing ? (
                      <button 
                        onClick={() => setEditingId(u.id)}
                        className="bg-white border border-black/[.13] text-[#18181B] text-[11.5px] font-medium p-[4px_9px] rounded-[8px] hover:bg-[#EFEEEA] transition-colors whitespace-nowrap"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-[4px] w-[130px]">
                        <button 
                          disabled={loading === u.id}
                          onClick={() => handleUpdate(u.id, u.nama, u.email, u.role)}
                          className="bg-white border border-black/[.13] text-[#18181B] text-[11.5px] font-medium p-[4px_9px] rounded-[8px] hover:bg-[#EFEEEA] transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {loading === u.id ? "..." : "Simpan"}
                        </button>
                        <button 
                          disabled={loading === u.id}
                          onClick={() => handleDelete(u.id, u.nama)}
                          className="bg-[#FEF2F2] border border-transparent text-[#B91C1C] text-[11.5px] font-medium p-[4px_9px] rounded-[8px] hover:bg-[#FEE2E2] transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          Hapus
                        </button>
                        <button 
                          disabled={loading === u.id}
                          onClick={() => {
                            // Cancel edit and revert changes visually
                            setEditingId(null);
                          }}
                          className="text-[#A0A0A8] text-[11.5px] font-medium p-[4px_4px] hover:text-[#18181B] transition-colors whitespace-nowrap"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-[12px_16px] border-t border-black/[.07] text-[11.5px] text-[#A0A0A8]">
        Login & autentikasi akan diintegrasikan saat sistem live. Saat ini role disimpan sebagai referensi.
      </div>
    </div>
  );
}
