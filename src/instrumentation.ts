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
  cron.schedule(expression, async () => {
    try {
      const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      await fetch(`${origin}/api/invoices/reminders/process`, { method: 'POST' });
    } catch (err) {
      console.error('[CRON] Gagal memproses reminder:', err);
    }
  });

  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  console.log(`[CRON] Invoice reminder scheduler registered (daily at ${timeStr})`);
}

export async function register() {
  if (initialized) return;
  initialized = true;

  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  await scheduleReminder();
}
