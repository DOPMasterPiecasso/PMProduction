import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

async function getInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: { select: { namaKlien: true, namaContact: true, noHp: true, email: true } },
      terms: { orderBy: { terminKe: 'asc' } },
    },
  });
  return invoice;
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function statusColor(s: string) {
  switch (s) {
    case 'paid': return 'text-green-700 bg-green-50 border-green-200';
    case 'overdue': return 'text-red-700 bg-red-50 border-red-200';
    case 'partial': return 'text-amber-700 bg-amber-50 border-amber-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

function statusLabel(s: string) {
  switch (s) {
    case 'paid': return 'Lunas';
    case 'overdue': return 'Jatuh Tempo';
    case 'partial': return 'Dibayar Sebagian';
    default: return 'Belum Dibayar';
  }
}

export default async function InvoicePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) notFound();

  const due = new Date(invoice.jatuhTempo);
  const dueStr = due.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const terbit = new Date(invoice.tanggalTerbit);
  const terbitStr = terbit.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const totalTerms = invoice.terms.reduce((s, t) => s + t.amount, 0);
  const paidTerms = invoice.terms.filter((t) => t.status === 'paid').reduce((s, t) => s + (t.paidAmount || t.amount), 0);

  return (
    <div className="min-h-screen bg-[#F5F4F0] py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-black/[.07] overflow-hidden">
        <div className="px-6 py-5 border-b border-black/[.07] flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold">Invoice {invoice.nomorInvoice}</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">{invoice.client.namaKlien}</p>
          </div>
          <span className={`text-[11px] font-medium px-3 py-1.5 rounded-full border ${statusColor(invoice.status)}`}>
            {statusLabel(invoice.status)}
          </span>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Project</div>
              <div className="font-medium">{invoice.namaProject || '-'}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Nominal</div>
              <div className="font-semibold font-mono text-[15px]">{formatRp(invoice.nominal)}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Tanggal Terbit</div>
              <div>{terbitStr}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Jatuh Tempo</div>
              <div className={due < new Date() && invoice.status !== 'paid' ? 'text-red-600 font-medium' : ''}>{dueStr}</div>
            </div>
          </div>

          {invoice.keterangan && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-[12px] text-gray-600">
              {invoice.keterangan}
            </div>
          )}

          {invoice.terms.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Rincian Termin</div>
              <div className="flex flex-col gap-1.5">
                {invoice.terms.map((t) => {
                  const tDue = new Date(t.jatuhTempo);
                  const tDueStr = tDue.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                  const isOverdue = tDue < new Date() && t.status !== 'paid';
                  return (
                    <div key={t.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[12px] ${t.status === 'paid' ? 'bg-green-50 border-green-200' : isOverdue ? 'bg-red-50 border-red-200' : 'border-black/10'}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Termin {t.terminKe}</span>
                        {t.percentage && <span className="text-gray-400">({t.percentage}%)</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium">{formatRp(t.amount)}</span>
                        <span className="text-gray-400 text-[11px]">{tDueStr}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${t.status === 'paid' ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                          {t.status === 'paid' ? 'Lunas' : isOverdue ? 'Overdue' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-3 px-3 py-2 bg-gray-50 rounded-lg text-[12px]">
                <span className="font-medium">Total Dibayar</span>
                <span className="font-mono font-semibold text-green-700">{formatRp(paidTerms)}</span>
              </div>
              {totalTerms !== invoice.nominal && (
                <div className="flex items-center justify-between mt-1 px-3 py-2 bg-gray-50 rounded-lg text-[12px]">
                  <span className="font-medium">Sisa</span>
                  <span className="font-mono font-semibold text-red-600">{formatRp(invoice.nominal - paidTerms)}</span>
                </div>
              )}
            </div>
          )}

          {invoice.terms.length === 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between text-[13px]">
              <span className="font-medium">Status Pembayaran</span>
              <span className={`font-semibold ${invoice.status === 'paid' ? 'text-green-600' : invoice.status === 'overdue' ? 'text-red-600' : 'text-amber-600'}`}>
                {statusLabel(invoice.status)}
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-black/[.07] bg-gray-50/50 text-center text-[11px] text-gray-400">
          Invoice ini dibuat secara otomatis melalui CreativeOS
        </div>
      </div>
    </div>
  );
}
