import cron from 'node-cron';
import { prisma } from '@/lib/prisma';

let initialized = false;

async function scheduleReminder() {
  let hour = 8, minute = 0;
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'invoice_reminder_time' } });
    if (setting?.value) {
      const parts = setting.value.split(':');
      hour = parseInt(parts[0]) || 8;
      minute = parseInt(parts[1]) || 0;
    }
  } catch {
    // fallback default
  }

  const expression = `${minute} ${hour} * * *`;

  // BUG FIX: Gunakan PORT yang benar (3125) bukan default 3000
  // BUG FIX: Tambah timezone WIB agar cron tidak berjalan di UTC
  cron.schedule(expression, async () => {
    try {
      const port = process.env.PORT || '3125';
      const origin = process.env.NEXTAUTH_URL || `http://localhost:${port}`;
      const cronSecret = process.env.CRON_SECRET;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (cronSecret) headers['Authorization'] = `Bearer ${cronSecret}`;
      const res = await fetch(`${origin}/api/invoices/reminders/process`, { method: 'POST', headers });
      const data = await res.json().catch(() => ({}));
      console.log(`[CRON] Reminder selesai: sent=${data.sent ?? 0}, skipped=${data.skipped ?? 0}`, data.errors || '');
    } catch (err) {
      console.error('[CRON] Gagal memproses reminder:', err);
    }
  }, {
    timezone: 'Asia/Jakarta', // WIB — supaya jam 8 = jam 8 Indonesia, bukan UTC
  });

  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  console.log(`[CRON] Invoice reminder scheduler registered (daily at ${timeStr} WIB)`);
}

export async function register() {
  if (initialized) return;
  initialized = true;

  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  await scheduleReminder();
}
