#!/usr/bin/env node
// Seed script untuk CreativeOS - PostgreSQL
// Jalankan dengan: node prisma/seed.js

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Mulai seeding data master CreativeOS (PostgreSQL)...\n');

  // ─── 1. SERVICES ──────────────────────────────────────────
  console.log('📦 Seeding Services...');
  const servicesData = [
    { nama: 'Yearbook', deskripsi: 'Produksi buku tahunan sekolah', colorHex: '#2563EB', isActive: true },
    { nama: 'Social Media Management', deskripsi: 'Kelola konten IG, TikTok, Facebook', colorHex: '#16A34A', isActive: true },
    { nama: 'Branding', deskripsi: 'Logo, brand identity, visual system', colorHex: '#7C3AED', isActive: true },
    { nama: 'Photo & Video', deskripsi: 'Foto produk, video profil, dokumentasi', colorHex: '#D97706', isActive: true },
    { nama: 'Desain Cetak', deskripsi: 'Brosur, banner, merchandise', colorHex: '#94A3B8', isActive: false },
  ];
  const services = await Promise.all(servicesData.map(d => prisma.service.upsert({ where: { nama: d.nama }, update: {}, create: d })));
  console.log(`   ✅ ${services.length} services`);

  // ─── 2. LEAD SOURCES ──────────────────────────────────────
  console.log('📡 Seeding Lead Sources...');
  const sourcesData = ['WhatsApp Admin', 'DM Instagram', 'DM TikTok', 'Relasi Tim', 'Referral Klien', 'Walk In', 'Website'];
  const sources = await Promise.all(sourcesData.map(nama => prisma.leadSource.upsert({ where: { nama }, update: {}, create: { nama } })));
  console.log(`   ✅ ${sources.length} lead sources`);

  // ─── 3. CLIENT TYPES ──────────────────────────────────────
  console.log('🏢 Seeding Client Types...');
  const typesData = ['School', 'Brand', 'Corporate', 'UMKM', 'Pemerintah'];
  const clientTypes = await Promise.all(typesData.map(nama => prisma.clientType.upsert({ where: { nama }, update: {}, create: { nama } })));
  console.log(`   ✅ ${clientTypes.length} client types`);

  // ─── 4. CITIES ────────────────────────────────────────────
  console.log('🏙️  Seeding Cities...');
  const citiesData = [
    { id: 'city-tangerang', nama: 'Tangerang', provinsi: 'Banten' },
    { id: 'city-tansel', nama: 'Tangerang Selatan', provinsi: 'Banten' },
    { id: 'city-jakarta', nama: 'Jakarta', provinsi: 'DKI Jakarta' },
    { id: 'city-serpong', nama: 'Serpong', provinsi: 'Banten' },
    { id: 'city-bsd', nama: 'BSD', provinsi: 'Banten' },
    { id: 'city-bekasi', nama: 'Bekasi', provinsi: 'Jawa Barat' },
    { id: 'city-depok', nama: 'Depok', provinsi: 'Jawa Barat' },
    { id: 'city-bogor', nama: 'Bogor', provinsi: 'Jawa Barat' },
  ];
  const cities = await Promise.all(citiesData.map(d => prisma.city.upsert({ where: { id: d.id }, update: {}, create: d })));
  console.log(`   ✅ ${cities.length} cities`);

  // ─── 5. PIPELINE STAGES ───────────────────────────────────
  console.log('🎯 Seeding Pipeline Stages...');
  const stagesData = [
    { nama: 'Lead', urutan: 1, probabilityDefault: 20, colorHex: '#94A3B8', isTerminal: false },
    { nama: 'Contacted', urutan: 2, probabilityDefault: 40, colorHex: '#60A5FA', isTerminal: false },
    { nama: 'Proposal Sent', urutan: 3, probabilityDefault: 50, colorHex: '#7C3AED', isTerminal: false },
    { nama: 'Meeting', urutan: 4, probabilityDefault: 65, colorHex: '#F59E0B', isTerminal: false },
    { nama: 'Negotiation', urutan: 5, probabilityDefault: 80, colorHex: '#F97316', isTerminal: false },
    { nama: 'Won', urutan: 6, probabilityDefault: 100, colorHex: '#16A34A', isTerminal: true },
    { nama: 'Lost', urutan: 7, probabilityDefault: 0, colorHex: '#6B7280', isTerminal: true },
  ];
  const stages = await Promise.all(stagesData.map(d => prisma.pipelineStage.upsert({ where: { nama: d.nama }, update: {}, create: d })));
  console.log(`   ✅ ${stages.length} pipeline stages`);

  // ─── 6. ACTIVITY TYPES ────────────────────────────────────
  console.log('📝 Seeding Activity Types...');
  const actTypesData = [
    { nama: 'Call', colorHex: '#2563EB', icon: 'phone' },
    { nama: 'Meeting', colorHex: '#16A34A', icon: 'users' },
    { nama: 'Chat/WA', colorHex: '#16A34A', icon: 'message-circle' },
    { nama: 'Proposal', colorHex: '#D97706', icon: 'file-text' },
    { nama: 'Visit', colorHex: '#7C3AED', icon: 'map-pin' },
    { nama: 'Email', colorHex: '#6B7280', icon: 'mail' },
    { nama: 'Follow Up', colorHex: '#DC2626', icon: 'refresh-cw' },
  ];
  const actTypes = await Promise.all(actTypesData.map(d => prisma.activityType.upsert({ where: { nama: d.nama }, update: {}, create: d })));
  console.log(`   ✅ ${actTypes.length} activity types`);

  // ─── 7. SYSTEM SETTINGS ───────────────────────────────────
  console.log('⚙️  Seeding System Settings...');
  const settingsData = [
    { key: 'studio_name', value: 'CreativeOS Studio' },
    { key: 'target_revenue_tahunan', value: '500000000' },
    { key: 'currency', value: 'IDR' },
    { key: 'timezone', value: 'Asia/Jakarta' },
  ];
  await Promise.all(settingsData.map(d => prisma.systemSetting.upsert({ where: { key: d.key }, update: {}, create: d })));
  console.log(`   ✅ ${settingsData.length} system settings`);

  // ─── 8. USERS ─────────────────────────────────────────────
  console.log('👥 Seeding Users...');
  const hashedOwner = await bcrypt.hash('owner123', 12);
  const hashedManager = await bcrypt.hash('manager123', 12);
  const hashedStaff = await bcrypt.hash('staff123', 12);

  const usersData = [
    { email: 'owner@studio.id', password: hashedOwner, nama: 'Dhamar', role: 'owner', avatarInitial: 'D', avatarColor: '#18181B' },
    { email: 'manager@studio.id', password: hashedManager, nama: 'Dhamar', role: 'manager', avatarInitial: 'D', avatarColor: '#18181B' },
    { email: 'riza@studio.id', password: hashedStaff, nama: 'Riza Maulana', role: 'ae', avatarInitial: 'RM', avatarColor: '#92400E' },
    { email: 'sinta@studio.id', password: hashedStaff, nama: 'Sinta Aryani', role: 'ae', avatarInitial: 'SA', avatarColor: '#14532D' },
    { email: 'bimo@studio.id', password: hashedStaff, nama: 'Bimo Raharjo', role: 'ae', avatarInitial: 'BR', avatarColor: '#4C1D95' },
    { email: 'dewi@studio.id', password: hashedStaff, nama: 'Dewi Lestari', role: 'ae', avatarInitial: 'DL', avatarColor: '#7F1D1D' },
    { email: 'staff@studio.id', password: hashedStaff, nama: 'Staff Demo', role: 'ae', avatarInitial: 'ST', avatarColor: '#1E3A5F' },
  ];

  const userMap = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u });
    userMap[u.email] = user;
  }
  console.log(`   ✅ ${usersData.length} users`);

  // ─── 9. SAMPLE CLIENTS ────────────────────────────────────
  console.log('🏫 Seeding Sample Clients...');
  const [yearbook, sosmed, branding, photovideo] = services;
  const owner = userMap['owner@studio.id'];

  const smaCendekia = await prisma.client.create({ data: {
    namaKlien: 'SMA Cendekia', clientTypeId: clientTypes[0].id, kotaId: cities[0].id,
    namaContact: 'Pak Hendra', noHp: '0812-3456-7890', email: 'hendra@smacendekia.sch.id',
    sourceId: sources[4].id, serviceId: yearbook.id, tags: 'yearbook,loyal', status: 'ongoing', createdById: owner.id,
  }});
  const kopiNusantara = await prisma.client.create({ data: {
    namaKlien: 'Kopi Nusantara', clientTypeId: clientTypes[1].id, kotaId: cities[4].id,
    namaContact: 'Bu Windi', noHp: '0821-9988-7766', email: 'windi@kopinusantara.id',
    sourceId: sources[1].id, serviceId: branding.id, tags: 'branding', status: 'ongoing',
    nextFuDate: new Date('2026-04-15'), createdById: owner.id,
  }});
  const ptMajuJaya = await prisma.client.create({ data: {
    namaKlien: 'PT Maju Jaya', clientTypeId: clientTypes[2].id, kotaId: cities[2].id,
    namaContact: 'Pak Budi', noHp: '0878-1234-5678', email: 'budi@ptmajujaya.co.id',
    sourceId: sources[4].id, serviceId: sosmed.id, tags: 'sosmed', status: 'ongoing',
    nextFuDate: new Date('2026-04-20'), createdById: owner.id,
  }});
  const smkTeknologi = await prisma.client.create({ data: {
    namaKlien: 'SMK Teknologi', clientTypeId: clientTypes[0].id, kotaId: cities[3].id,
    namaContact: 'Bu Ratna', noHp: '0857-6655-4433', email: 'ratna@smkteknologi.sch.id',
    sourceId: sources[4].id, serviceId: photovideo.id, tags: 'photo', status: 'closed', createdById: owner.id,
  }});
  console.log(`   ✅ 4 clients`);

  // ─── 9b. EXTRA CLIENTS (dari HTML mockup) ─────────────────
  console.log('🏫 Seeding Extra Clients...');
  const smkAlHikmah = await prisma.client.upsert({ where: { id: 'client-smk-hikmah' }, update: {}, create: {
    id: 'client-smk-hikmah', namaKlien: 'SMK Al Hikmah', clientTypeId: clientTypes[0].id, kotaId: cities[0].id,
    namaContact: 'Pak Zainal', noHp: '0813-5544-6677', email: 'zainal@smkalhikmah.sch.id',
    sourceId: sources[1].id, serviceId: yearbook.id, tags: 'yearbook', status: 'qualified',
    nextFuDate: new Date('2026-04-10'), createdById: owner.id,
  }});
  const smaBintang = await prisma.client.upsert({ where: { id: 'client-sma-bintang' }, update: {}, create: {
    id: 'client-sma-bintang', namaKlien: 'SMA Bintang', clientTypeId: clientTypes[0].id, kotaId: cities[0].id,
    namaContact: 'Pak Rahman', noHp: '0811-2233-4455', email: 'rahman@smabintang.sch.id',
    sourceId: sources[4].id, serviceId: yearbook.id, tags: 'yearbook', status: 'ongoing', createdById: owner.id,
  }});

  const kafeAesthetic = await prisma.client.upsert({ where: { id: 'client-kafe-aesthetic' }, update: {}, create: {
    id: 'client-kafe-aesthetic', namaKlien: 'Kafe Aesthetic', clientTypeId: clientTypes[3].id, kotaId: cities[4].id,
    namaContact: 'Bu Sari', noHp: '0821-5566-7788', email: 'sari@kafeaesthetic.id',
    sourceId: sources[1].id, serviceId: sosmed.id, tags: 'sosmed', status: 'qualified', createdById: owner.id,
  }});
  const cvKreatifIndo = await prisma.client.upsert({ where: { id: 'client-cv-kreatif' }, update: {}, create: {
    id: 'client-cv-kreatif', namaKlien: 'CV Kreatif Indo', clientTypeId: clientTypes[2].id, kotaId: cities[2].id,
    namaContact: 'Pak Anton', noHp: '0857-3344-5566', email: 'anton@cvkreatifindo.co.id',
    sourceId: sources[3].id, serviceId: branding.id, tags: 'branding', status: 'qualified', createdById: owner.id,
  }});
  const ptAgroMakmur = await prisma.client.upsert({ where: { id: 'client-pt-agro' }, update: {}, create: {
    id: 'client-pt-agro', namaKlien: 'PT Agro Makmur', clientTypeId: clientTypes[2].id, kotaId: cities[2].id,
    namaContact: 'Bu Dewi', noHp: '0878-9900-1122', email: 'dewi@ptagromakmur.co.id',
    sourceId: sources[1].id, serviceId: sosmed.id, tags: 'sosmed', status: 'ongoing', createdById: owner.id,
  }});
  const smpNusantara = await prisma.client.upsert({ where: { id: 'client-smp-nusantara' }, update: {}, create: {
    id: 'client-smp-nusantara', namaKlien: 'SMP Nusantara', clientTypeId: clientTypes[0].id, kotaId: cities[0].id,
    namaContact: 'Pak Heri', noHp: '0812-6677-8899', email: 'heri@smpnusantara.sch.id',
    sourceId: sources[4].id, serviceId: yearbook.id, tags: 'yearbook', status: 'ongoing', createdById: owner.id,
  }});
  const tokoBatik = await prisma.client.upsert({ where: { id: 'client-toko-batik' }, update: {}, create: {
    id: 'client-toko-batik', namaKlien: 'Toko Batik XYZ', clientTypeId: clientTypes[3].id, kotaId: cities[2].id,
    namaContact: 'Bu Laras', noHp: '0856-1122-3344', email: 'laras@tokobatik.com',
    sourceId: sources[0].id, serviceId: sosmed.id, tags: 'sosmed', status: 'unqualified', createdById: owner.id,
  }});
  const restaurantPadang = await prisma.client.upsert({ where: { id: 'client-resto-padang' }, update: {}, create: {
    id: 'client-resto-padang', namaKlien: 'Restaurant Padang', clientTypeId: clientTypes[3].id, kotaId: cities[2].id,
    namaContact: 'Pak Rizal', noHp: '0821-9988-0011', email: 'rizal@restopadang.com',
    sourceId: sources[0].id, serviceId: photovideo.id, tags: 'photo', status: 'unqualified', createdById: owner.id,
  }});
  console.log(`   ✅ extra clients seeded`);

  // ─── 10. SAMPLE DEALS ─────────────────────────────────────
  console.log('💼 Seeding Sample Deals...');
  const riza = userMap['riza@studio.id'];
  const sinta = userMap['sinta@studio.id'];
  const bimo = userMap['bimo@studio.id'];
  const dewi = userMap['dewi@studio.id'];
  const stageLead = stages[0];
  const stageContacted = stages[1];
  const stageProposal = stages[2];
  const stageMeeting = stages[3];
  const stageNego = stages[4];
  const stageWon = stages[5];
  const stageLost = stages[6];

  const deal1 = await prisma.deal.create({ data: {
    clientId: smaCendekia.id, serviceId: yearbook.id, assignedAeId: riza.id, stageId: stageWon.id,
    nilai: 42000000, probability: 100, tanggalMasuk: new Date('2026-01-15'), deadline: new Date('2026-04-30'), dealStatus: 'won',
  }});
  const deal2 = await prisma.deal.create({ data: {
    clientId: kopiNusantara.id, serviceId: branding.id, assignedAeId: bimo.id, stageId: stageWon.id,
    nilai: 18000000, probability: 100, dealStatus: 'won',
  }});
  const deal3 = await prisma.deal.create({ data: {
    clientId: ptMajuJaya.id, serviceId: sosmed.id, assignedAeId: sinta.id, stageId: stageWon.id,
    nilai: 24000000, probability: 100, dealStatus: 'won',
  }});
  const deal4 = await prisma.deal.create({ data: {
    clientId: smkTeknologi.id, serviceId: photovideo.id, assignedAeId: dewi.id, stageId: stageWon.id,
    nilai: 15000000, probability: 100, dealStatus: 'won',
  }});
  // Extra deals sesuai HTML mockup
  await prisma.deal.create({ data: {
    clientId: smkAlHikmah.id, serviceId: yearbook.id, assignedAeId: riza.id, stageId: stageLead.id,
    nilai: 28000000, probability: 20, dealStatus: 'active',
  }});
  const dealBintang = await prisma.deal.create({ data: {
    clientId: smaBintang.id, serviceId: yearbook.id, assignedAeId: riza.id, stageId: stageMeeting.id,
    nilai: 35000000, probability: 65, isHot: true, dealStatus: 'active',
  }});
  await prisma.deal.create({ data: {
    clientId: kafeAesthetic.id, serviceId: sosmed.id, assignedAeId: sinta.id, stageId: stageContacted.id,
    nilai: 6000000, probability: 40, dealStatus: 'active',
  }});
  await prisma.deal.create({ data: {
    clientId: cvKreatifIndo.id, serviceId: branding.id, assignedAeId: bimo.id, stageId: stageMeeting.id,
    nilai: 15000000, probability: 55, dealStatus: 'active',
  }});
  await prisma.deal.create({ data: {
    clientId: ptAgroMakmur.id, serviceId: sosmed.id, assignedAeId: sinta.id, stageId: stageNego.id,
    nilai: 18000000, probability: 75, isHot: true, dealStatus: 'active',
  }});
  await prisma.deal.create({ data: {
    clientId: smpNusantara.id, serviceId: yearbook.id, assignedAeId: riza.id, stageId: stageNego.id,
    nilai: 24000000, probability: 80, isHot: true, dealStatus: 'active',
  }});
  await prisma.deal.create({ data: {
    clientId: tokoBatik.id, serviceId: sosmed.id, assignedAeId: sinta.id, stageId: stageLost.id,
    nilai: 8000000, probability: 0, dealStatus: 'lost', lostReason: 'Harga terlalu mahal',
  }});
  await prisma.deal.create({ data: {
    clientId: restaurantPadang.id, serviceId: photovideo.id, assignedAeId: dewi.id, stageId: stageLost.id,
    nilai: 14000000, probability: 0, dealStatus: 'lost', lostReason: 'Kalah kompetitor',
  }});
  // Lead stage deals
  await prisma.deal.create({ data: {
    clientId: smaCendekia.id, serviceId: yearbook.id, assignedAeId: riza.id, stageId: stageLead.id,
    nilai: 11000000, probability: 20, dealStatus: 'active',
  }});
  await prisma.deal.create({ data: {
    clientId: ptMajuJaya.id, serviceId: sosmed.id, assignedAeId: sinta.id, stageId: stageContacted.id,
    nilai: 32000000, probability: 40, dealStatus: 'active',
  }});
  console.log(`   ✅ 12 deals total`);

  // ─── 10b. DEAL DOCUMENTS ──────────────────────────────────
  console.log('📄 Seeding Deal Documents...');
  await Promise.all([
    prisma.dealDocument.create({ data: { dealId: deal1.id, fileName: 'MOU-SMA-Cendekia-2026.pdf', fileType: 'PDF', fileSizeBytes: 2100000 } }),
    prisma.dealDocument.create({ data: { dealId: deal1.id, fileName: 'Brief-Yearbook-2026.docx', fileType: 'DOC', fileSizeBytes: 840000 } }),
    prisma.dealDocument.create({ data: { dealId: deal1.id, fileName: 'Permintaan-Khusus.pdf', fileType: 'PDF', fileSizeBytes: 1300000 } }),
    prisma.dealDocument.create({ data: { dealId: deal2.id, fileName: 'MOU-Kopi-Nusantara.pdf', fileType: 'PDF', fileSizeBytes: 1800000 } }),
    prisma.dealDocument.create({ data: { dealId: deal2.id, fileName: 'Moodboard-Brand-Reference.jpg', fileType: 'JPG', fileSizeBytes: 5200000 } }),
    prisma.dealDocument.create({ data: { dealId: deal3.id, fileName: 'MOU-PT-Maju-Jaya.pdf', fileType: 'PDF', fileSizeBytes: 2400000 } }),
    prisma.dealDocument.create({ data: { dealId: deal3.id, fileName: 'Content-Brief-Q2.docx', fileType: 'DOC', fileSizeBytes: 1100000 } }),
    prisma.dealDocument.create({ data: { dealId: deal3.id, fileName: 'Strategi-Konten-Q2.pptx', fileType: 'PPT', fileSizeBytes: 8700000 } }),
    prisma.dealDocument.create({ data: { dealId: deal4.id, fileName: 'MOU-SMK-Teknologi.pdf', fileType: 'PDF', fileSizeBytes: 1600000 } }),
  ]);
  console.log(`   ✅ 9 deal documents`);

  // ─── 11. SAMPLE INVOICES ──────────────────────────────────
  console.log('🧾 Seeding Sample Invoices...');
  await Promise.all([
    prisma.invoice.upsert({ where: { nomorInvoice: '#INV-042' }, update: {}, create: { clientId: smaCendekia.id, dealId: deal1.id, nomorInvoice: '#INV-042', namaProject: 'Yearbook 2025/26', nominal: 12500000, jatuhTempo: new Date('2026-03-30'), status: 'overdue', keterangan: 'Menunggu acc bendahara', createdById: owner.id } }),
    prisma.invoice.upsert({ where: { nomorInvoice: '#INV-043' }, update: {}, create: { clientId: kopiNusantara.id, dealId: deal2.id, nomorInvoice: '#INV-043', namaProject: 'Branding', nominal: 8200000, jatuhTempo: new Date('2026-04-18'), status: 'unpaid', createdById: owner.id } }),
    prisma.invoice.upsert({ where: { nomorInvoice: '#INV-044' }, update: {}, create: { clientId: ptMajuJaya.id, dealId: deal3.id, nomorInvoice: '#INV-044', namaProject: 'Social Media Q2', nominal: 6000000, jatuhTempo: new Date('2026-04-22'), status: 'partial', keterangan: 'Sudah bayar 50%', paidAmount: 3000000, createdById: owner.id } }),
    prisma.invoice.upsert({ where: { nomorInvoice: '#INV-041' }, update: {}, create: { clientId: smkTeknologi.id, dealId: deal4.id, nomorInvoice: '#INV-041', namaProject: 'Photo/Video', nominal: 15000000, jatuhTempo: new Date('2026-04-01'), status: 'paid', keterangan: 'Lunas tepat waktu', paidAmount: 15000000, createdById: owner.id } }),
    prisma.invoice.upsert({ where: { nomorInvoice: '#INV-045' }, update: {}, create: { clientId: smaBintang.id, dealId: dealBintang.id, nomorInvoice: '#INV-045', namaProject: 'Yearbook 2025/26', nominal: 7500000, jatuhTempo: new Date('2026-05-10'), status: 'unpaid', createdById: owner.id } }),
  ]);
  console.log(`   ✅ 5 invoices`);

  // ─── 12. SAMPLE LEADS ─────────────────────────────────────
  console.log('📬 Seeding Sample Leads...');
  await Promise.all([
    prisma.lead.create({ data: { namaInstitusi: 'SMA Harapan Bangsa', namaContact: 'Pak Ahmad', noHp: '0812-1111-2222', sourceId: sources[1].id, serviceId: yearbook.id, status: 'baru' } }),
    prisma.lead.create({ data: { namaInstitusi: 'Klinik Sehat Mandiri', namaContact: 'Bu Rina', noHp: '0819-3333-4444', sourceId: sources[0].id, serviceId: photovideo.id, assignedToId: dewi.id, status: 'dihubungi' } }),
    prisma.lead.create({ data: { namaInstitusi: 'Toko Fashion Lokal', namaContact: 'Mas Kevin', noHp: '0856-5555-6666', sourceId: sources[2].id, serviceId: sosmed.id, assignedToId: sinta.id, status: 'dihubungi' } }),
    prisma.lead.create({ data: { namaInstitusi: 'SMK Karya Nusa', namaContact: 'Pak Dedi', noHp: '0813-7777-8888', sourceId: sources[3].id, serviceId: yearbook.id, status: 'baru' } }),
    prisma.lead.create({ data: { namaInstitusi: 'Startup EdTech XYZ', namaContact: 'Mas Fajar', noHp: '0857-9999-0000', sourceId: sources[1].id, serviceId: branding.id, assignedToId: bimo.id, status: 'qualified' } }),
    prisma.lead.create({ data: { namaInstitusi: 'Warung Makan Pak Slamet', noHp: '0821-1234-0000', sourceId: sources[0].id, serviceId: photovideo.id, assignedToId: dewi.id, status: 'unqualified' } }),
  ]);
  console.log(`   ✅ 6 leads`);

  // ─── 13. SAMPLE ACTIVITIES ─────────────────────────────────
  console.log('📋 Seeding Sample Activities...');
  const [callType, meetingType, chatType, proposalType, visitType] = actTypes;
  const actClients = [smaCendekia, ptAgroMakmur, smpNusantara, smkTeknologi, ptMajuJaya];
  const activitiesData = [
    { clientId: smaCendekia.id, typeId: meetingType.id, picId: riza.id, tanggalAktivitas: new Date('2026-04-12T10:00:00'), catatan: 'Review dummy hal 1-40. Klien approve.', nextAction: 'Produksi lanjut 41-80', nextActionDate: new Date('2026-04-15'), isDone: false },
    { clientId: ptAgroMakmur.id, typeId: proposalType.id, picId: riza.id, tanggalAktivitas: new Date('2026-04-12T14:00:00'), catatan: 'Kirim proposal social media management', nextAction: 'Follow-up balasan', nextActionDate: new Date('2026-04-12'), isDone: false },
    { clientId: smpNusantara.id, typeId: callType.id, picId: riza.id, tanggalAktivitas: new Date('2026-04-11T09:30:00'), catatan: 'Negosiasi harga. Klien minta diskon 5%.', nextAction: 'Kirim jawaban negosiasi', nextActionDate: new Date('2026-04-12'), isDone: false },
    { clientId: smkTeknologi.id, typeId: visitType.id, picId: dewi.id, tanggalAktivitas: new Date('2026-04-10T11:00:00'), catatan: 'Serah terima foto dan video wisuda', nextAction: 'Kirim invoice final', nextActionDate: new Date('2026-04-15'), isDone: false },
    { clientId: ptMajuJaya.id, typeId: meetingType.id, picId: sinta.id, tanggalAktivitas: new Date('2026-04-09T13:00:00'), catatan: 'Kick-off social media Q2. Sepakat brief.', nextAction: 'Upload konten pertama', nextActionDate: new Date('2026-04-20'), isDone: false },
    { clientId: smaCendekia.id, typeId: chatType.id, picId: riza.id, tanggalAktivitas: new Date('2026-04-08T16:00:00'), catatan: 'Konfirmasi jadwal review via WA', nextAction: 'Siapkan dummy halaman', nextActionDate: new Date('2026-04-11'), isDone: true },
    { clientId: kopiNusantara.id, typeId: callType.id, picId: bimo.id, tanggalAktivitas: new Date('2026-04-07T10:00:00'), catatan: 'Follow-up branding progress', nextAction: 'Kirim draft logo', nextActionDate: new Date('2026-04-14'), isDone: false },
    { clientId: ptMajuJaya.id, typeId: proposalType.id, picId: sinta.id, tanggalAktivitas: new Date('2026-04-06T15:00:00'), catatan: 'Kirim proposal tambahan untuk IG Stories', nextAction: 'Tungguapproval', nextActionDate: new Date('2026-04-18'), isDone: true },
  ];
  await Promise.all(activitiesData.map(d => prisma.activity.create({ data: d })));
  console.log(`   ✅ ${activitiesData.length} activities`);

  // ─── 14. KPI TARGETS ──────────────────────────────────────
  console.log('📊 Seeding KPI Targets...');
  const bulanIni = '2026-05';
  const kpiData = [
    { user: riza, targetDeals: 10, targetRevenue: 150000000 },
    { user: sinta, targetDeals: 8, targetRevenue: 120000000 },
    { user: bimo, targetDeals: 6, targetRevenue: 80000000 },
    { user: dewi, targetDeals: 5, targetRevenue: 60000000 },
  ];
  await Promise.all(kpiData.map(k =>
    prisma.kpiTarget.upsert({
      where: { userId_bulan: { userId: k.user.id, bulan: bulanIni } },
      update: {},
      create: { userId: k.user.id, bulan: bulanIni, targetDeals: k.targetDeals, targetRevenue: k.targetRevenue },
    })
  ));
  console.log(`   ✅ 4 KPI targets`);

  console.log('\n🎉 Seeding selesai! Database siap digunakan.\n');
  console.log('📋 Akun Login:');
  console.log('   Owner   : owner@studio.id   / owner123');
  console.log('   Manager : manager@studio.id / manager123');
  console.log('   AE      : riza@studio.id    / staff123');
  console.log('   Staff   : staff@studio.id   / staff123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
