import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });

    const text = await file.text();
    const lines = text.split('\n');

    // Remove BOM if present
    if (lines[0]?.charCodeAt(0) === 0xFEFF) {
      lines[0] = lines[0].slice(1);
    }

    // Parse CSV
    const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, '')) || [];
    const namaIdx = headers.indexOf('nama');
    const provinsiIdx = headers.indexOf('provinsi');

    if (namaIdx === -1) {
      return NextResponse.json({ error: 'CSV harus memiliki kolom "nama" dan opsional "provinsi"' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles quoted fields)
      const cols = parseCSVLine(line);
      const nama = (cols[namaIdx] || '').trim().replace(/^"|"$/g, '');
      const provinsi = provinsiIdx >= 0 ? (cols[provinsiIdx] || '').trim().replace(/^"|"$/g, '') : '';

      if (!nama) { skipped++; continue; }

      try {
        await prisma.city.create({ data: { nama, provinsi: provinsi || null } });
        imported++;
      } catch (err: unknown) {
        if ((err as { code?: string })?.code === 'P2002') {
          skipped++; // duplicate nama
        } else {
          errors.push(`Baris ${i + 1}: ${err instanceof Error ? err.message : 'Error'}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error('[CITIES IMPORT]', error);
    return NextResponse.json({ error: 'Gagal mengimpor CSV' }, { status: 500 });
  }
}

/** Simple CSV line parser that handles quoted fields */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
