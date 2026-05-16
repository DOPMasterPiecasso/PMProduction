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
}

interface GenerateOptions {
  invoice: InvoiceData;
  client: ClientData;
  studioName?: string;
  previewLink?: string;
  messageType?: string;
}

export function generateInvoiceMessage({
  invoice,
  client,
  studioName,
  previewLink,
  messageType = 'invoice',
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

  if (messageType === 'payment_confirm') {
    let msg = '';
    msg += `*KONFIRMASI PEMBAYARAN*\n`;
    msg += `─────────────────\n`;
    msg += `Yth. ${client.namaKlien},\n\n`;
    msg += `Pembayaran untuk invoice berikut telah kami terima:\n\n`;
    msg += `*Invoice:* ${invoice.nomorInvoice}\n`;
    msg += `*Project:* ${invoice.namaProject || '-'}\n`;
    msg += `*Total:* ${nominal}\n`;
    if (previewLink) { msg += `\n*Link Invoice:* ${previewLink}\n`; }
    msg += `\n`;
    msg += `Terima kasih atas kepercayaannya. 🙏\n`;
    if (studioName) msg += `\n---\n${studioName}`;
    return msg;
  }

  let msg = '';
  msg += `*INVOICE ${invoice.nomorInvoice}*\n`;
  msg += `─────────────────\n`;
  msg += `*Project:* ${invoice.namaProject || '-'}\n`;
  msg += `*Klien:* ${client.namaKlien}\n`;
  msg += `*Total:* ${nominal}\n`;
  msg += `*Jatuh Tempo:* ${dueStr}\n`;
  msg += `*Status:* ${statusLabel[invoice.status] || invoice.status}\n`;
  if (previewLink) { msg += `\n*Link Invoice:* ${previewLink}\n`; }
  msg += `\n`;
  msg += `Terima kasih atas kerjasamanya. 🙏\n`;
  if (studioName) msg += `\n---\n${studioName}`;

  return msg;
}
