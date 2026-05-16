import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'studio_name' } });
    return NextResponse.json({ studio_name: setting?.value || 'CreativeOS' });
  } catch {
    return NextResponse.json({ studio_name: 'CreativeOS' });
  }
}
