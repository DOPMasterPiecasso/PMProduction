"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  UserPlus,
  KanbanSquare,
  MessageCircle,
  Users,
  CheckCircle,
  Receipt,
  BarChart3,
  Target,
  Settings,
  Send,
  Menu,
  X,
} from "lucide-react";

const salesItems = [
  { name: "Leads", href: "/leads", icon: UserPlus, badge: "6" },
  { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { name: "Aktivitas", href: "/aktivitas", icon: MessageCircle },
];

const crmItems = [
  { name: "Database Klien", href: "/clients", icon: Users },
  { name: "Deal Clients", href: "/deals", icon: CheckCircle },
  { name: "Invoices", href: "/invoices", icon: Receipt, badge: "2" },
  { name: "Pesan WhatsApp", href: "/messages", icon: Send },
];

const reportItems = [
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Tim & KPI", href: "/team", icon: Target },
];

const systemItems = [{ name: "Settings", href: "/settings", icon: Settings }];

function NavItem({
  name,
  href,
  icon: Icon,
  badge,
  isActive,
  onClick,
}: {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-[8px] p-[7px_10px] rounded-[8px] text-[13px] transition-all duration-150 select-none ${
        isActive
          ? "bg-[#18181B] text-white font-medium"
          : "text-[#6B6B72] hover:bg-[#EFEEEA] hover:text-[#18181B]"
      }`}
    >
      <Icon className={`w-[14px] h-[14px] shrink-0 ${isActive ? "opacity-100" : "opacity-75"}`} />
      <span>{name}</span>
      {badge && (
        <span
          className={`ml-auto text-[10px] font-semibold font-mono p-[1px_6px] rounded-[10px] ${
            isActive
              ? "bg-[rgba(255,255,255,.2)] text-white"
              : "bg-[#FEF2F2] text-[#B91C1C]"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="m-[12px_0_3px_6px] text-[10px] font-semibold tracking-[0.7px] uppercase text-[#A0A0A8]">
        {label}
      </div>
      {children}
    </>
  );
}

function SidebarContent({ onNavClick, studioName, logoUrl }: { onNavClick?: () => void; studioName: string; logoUrl: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-full bg-white flex flex-col h-full font-sans">
      {/* Logo */}
      <div className="pt-[16px] px-[14px] pb-[12px] border-b border-black/[.07] flex items-center gap-[9px]">
        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={studioName} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-[#18181B] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <div className="text-[14px] font-semibold tracking-[-0.3px] text-[#18181B]">{studioName}</div>
          <div className="text-[10px] text-[#A0A0A8]">v3 - Sales OS</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-[8px] flex flex-col gap-[1px]">
        <NavItem
          name="Dashboard"
          href="/"
          icon={LayoutDashboard}
          isActive={pathname === "/"}
          onClick={onNavClick}
        />

        <NavSection label="Sales">
          {salesItems.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              href={item.href}
              icon={item.icon}
              badge={item.badge}
              isActive={pathname === item.href}
              onClick={onNavClick}
            />
          ))}
        </NavSection>

        <NavSection label="CRM">
          {crmItems.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              href={item.href}
              icon={item.icon}
              badge={item.badge}
              isActive={pathname === item.href}
              onClick={onNavClick}
            />
          ))}
        </NavSection>

        <NavSection label="Laporan">
          {reportItems.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
              onClick={onNavClick}
            />
          ))}
        </NavSection>

        <NavSection label="Sistem">
          {systemItems.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
              onClick={onNavClick}
            />
          ))}
        </NavSection>
      </nav>

      {/* User Profile */}
      <div className="p-[10px_14px] border-t border-black/[.07] flex items-center gap-[9px]">
        <div className="w-[30px] h-[30px] rounded-full bg-[#18181B] text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
          D
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[#18181B]">Dhamar</div>
          <div className="text-[10px] text-[#A0A0A8]">Owner</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: window.location.origin + "/login" })}
          className="text-[11px] text-[#A0A0A8] hover:text-[#B91C1C] transition-colors"
          title="Logout"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studioName, setStudioName] = useState("CreativeOS");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/branding")
      .then((r) => r.json())
      .then((data) => {
        if (data.studio_name) setStudioName(data.studio_name);
        if (data.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(() => {});
  }, []);

  // Tutup drawer saat route berubah
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className="hidden md:flex w-[218px] min-w-[218px] border-r border-black/[.07] h-full">
        <SidebarContent studioName={studioName} logoUrl={logoUrl} />
      </div>

      {/* ── Mobile: top header bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-black/[.07] flex items-center gap-3 px-4 h-[52px]">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={studioName} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-[#18181B] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            )}
          </div>
          <span className="text-[14px] font-semibold tracking-[-0.3px] text-[#18181B]">Sales OS</span>
        </div>
      </div>

      {/* ── Mobile: overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: slide-over drawer ── */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          aria-label="Tutup menu"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent studioName={studioName} logoUrl={logoUrl} onNavClick={() => setMobileOpen(false)} />
      </div>
    </>
  );
}
