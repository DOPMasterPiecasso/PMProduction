const FONNTE_API = 'https://api.fonnte.com/send';

export interface SendWAParams {
  target: string;
  message: string;
  token: string;
}

export async function sendWA({ target, message, token }: SendWAParams) {
  const res = await fetch(FONNTE_API, {
    method: 'POST',
    headers: {
      'Authorization': token,
    },
    body: new URLSearchParams({ target, message }),
  });

  const data = await res.json();
  if (!res.ok || data.status === false) {
    throw new Error(data.reason || 'Gagal mengirim pesan WhatsApp');
  }

  return data;
}

interface InvoiceData {
  nomorInvoice: string;
  namaProject: string | null;
  nominal: number;
  jatuhTempo: string | Date;
  status: string;
}

interface ClientData {
  namaKlien: string;
  invoiceAccessCode?: string | null;
}

interface GenerateOptions {
  invoice: InvoiceData;
  client: ClientData;
  studioName?: string;
  previewLink?: string;
  messageType?: string;
  /** Custom template string dari DB settings (opsional). Jika diisi, placeholder akan di-replace. */
  customTemplate?: string;
}

/**
 * Daftar placeholder yang tersedia untuk template WA:
 * {{namaKlien}}, {{nomorInvoice}}, {{namaProject}}, {{nominal}},
 * {{jatuhTempo}}, {{status}}, {{kodeAkses}}, {{linkInvoice}}, {{namaStudio}},
 * {{terminKe}}, {{nominalTermin}}, {{jatuhTempoTermin}}
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export const DEFAULT_TEMPLATE_INVOICE = `*INVOICE {{nomorInvoice}}*
─────────────────
*Project:* {{namaProject}}
*Klien:* {{namaKlien}}
*Total:* {{nominal}}
*Jatuh Tempo:* {{jatuhTempo}}
*Status:* {{status}}
{{kodeAkses}}{{linkInvoice}}
Terima kasih atas kerjasamanya. 🙏

---
{{namaStudio}}`;

export const DEFAULT_TEMPLATE_PAYMENT = `*KONFIRMASI PEMBAYARAN*
─────────────────
Yth. {{namaKlien}},

Pembayaran untuk invoice berikut telah kami terima:

*Invoice:* {{nomorInvoice}}
*Project:* {{namaProject}}
*Total:* {{nominal}}
{{kodeAkses}}{{linkInvoice}}
Terima kasih atas kepercayaannya. 🙏

---
{{namaStudio}}`;

export const DEFAULT_TEMPLATE_TERM = `*TERMIN {{terminKe}} — {{nomorInvoice}}*
─────────────────
Yth. {{namaKlien}},

Pembayaran *Termin {{terminKe}}* untuk invoice *{{nomorInvoice}}*
sebesar *{{nominalTermin}}* telah jatuh tempo pada *{{jatuhTempoTermin}}*.

Mohon segera dilakukan pembayaran.

{{kodeAkses}}{{linkInvoice}}
Terima kasih atas kerjasamanya. 🙏

---
{{namaStudio}}`;

export const DEFAULT_TEMPLATE_TERM_PAYMENT = `*KONFIRMASI PEMBAYARAN TERMIN {{terminKe}}*
─────────────────
Yth. {{namaKlien}},

Pembayaran *Termin {{terminKe}}* untuk invoice *{{nomorInvoice}}*
sebesar *{{nominalTermin}}* telah kami terima.

Terima kasih atas pembayarannya. 🙏

{{kodeAkses}}{{linkInvoice}}
---
{{namaStudio}}`;

export function generateInvoiceMessage({
  invoice,
  client,
  studioName,
  previewLink,
  messageType = 'invoice',
  customTemplate,
}: GenerateOptions) {
  const due = new Date(invoice.jatuhTempo);
  const dueStr = due.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const nominal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(invoice.nominal);

  const statusLabel: Record<string, string> = {
    unpaid: 'Belum Dibayar',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
    overdue: 'Jatuh Tempo',
  };

  const accessCode = client.invoiceAccessCode;
  const vars: Record<string, string> = {
    namaKlien: client.namaKlien,
    nomorInvoice: invoice.nomorInvoice,
    namaProject: invoice.namaProject || '-',
    nominal,
    jatuhTempo: dueStr,
    status: statusLabel[invoice.status] || invoice.status,
    kodeAkses: accessCode ? `*Kode Akses:* ${accessCode}\n` : '',
    linkInvoice: previewLink ? `*Link Invoice:* ${previewLink}\n` : '',
    namaStudio: studioName || 'CreativeOS',
  };

  const template = customTemplate ||
    (messageType === 'payment_confirm' ? DEFAULT_TEMPLATE_PAYMENT : DEFAULT_TEMPLATE_INVOICE);

  return renderTemplate(template, vars);
}
