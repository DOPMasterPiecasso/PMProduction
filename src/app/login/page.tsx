"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0] fixed inset-0 z-[999]">
      <div className="bg-white border border-black/10 rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,.12)] w-[380px] max-w-[95vw] overflow-hidden">
        {/* Header (Hitam) */}
        <div className="bg-[#18181B] pt-[28px] pb-[24px] px-[28px] text-center">
          <div className="flex items-center justify-center gap-[10px] mb-[6px]">
            <div className="w-[34px] h-[34px] bg-white rounded-[9px] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="text-[18px] font-semibold text-white tracking-[-0.3px]">CreativeOS</div>
          </div>
          <div className="text-[12px] text-white/50">Sales Operating System</div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-[24px_28px] flex flex-col gap-[14px]">
          <div className="text-[14px] font-semibold text-[#18181B] text-center">Masuk ke Akun</div>
          
          <div className="flex flex-col gap-[5px]">
            <label className="text-[11.5px] font-medium text-[#6B6B72]">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@studio.id" 
              className="p-[9px_12px] text-[13px] border border-black/[.13] rounded-[8px] outline-none font-inherit focus:border-[#2563EB] transition-colors" 
              required
            />
          </div>
          
          <div className="flex flex-col gap-[5px]">
            <label className="text-[11.5px] font-medium text-[#6B6B72]">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password" 
              className="p-[9px_12px] text-[13px] border border-black/[.13] rounded-[8px] outline-none font-inherit focus:border-[#2563EB] transition-colors" 
              required
            />
          </div>

          {error && (
            <div className="text-[12px] text-[#B91C1C] bg-[#FEF2F2] p-[8px_10px] rounded-[6px]">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="p-[10px] text-[13px] font-semibold bg-[#18181B] text-white border-none rounded-[8px] cursor-pointer font-inherit transition-opacity hover:opacity-85 mt-2 disabled:opacity-50"
          >
            {loading ? "Memeriksa..." : "Masuk"}
          </button>

          <div className="text-[11.5px] text-[#A0A0A8] text-center leading-relaxed">
            Demo: manager@studio.id / manager123<br/>
            atau: staff@studio.id / staff123
          </div>
        </form>

        {/* Footer Badges */}
        <div className="p-[12px_28px_20px] flex gap-[8px] justify-center flex-wrap">
          <span className="text-[11px] bg-[#F5F3FF] text-[#6D28D9] px-[10px] py-[3px] rounded-[20px] font-medium">Manager - akses penuh</span>
          <span className="text-[11px] bg-[#FFFBEB] text-[#B45309] px-[10px] py-[3px] rounded-[20px] font-medium">AE - akses terbatas</span>
        </div>
      </div>
    </div>
  );
}
