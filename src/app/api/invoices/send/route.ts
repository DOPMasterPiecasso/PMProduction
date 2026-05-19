import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWA, generateInvoiceMessage, DEFAULT_TEMPLATE_INVOICE, DEFAULT_TEMPLATE_PAYMENT } from '@/lib/whatsapp';

const PREVIEW_URL = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/+$/, '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, messageType = 'invoice', message: customMessage, preview } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId wajib diisi' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: { select: { id: true, namaKlien: true, noHp: true, invoiceAccessCode: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }

    const studioSetting = await prisma.systemSetting.findUnique({ where: { key: 'studio_name' } });
    const studioName = studioSetting?.value || 'CreativeOS';
    const previewLink = `${PREVIEW_URL}/invoice/${invoice.id}`;

    // Ambil custom template dari settings (fallback ke default jika belum diset)
    const templateKey = messageType === 'payment_confirm' ? 'wa_template_payment_confirm' : 'wa_template_invoice';
    const templateSetting = await prisma.systemSetting.findUnique({ where: { key: templateKey } });
    const defaultTemplate = messageType === 'payment_confirm' ? DEFAULT_TEMPLATE_PAYMENT : DEFAULT_TEMPLATE_INVOICE;
    const customTemplate = templateSetting?.value || defaultTemplate;

    let logMsgType = messageType === 'payment_confirm' ? 'payment' : 'invoice';
    const generatedMessage = generateInvoiceMessage({
      invoice,
      client: invoice.client,
      studioName,
      previewLink,
      messageType,
      customTemplate,
    });

    const message = customMessage || generatedMessage;

    if (preview) {
      return NextResponse.json({ message: generatedMessage, previewLink });
    }

    const phone = invoice.client.noHp;
    if (!phone) {
      return NextResponse.json({ error: 'Nomor telepon klien tidak tersedia' }, { status: 400 });
    }

    const waSetting = await prisma.systemSetting.findUnique({ where: { key: 'wa_api_key' } });
    if (!waSetting?.value) {
      return NextResponse.json({ error: 'API Key WhatsApp belum dikonfigurasi. Atur di Settings.' }, { status: 400 });
    }

    const result = await sendWA({
      target: phone,
      message,
      token: waSetting.value,
    }).catch((err) => {
      throw new Error(err.message || 'Gagal mengirim pesan WhatsApp');
    });

    await prisma.messageLog.create({
      data: {
        invoiceId: invoice.id,
        clientId: invoice.client.id,
        clientName: invoice.client.namaKlien,
        phoneNumber: phone,
        message,
        messageType: logMsgType,
        status: 'sent',
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Gagal mengirim pesan';
    console.error('[INVOICES SEND]', error);

    try {
      const body = await req.json().catch(() => ({}));
      if (body?.invoiceId) {
        const inv = await prisma.invoice.findUnique({
          where: { id: body.invoiceId },
          include: { client: { select: { id: true, namaKlien: true, noHp: true } } },
        });
        if (inv) {
          await prisma.messageLog.create({
            data: {
              invoiceId: inv.id,
              clientId: inv.client.id,
              clientName: inv.client.namaKlien,
              phoneNumber: inv.client.noHp || '',
              message: errMsg,
              messageType: 'invoice',
              status: 'failed',
              error: errMsg,
            },
          });
        }
      }
    } catch {}

    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
