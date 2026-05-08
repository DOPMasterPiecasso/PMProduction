import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { nama, email, role, password } = await req.json();
    if (!nama || !email) return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });

    const hashedPwd = password ? await bcrypt.hash(password, 12) : await bcrypt.hash('staff123', 12);

    const avInitial = nama.split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 2);
    const avColors = ['#18181B', '#92400E', '#14532D', '#4C1D95', '#7F1D1D', '#1E3A5F'];

    const user = await prisma.user.create({
      data: {
        nama, email,
        role: role || 'ae',
        password: hashedPwd,
        avatarInitial: avInitial,
        avatarColor: avColors[Math.floor(Math.random() * avColors.length)],
      },
      select: { id: true, nama: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('[USERS POST]', error);
    return NextResponse.json({ error: 'Gagal menambah anggota' }, { status: 500 });
  }
}
