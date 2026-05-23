import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'export';

    if (mode === 'template') {
      // Return CSV template with headers only
      const csv = '\uFEFFnama,provinsi\n';
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': 'attachment; filename="template-kota.csv"',
        },
      });
    }

    // mode === 'export' - export all cities
    const cities = await prisma.city.findMany({ orderBy: { nama: 'asc' } });
    let csv = '\uFEFFnama,provinsi\n';
    cities.forEach((c) => {
      csv += `"${(c.nama || '').replace(/"/g, '""')}","${(c.provinsi || '').replace(/"/g, '""')}"\n`;
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="database-kota-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error('[CITIES DOWNLOAD]', error);
    return NextResponse.json({ error: 'Gagal mengunduh CSV' }, { status: 500 });
  }
}
