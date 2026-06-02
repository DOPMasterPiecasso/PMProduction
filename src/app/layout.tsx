import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'favicon_url' } });
    const iconUrl = setting?.value || '/favicon.ico';
    return {
      title: "CreativeOS v3",
      description: "Sales & CRM Operating System",
      icons: { icon: iconUrl },
    };
  } catch {
    return {
      title: "CreativeOS v3",
      description: "Sales & CRM Operating System",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${dmSans.variable} ${dmMono.variable} font-sans bg-[#F5F4F0] text-[#18181B] antialiased`}
      >
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
