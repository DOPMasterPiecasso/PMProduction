"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
];

const reportItems = [
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Tim & KPI", href: "/team", icon: Target },
];

const systemItems = [
  { name: "Settings", href: "/settings", icon: Settings },
];

function NavItem({
  name,
  href,
  icon: Icon,
  badge,
  isActive,
}: {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[218px] min-w-[218px] bg-white border-r border-black/[.07] flex flex-col h-full font-sans">
      {/* Logo */}
      <div className="pt-[16px] px-[14px] pb-[12px] border-b border-black/[.07] flex items-center gap-[9px]">
        <div className="w-[30px] h-[30px] bg-[#18181B] rounded-[8px] flex items-center justify-center shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div className="text-[14px] font-semibold tracking-[-0.3px] text-[#18181B]">CreativeOS</div>
          <div className="text-[10px] text-[#A0A0A8]">v3 - Sales OS</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-[8px] flex flex-col gap-[1px]">
        {/* Dashboard - always on top */}
        <NavItem
          name="Dashboard"
          href="/"
          icon={LayoutDashboard}
          isActive={pathname === "/"}
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
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-[11px] text-[#A0A0A8] hover:text-[#B91C1C] transition-colors"
          title="Logout"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
