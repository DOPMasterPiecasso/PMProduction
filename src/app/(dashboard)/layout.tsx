import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {/* pt-[52px] untuk mobile agar tidak tertutup mobile header bar */}
      <main className="flex-1 overflow-y-auto pt-[52px] md:pt-0">
        {children}
      </main>
    </div>
  );
}
