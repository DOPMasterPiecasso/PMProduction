import cron from 'node-cron';
import { prisma } from '@/lib/prisma';

let initialized = false;

export async function register() {
  if (initialized) return;
  initialized = true;

  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Jalankan setiap menit, lalu cek apakah jam sekarang sesuai setting DB
  // Ini agar perubahan jam di Settings langsung berlaku TANPA restart server
  cron.schedule('* * * * *', async () => {
    try {
      // Baca jam dari DB setiap kali tick
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'invoice_reminder_time' },
      });

      const configuredTime = setting?.value || '08:00';
      const [cfgHour, cfgMinute] = configuredTime.split(':').map(Number);

      // Waktu sekarang dalam WIB (UTC+7)
      const nowUTC = new Date();
      const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
      const currentHour = nowWIB.getUTCHours();
      const currentMinute = nowWIB.getUTCMinutes();

      // Hanya lanjut jika jam & menit cocok
      if (currentHour !== cfgHour || currentMinute !== cfgMinute) return;

      console.log(`[CRON] Menjalankan invoice reminder pada ${configuredTime} WIB...`);

      const port = process.env.PORT || '3125';
      const origin = process.env.NEXTAUTH_URL || `http://localhost:${port}`;
      const cronSecret = process.env.CRON_SECRET;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (cronSecret) headers['Authorization'] = `Bearer ${cronSecret}`;

      const res = await fetch(`${origin}/api/invoices/reminders/process`, {
        method: 'POST',
        headers,
      });
      const data = await res.json().catch(() => ({}));
      console.log(
        `[CRON] Selesai: sent=${data.sent ?? 0}, skipped=${data.skipped ?? 0}`,
        data.errors?.length ? `| errors: ${data.errors.join(', ')}` : '',
      );
    } catch (err) {
      console.error('[CRON] Error:', err);
    }
  }, {
    timezone: 'Asia/Jakarta',
  });

  console.log('[CRON] Invoice reminder scheduler aktif — cek setiap menit (WIB)');
}
