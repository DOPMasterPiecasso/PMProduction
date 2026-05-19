import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// PATCH /api/clients/[id] — update client
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      namaKlien, clientTypeId, kotaId, namaContact, noHp, email,
      sourceId, serviceId, tags, status, nextFuDate, catatan, invoiceAccessCode,
    } = body;

    const data: Record<string, unknown> = {
      namaKlien: namaKlien?.trim() || undefined,
      clientTypeId: clientTypeId || null,
      kotaId: kotaId || null,
      namaContact: namaContact ?? undefined,
      noHp: noHp ?? undefined,
      email: email ?? undefined,
      sourceId: sourceId || null,
      serviceId: serviceId || null,
      tags: tags ?? undefined,
      status: status ?? undefined,
      nextFuDate: nextFuDate ? new Date(nextFuDate) : null,
      catatan: catatan ?? undefined,
    };

    // Hapus properti undefined agar Prisma tidak mengirimnya
    for (const key of Object.keys(data)) {
      if (data[key] === undefined) delete data[key];
    }

    const client = await prisma.client.update({
      where: { id },
      data,
      select: {
        id: true,
        namaKlien: true,
        clientTypeId: true,
        kotaId: true,
        namaContact: true,
        noHp: true,
        email: true,
        sourceId: true,
        serviceId: true,
        tags: true,
        status: true,
        nextFuDate: true,
        catatan: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        clientType: { select: { id: true, nama: true } },
        kota: { select: { id: true, nama: true } },
        service: { select: { id: true, nama: true, colorHex: true } },
      },
    });

    // invoiceAccessCode di-update via raw query karena adapter MariaDB
    // memerlukan koneksi fresh untuk mengenali kolom baru
    if (invoiceAccessCode !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE clients SET invoiceAccessCode = ? WHERE id = ?',
        invoiceAccessCode || null,
        id,
      );
    }

    return NextResponse.json({ client });
  } catch (error: unknown) {
    console.error('[CLIENT PATCH]', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Klien tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Gagal mengupdate klien' }, { status: 500 });
  }
}

// DELETE /api/clients/[id] — delete client
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('[CLIENT DELETE]', error);
    return NextResponse.json({ error: 'Gagal menghapus klien' }, { status: 500 });
  }
}
