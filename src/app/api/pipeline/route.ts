import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [deals, stages] = await Promise.all([
      prisma.deal.findMany({
        where: { dealStatus: { not: 'archived' } },
        include: {
          client: { select: { namaKlien: true } },
          service: { select: { nama: true, colorHex: true } },
          assignedAe: { select: { nama: true, avatarInitial: true } },
          stage: { select: { nama: true, urutan: true, colorHex: true } },
          documents: { select: { id: true, fileName: true, fileUrl: true } },
        },
        orderBy: { tanggalMasuk: 'desc' },
      }),
      prisma.pipelineStage.findMany({ orderBy: { urutan: 'asc' } }),
    ]);

    // Agregat per stage
    const stageStats = stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stageId === stage.id);
      const totalNilai = stageDeals.reduce((sum, d) => sum + d.nilai, 0);
      return {
        ...stage,
        dealCount: stageDeals.length,
        totalNilai,
      };
    });

    return NextResponse.json({ deals, stages: stageStats });
  } catch (error) {
    console.error('[PIPELINE GET]', error);
    return NextResponse.json({ error: 'Gagal memuat data pipeline' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { dealId, stageId, dealStatus, notes, namaProject } = await req.json();
    if (!dealId || !stageId) {
      return NextResponse.json({ error: 'dealId dan stageId wajib diisi' }, { status: 400 });
    }

    const stage = await prisma.pipelineStage.findUnique({ where: { id: stageId } });
    if (!stage) return NextResponse.json({ error: 'Stage tidak ditemukan' }, { status: 404 });

    const newStatus = dealStatus ?? (stage.nama === 'Won' ? 'won' : stage.nama === 'Lost' ? 'lost' : 'active');

    const updated = await prisma.deal.update({
      where: { id: dealId },
      data: { stageId, dealStatus: newStatus, probability: stage.probabilityDefault, notes: notes ?? undefined, namaProject: namaProject ?? undefined },
    });

    return NextResponse.json({ deal: updated });
  } catch (error) {
    console.error('[PIPELINE PATCH]', error);
    return NextResponse.json({ error: 'Gagal update deal' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clientId, serviceId, stageId, assignedAeId, nilai, probability, notes, namaProject } = await req.json();
    if (!clientId || !stageId) {
      return NextResponse.json({ error: 'clientId dan stageId wajib diisi' }, { status: 400 });
    }

    const stage = await prisma.pipelineStage.findUnique({ where: { id: stageId } });
    const prob = probability ?? stage?.probabilityDefault ?? 50;

    const deal = await prisma.deal.create({
      data: {
        clientId,
        serviceId: serviceId || null,
        stageId,
        assignedAeId: assignedAeId || null,
        nilai: Number(nilai) || 0,
        namaProject: namaProject || null,
        probability: Number(prob),
        notes: notes || null,
        dealStatus: stage?.isTerminal ? (stage.nama === 'Won' ? 'won' : 'lost') : 'active',
      },
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error('[PIPELINE POST]', error);
    return NextResponse.json({ error: 'Gagal membuat deal' }, { status: 500 });
  }
}
