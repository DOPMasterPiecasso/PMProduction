import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWA, generateInvoiceMessage, DEFAULT_TEMPLATE_INVOICE, DEFAULT_TEMPLATE_TERM, renderTemplate } from '@/lib/whatsapp';

const PREVIEW_URL = (process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || '3125'}`).replace(/\/+$/, '');

function toWIBDay(date: Date): string {
  // Konversi ke WIB (UTC+7) dan format YYYY-MM-DD
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function isSameDay(a: Date, b: Date) {
  return toWIBDay(a) === toWIBDay(b);
}

function calcReminderDate(dueDate: Date, daysBefore: number): Date {
  const d = new Date(dueDate);
  d.setDate(d.getDate() - daysBefore);
  return d;
}

export async function POST(req: Request) {
  // Validasi CRON_SECRET supaya tidak bisa dipanggil sembarangan dari luar
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings as { key: string; value: string }[]) settingsMap[s.key] = s.value;

    const waApiKey = settingsMap.wa_api_key;
    if (!waApiKey) {
      return NextResponse.json({ error: 'WA API Key belum dikonfigurasi' }, { status: 400 });
    }

    const studioName = settingsMap.studio_name || 'CreativeOS';

    const now = new Date();
    // BUG FIX: Gunakan tanggal hari ini dalam WIB (UTC+7), bukan UTC
    // Ini penting agar perbandingan H-X tidak meleset 1 hari karena offset
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const todayStart = new Date(wibNow.getFullYear(), wibNow.getMonth(), wibNow.getDate());

    const activeReminders = await prisma.invoiceReminder.findMany({
      where: { isActive: true },
      include: {
        invoice: {
          include: {
            client: { select: { id: true, namaKlien: true, noHp: true, invoiceAccessCode: true } },
            terms: { orderBy: { terminKe: 'asc' } },
          },
        },
      },
    });

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const reminder of activeReminders as Array<{
      id: string; daysBefore: number; lastSentAt: Date | null; invoiceId: string;
      invoice: {
        id: string; nomorInvoice: string; namaProject: string | null; nominal: number;
        jatuhTempo: Date; status: string;
        client: { id: string; namaKlien: string; noHp: string | null; invoiceAccessCode: string | null };
        terms: Array<{ id: string; terminKe: number; amount: number; jatuhTempo: Date; status: string; paidAmount: number | null }>;
      };
    }>) {
      const { invoice, daysBefore, lastSentAt } = reminder;

      if (invoice.status === 'paid') {
        skipped++;
        continue;
      }

      if (lastSentAt && isSameDay(lastSentAt, todayStart)) {
        skipped++;
        continue;
      }

      if (!invoice.client.noHp) {
        errors.push(`Invoice ${invoice.nomorInvoice}: no HP klien tidak tersedia`);
        skipped++;
        continue;
      }

      // ── Cari tanggal jatuh tempo yang cocok ─────────────────
      // Cek invoice utama
      const invoiceReminderDate = calcReminderDate(invoice.jatuhTempo, daysBefore);
      let matchedDueDate: Date | null = null;
      let matchedTerm: typeof invoice.terms[0] | null = null;

      if (isSameDay(invoiceReminderDate, todayStart)) {
        matchedDueDate = invoice.jatuhTempo;
      }

      // Cek tiap termin yang belum lunas
      if (!matchedDueDate) {
        for (const term of invoice.terms) {
          if (term.status === 'paid') continue;
          const termReminderDate = calcReminderDate(term.jatuhTempo, daysBefore);
          if (isSameDay(termReminderDate, todayStart)) {
            matchedDueDate = term.jatuhTempo;
            matchedTerm = term;
            break;
          }
        }
      }

      if (!matchedDueDate) {
        skipped++;
        continue;
      }

      // ── Bangun pesan ────────────────────────────────────────
      const previewLink = `${PREVIEW_URL}/invoice/${invoice.id}`;

      let message: string;
      if (matchedTerm) {
        const dueStr = matchedDueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const nominal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(matchedTerm.amount);
        const vars: Record<string, string> = {
          namaKlien: invoice.client.namaKlien,
          nomorInvoice: invoice.nomorInvoice,
          namaProject: invoice.namaProject || '-',
          nominal,
          jatuhTempo: dueStr,
          terminKe: String(matchedTerm.terminKe),
          nominalTermin: nominal,
          jatuhTempoTermin: dueStr,
          kodeAkses: invoice.client.invoiceAccessCode ? `*Kode Akses:* ${invoice.client.invoiceAccessCode}\n` : '',
          linkInvoice: previewLink ? `*Link Invoice:* ${previewLink}\n` : '',
          namaStudio: studioName || 'CreativeOS',
        };
        const customTemplate = settingsMap.wa_template_term || DEFAULT_TEMPLATE_TERM;
        message = renderTemplate(customTemplate, vars);
      } else {
        message = generateInvoiceMessage({
          invoice,
          client: invoice.client,
          studioName,
          previewLink,
          messageType: 'invoice',
          customTemplate: settingsMap.wa_template_invoice || DEFAULT_TEMPLATE_INVOICE,
        });
      }

      // ── Kirim WA ────────────────────────────────────────────
      try {
        await sendWA({ target: invoice.client.noHp, message, token: waApiKey });

        await prisma.messageLog.create({
          data: {
            invoiceId: invoice.id,
            clientId: invoice.client.id,
            clientName: invoice.client.namaKlien,
            phoneNumber: invoice.client.noHp,
            message,
            messageType: 'reminder',
            status: 'sent',
          },
        });

        await prisma.invoiceReminder.update({
          where: { id: reminder.id },
          data: { lastSentAt: now },
        });

        sent++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Gagal kirim WA';
        errors.push(`Invoice ${invoice.nomorInvoice}: ${errMsg}`);

        await prisma.messageLog.create({
          data: {
            invoiceId: invoice.id,
            clientId: invoice.client.id,
            clientName: invoice.client.namaKlien,
            phoneNumber: invoice.client.noHp,
            message: errMsg,
            messageType: 'reminder',
            status: 'failed',
            error: errMsg,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error('[REMINDERS PROCESS]', error);
    return NextResponse.json({ error: 'Gagal memproses reminder' }, { status: 500 });
  }
}
