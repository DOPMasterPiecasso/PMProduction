const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const url = new URL(process.env.DATABASE_URL || 'mysql://localhost:3306/creativeos');
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');
  const salt = bcrypt.genSaltSync(10);
  const pwdManager = bcrypt.hashSync('manager123', salt);
  const pwdStaff = bcrypt.hashSync('staff123', salt);

  // ── Users ──────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.create({ data: { id: 'user-dhamar', nama: 'Dhamar', email: 'dhamar@studio.id', password: pwdManager, role: 'manager', avatarInitial: 'D', avatarColor: '#18181B', isActive: true } }),
    prisma.user.create({ data: { id: 'user-riza', nama: 'Riza Maulana', email: 'riza@studio.id', password: pwdStaff, role: 'ae', avatarInitial: 'RM', avatarColor: '#FEF3C7', isActive: true } }),
    prisma.user.create({ data: { id: 'user-sinta', nama: 'Sinta Aryani', email: 'sinta@studio.id', password: pwdStaff, role: 'ae', avatarInitial: 'SA', avatarColor: '#DCFCE7', isActive: true } }),
    prisma.user.create({ data: { id: 'user-bimo', nama: 'Bimo Raharjo', email: 'bimo@studio.id', password: pwdStaff, role: 'ae', avatarInitial: 'BR', avatarColor: '#EDE9FE', isActive: true } }),
    prisma.user.create({ data: { id: 'user-dewi', nama: 'Dewi Lestari', email: 'dewi@studio.id', password: pwdStaff, role: 'ae', avatarInitial: 'DL', avatarColor: '#FEE2E2', isActive: true } }),
  ]);
  console.log(`  ✓ ${users.length} users`);

  // ── Services ────────────────────────────────────────────
  const services = await Promise.all([
    prisma.service.create({ data: { id: 'svc-yearbook', nama: 'Yearbook', deskripsi: 'Produksi buku tahunan sekolah', colorHex: '#2563EB', isActive: true } }),
    prisma.service.create({ data: { id: 'svc-sosmed', nama: 'Social Media Management', deskripsi: 'Kelola konten IG, TikTok, Facebook', colorHex: '#16A34A', isActive: true } }),
    prisma.service.create({ data: { id: 'svc-branding', nama: 'Branding', deskripsi: 'Logo, brand identity, visual system', colorHex: '#7C3AED', isActive: true } }),
    prisma.service.create({ data: { id: 'svc-photo', nama: 'Photo & Video', deskripsi: 'Foto produk, video profil, dokumentasi', colorHex: '#D97706', isActive: true } }),
    prisma.service.create({ data: { id: 'svc-desain', nama: 'Desain Cetak', deskripsi: 'Brosur, banner, merchandise', colorHex: '#94A3B8', isActive: false } }),
  ]);
  console.log(`  ✓ ${services.length} services`);

  // ── Lead Sources ────────────────────────────────────────
  const sources = await Promise.all([
    prisma.leadSource.create({ data: { id: 'src-instagram', nama: 'Instagram', isActive: true } }),
    prisma.leadSource.create({ data: { id: 'src-referral', nama: 'Referral', isActive: true } }),
    prisma.leadSource.create({ data: { id: 'src-tiktok', nama: 'DM TikTok', isActive: true } }),
    prisma.leadSource.create({ data: { id: 'src-wa', nama: 'WA Admin', isActive: true } }),
    prisma.leadSource.create({ data: { id: 'src-relasi', nama: 'Relasi Tim', isActive: true } }),
  ]);
  console.log(`  ✓ ${sources.length} lead sources`);

  // ── Client Types ────────────────────────────────────────
  const types = await Promise.all([
    prisma.clientType.create({ data: { id: 'ct-school', nama: 'School' } }),
    prisma.clientType.create({ data: { id: 'ct-brand', nama: 'Brand' } }),
    prisma.clientType.create({ data: { id: 'ct-corporate', nama: 'Corporate' } }),
  ]);
  console.log(`  ✓ ${types.length} client types`);

  // ── Cities ──────────────────────────────────────────────
  const cities = await Promise.all([
    prisma.city.create({ data: { id: 'city-tangerang', nama: 'Tangerang', provinsi: 'Banten' } }),
    prisma.city.create({ data: { id: 'city-bsd', nama: 'BSD', provinsi: 'Banten' } }),
    prisma.city.create({ data: { id: 'city-jakarta', nama: 'Jakarta', provinsi: 'DKI Jakarta' } }),
    prisma.city.create({ data: { id: 'city-serpong', nama: 'Serpong', provinsi: 'Banten' } }),
  ]);
  console.log(`  ✓ ${cities.length} cities`);

  // ── Pipeline Stages ─────────────────────────────────────
  const stages = await Promise.all([
    prisma.pipelineStage.create({ data: { id: 'stage-lead', nama: 'Lead', urutan: 1, probabilityDefault: 25, colorHex: '#6B7280', isTerminal: false } }),
    prisma.pipelineStage.create({ data: { id: 'stage-contacted', nama: 'Contacted', urutan: 2, probabilityDefault: 40, colorHex: '#3B82F6', isTerminal: false } }),
    prisma.pipelineStage.create({ data: { id: 'stage-proposal', nama: 'Proposal Sent', urutan: 3, probabilityDefault: 50, colorHex: '#8B5CF6', isTerminal: false } }),
    prisma.pipelineStage.create({ data: { id: 'stage-meeting', nama: 'Meeting', urutan: 4, probabilityDefault: 65, colorHex: '#F59E0B', isTerminal: false } }),
    prisma.pipelineStage.create({ data: { id: 'stage-negotiation', nama: 'Negotiation', urutan: 5, probabilityDefault: 80, colorHex: '#EF4444', isTerminal: false } }),
    prisma.pipelineStage.create({ data: { id: 'stage-won', nama: 'Won', urutan: 6, probabilityDefault: 100, colorHex: '#10B981', isTerminal: true } }),
    prisma.pipelineStage.create({ data: { id: 'stage-lost', nama: 'Lost', urutan: 7, probabilityDefault: 0, colorHex: '#9CA3AF', isTerminal: true } }),
  ]);
  console.log(`  ✓ ${stages.length} pipeline stages`);

  // ── Activity Types ──────────────────────────────────────
  await Promise.all([
    prisma.activityType.create({ data: { id: 'act-call', nama: 'Call', colorHex: '#2563EB' } }),
    prisma.activityType.create({ data: { id: 'act-meeting', nama: 'Meeting', colorHex: '#7C3AED' } }),
    prisma.activityType.create({ data: { id: 'act-chat', nama: 'Chat/WA', colorHex: '#16A34A' } }),
    prisma.activityType.create({ data: { id: 'act-proposal', nama: 'Proposal', colorHex: '#D97706' } }),
    prisma.activityType.create({ data: { id: 'act-followup', nama: 'Follow Up', colorHex: '#DC2626' } }),
  ]);
  console.log('  ✓ activity types');

  // ── Clients ─────────────────────────────────────────────
  const clientData = [
    { id: 'cl-sma-cendekia', namaKlien: 'SMA Cendekia', clientTypeId: 'ct-school', kotaId: 'city-tangerang', namaContact: 'Pak Hendra', noHp: '0812-3456-7890', email: 'hendra@smacendekia.sch.id', sourceId: 'src-referral', serviceId: 'svc-yearbook', status: 'ongoing', tags: 'yearbook', createdById: 'user-riza' },
    { id: 'cl-kopi-nusantara', namaKlien: 'Kopi Nusantara', clientTypeId: 'ct-brand', kotaId: 'city-bsd', namaContact: 'Bu Windi', noHp: '0821-9988-7766', email: 'windi@kopinusantara.id', sourceId: 'src-instagram', serviceId: 'svc-branding', status: 'ongoing', tags: 'branding', createdById: 'user-bimo' },
    { id: 'cl-smk-alhikmah', namaKlien: 'SMK Al Hikmah', clientTypeId: 'ct-school', kotaId: 'city-tangerang', namaContact: 'Pak Zainal', noHp: '0813-5544-6677', email: 'zainal@smkalhikmah.sch.id', sourceId: 'src-instagram', serviceId: 'svc-yearbook', status: 'qualified', tags: 'yearbook', createdById: 'user-sinta' },
    { id: 'cl-pt-maju-jaya', namaKlien: 'PT Maju Jaya', clientTypeId: 'ct-corporate', kotaId: 'city-jakarta', namaContact: 'Pak Budi', noHp: '0878-1234-5678', email: 'budi@ptmajujaya.co.id', sourceId: 'src-referral', serviceId: 'svc-sosmed', status: 'ongoing', tags: 'sosmed', createdById: 'user-sinta' },
    { id: 'cl-smk-teknologi', namaKlien: 'SMK Teknologi', clientTypeId: 'ct-school', kotaId: 'city-serpong', namaContact: 'Bu Ratna', noHp: '0857-6655-4433', email: 'ratna@smkteknologi.sch.id', sourceId: 'src-referral', serviceId: 'svc-photo', status: 'closed', tags: 'photo', createdById: 'user-dewi' },
    { id: 'cl-smk-bintang', namaKlien: 'SMK Bintang', clientTypeId: 'ct-school', kotaId: 'city-tangerang', namaContact: 'Pak Rudi', noHp: '0813-1111-2222', email: 'rudi@smkbintang.sch.id', sourceId: 'src-referral', serviceId: 'svc-yearbook', status: 'qualified', tags: 'yearbook', createdById: 'user-riza' },
  ];
  const clients = await Promise.all(clientData.map((c) => prisma.client.create({ data: c })));
  console.log(`  ✓ ${clients.length} clients`);

  // ── Leads ───────────────────────────────────────────────
  const leadData = [
    { id: 'lead-sma-harapan', namaInstitusi: 'SMA Harapan Bangsa', namaContact: 'Pak Ahmad', noHp: '0812-1111-2222', sourceId: 'src-instagram', serviceId: 'svc-yearbook', status: 'baru', assignedToId: null, tanggalMasuk: new Date('2026-04-17') },
    { id: 'lead-klinik', namaInstitusi: 'Klinik Sehat Mandiri', namaContact: 'Bu Rina', noHp: '0819-3333-4444', sourceId: 'src-wa', serviceId: 'svc-photo', status: 'dihubungi', assignedToId: 'user-dewi', tanggalMasuk: new Date('2026-04-17') },
    { id: 'lead-toko-fashion', namaInstitusi: 'Toko Fashion Lokal', namaContact: 'Mas Kevin', noHp: '0856-5555-6666', sourceId: 'src-tiktok', serviceId: 'svc-sosmed', status: 'dihubungi', assignedToId: 'user-sinta', tanggalMasuk: new Date('2026-04-16') },
    { id: 'lead-smk-karya', namaInstitusi: 'SMK Karya Nusa', namaContact: 'Pak Dedi', noHp: '0813-7777-8888', sourceId: 'src-relasi', serviceId: 'svc-yearbook', status: 'baru', assignedToId: null, tanggalMasuk: new Date('2026-04-15') },
    { id: 'lead-startup-edtech', namaInstitusi: 'Startup EdTech XYZ', namaContact: 'Mas Fajar', noHp: '0857-9999-0000', sourceId: 'src-instagram', serviceId: 'svc-branding', status: 'qualified', assignedToId: 'user-bimo', tanggalMasuk: new Date('2026-04-14') },
    { id: 'lead-warung-makan', namaInstitusi: 'Warung Makan Pak Slamet', namaContact: null, noHp: '0821-1234-0000', sourceId: 'src-wa', serviceId: 'svc-photo', status: 'unqualified', assignedToId: 'user-dewi', tanggalMasuk: new Date('2026-04-13') },
  ];
  const leads = await Promise.all(leadData.map((l) => prisma.lead.create({ data: l })));
  console.log(`  ✓ ${leads.length} leads`);

  // ── Deals ───────────────────────────────────────────────
  const now = new Date('2026-04-17');
  const dealData = [
    // Active deals (Lead stage)
    { id: 'deal-smk-alhikmah', clientId: 'cl-smk-alhikmah', serviceId: 'svc-yearbook', assignedAeId: 'user-sinta', stageId: 'stage-lead', nilai: 28000000, namaProject: 'Yearbook 2025/26', probability: 30, isHot: false, tanggalMasuk: new Date('2026-04-10'), deadline: new Date('2026-06-15'), dealStatus: 'active', notes: null },
    { id: 'deal-brand-lokal', clientId: 'cl-smk-alhikmah', serviceId: 'svc-branding', assignedAeId: 'user-bimo', stageId: 'stage-lead', nilai: 12000000, namaProject: 'Brand Identity', probability: 20, isHot: false, tanggalMasuk: new Date('2026-04-12'), deadline: null, dealStatus: 'active', notes: null },
    { id: 'deal-startup-fintech', clientId: 'cl-smk-alhikmah', serviceId: 'svc-photo', assignedAeId: 'user-dewi', stageId: 'stage-lead', nilai: 9000000, namaProject: null, probability: 25, isHot: false, tanggalMasuk: new Date('2026-04-14'), deadline: null, dealStatus: 'active', notes: null },
    // Contacted stage
    { id: 'deal-sma-taruna', clientId: 'cl-sma-cendekia', serviceId: 'svc-yearbook', assignedAeId: 'user-riza', stageId: 'stage-contacted', nilai: 32000000, namaProject: 'Yearbook 2025/26', probability: 40, isHot: false, tanggalMasuk: new Date('2026-04-05'), deadline: new Date('2026-07-01'), dealStatus: 'active', notes: null },
    { id: 'deal-kafe-aesthetic', clientId: 'cl-kopi-nusantara', serviceId: 'svc-sosmed', assignedAeId: 'user-sinta', stageId: 'stage-contacted', nilai: 6000000, namaProject: null, probability: 50, isHot: false, tanggalMasuk: new Date('2026-04-08'), deadline: null, dealStatus: 'active', notes: null },
    // Proposal Sent stage
    { id: 'deal-toko-batik', clientId: 'cl-pt-maju-jaya', serviceId: 'svc-sosmed', assignedAeId: 'user-bimo', stageId: 'stage-proposal', nilai: 8000000, namaProject: null, probability: 50, isHot: false, tanggalMasuk: new Date('2026-04-01'), deadline: null, dealStatus: 'active', notes: null },
    // Meeting stage
    { id: 'deal-sma-bintang', clientId: 'cl-sma-cendekia', serviceId: 'svc-yearbook', assignedAeId: 'user-riza', stageId: 'stage-meeting', nilai: 35000000, namaProject: 'Yearbook 2025/26', probability: 65, isHot: true, tanggalMasuk: new Date('2026-03-20'), deadline: new Date('2026-06-01'), dealStatus: 'active', notes: null },
    { id: 'deal-cv-kreatif', clientId: 'cl-kopi-nusantara', serviceId: 'svc-branding', assignedAeId: 'user-bimo', stageId: 'stage-meeting', nilai: 15000000, namaProject: null, probability: 55, isHot: false, tanggalMasuk: new Date('2026-03-25'), deadline: null, dealStatus: 'active', notes: null },
    // Negotiation stage
    { id: 'deal-pt-agro', clientId: 'cl-pt-maju-jaya', serviceId: 'svc-sosmed', assignedAeId: 'user-sinta', stageId: 'stage-negotiation', nilai: 18000000, namaProject: 'Social Media Q3', probability: 75, isHot: true, tanggalMasuk: new Date('2026-03-15'), deadline: new Date('2026-05-01'), dealStatus: 'active', notes: 'Menunggu feedback proposal' },
    { id: 'deal-smp-nusantara', clientId: 'cl-smk-alhikmah', serviceId: 'svc-yearbook', assignedAeId: 'user-riza', stageId: 'stage-negotiation', nilai: 24000000, namaProject: 'Yearbook 2025/26', probability: 80, isHot: false, tanggalMasuk: new Date('2026-03-10'), deadline: new Date('2026-05-15'), dealStatus: 'active', notes: null },
    // Won stage
    { id: 'deal-sma-cendekia', clientId: 'cl-sma-cendekia', serviceId: 'svc-yearbook', assignedAeId: 'user-riza', stageId: 'stage-won', nilai: 42000000, namaProject: 'Yearbook 2025/26', probability: 100, isHot: false, tanggalMasuk: new Date('2026-02-01'), deadline: new Date('2026-04-30'), dealStatus: 'won', notes: 'MOU - deal' },
    { id: 'deal-kopi-nusantara-won', clientId: 'cl-kopi-nusantara', serviceId: 'svc-branding', assignedAeId: 'user-bimo', stageId: 'stage-won', nilai: 18000000, namaProject: 'Branding', probability: 100, isHot: false, tanggalMasuk: new Date('2026-02-15'), deadline: new Date('2026-05-15'), dealStatus: 'won', notes: null },
    { id: 'deal-pt-maju-jaya-won', clientId: 'cl-pt-maju-jaya', serviceId: 'svc-sosmed', assignedAeId: 'user-sinta', stageId: 'stage-won', nilai: 24000000, namaProject: 'Social Media Q2', probability: 100, isHot: false, tanggalMasuk: new Date('2026-01-10'), deadline: new Date('2026-06-30'), dealStatus: 'won', notes: null },
    { id: 'deal-smk-teknologi', clientId: 'cl-smk-teknologi', serviceId: 'svc-photo', assignedAeId: 'user-dewi', stageId: 'stage-won', nilai: 15000000, namaProject: 'Photo/Video', probability: 100, isHot: false, tanggalMasuk: new Date('2026-03-01'), deadline: new Date('2026-04-08'), dealStatus: 'won', notes: 'Done' },
    // Lost stage
    { id: 'deal-toko-batik-lost', clientId: 'cl-kopi-nusantara', serviceId: 'svc-sosmed', assignedAeId: 'user-bimo', stageId: 'stage-lost', nilai: 8000000, namaProject: null, probability: 0, isHot: false, tanggalMasuk: new Date('2026-03-05'), deadline: null, dealStatus: 'lost', notes: 'Harga terlalu mahal', lostReason: 'Harga terlalu mahal' },
    { id: 'deal-resto-padang', clientId: 'cl-pt-maju-jaya', serviceId: 'svc-photo', assignedAeId: 'user-dewi', stageId: 'stage-lost', nilai: 14000000, namaProject: null, probability: 0, isHot: false, tanggalMasuk: new Date('2026-03-08'), deadline: null, dealStatus: 'lost', notes: 'Kalah kompetitor', lostReason: 'Kalah kompetitor' },
  ];
  const deals = await Promise.all(dealData.map((d) => prisma.deal.create({ data: d })));
  console.log(`  ✓ ${deals.length} deals`);

  // ── Deal Documents ──────────────────────────────────────
  const docs = await Promise.all([
    prisma.dealDocument.create({ data: { id: 'doc-mou-cendekia', dealId: 'deal-sma-cendekia', fileName: 'MOU_SMA_Cendekia_2026.pdf', fileType: 'PDF', fileSizeBytes: 245000, fileUrl: '/uploads/mou-sma-cendekia.pdf', uploadedById: 'user-riza' } }),
    prisma.dealDocument.create({ data: { id: 'doc-brief-cendekia', dealId: 'deal-sma-cendekia', fileName: 'Brief_Yearbook_Cendekia.docx', fileType: 'DOC', fileSizeBytes: 180000, fileUrl: '/uploads/brief-cendekia.docx', uploadedById: 'user-riza' } }),
    prisma.dealDocument.create({ data: { id: 'doc-permintaan-cendekia', dealId: 'deal-sma-cendekia', fileName: 'Permintaan_Khusus_Cendekia.pdf', fileType: 'PDF', fileSizeBytes: 120000, fileUrl: '/uploads/permintaan-cendekia.pdf', uploadedById: 'user-riza' } }),
    prisma.dealDocument.create({ data: { id: 'doc-mou-kopi', dealId: 'deal-kopi-nusantara-won', fileName: 'MOU_Kopi_Nusantara.pdf', fileType: 'PDF', fileSizeBytes: 210000, fileUrl: '/uploads/mou-kopi.pdf', uploadedById: 'user-bimo' } }),
    prisma.dealDocument.create({ data: { id: 'doc-moodboard-kopi', dealId: 'deal-kopi-nusantara-won', fileName: 'Moodboard_Kopi_Nusantara.pdf', fileType: 'PDF', fileSizeBytes: 5600000, fileUrl: '/uploads/moodboard-kopi.pdf', uploadedById: 'user-bimo' } }),
    prisma.dealDocument.create({ data: { id: 'doc-mou-maju', dealId: 'deal-pt-maju-jaya-won', fileName: 'MOU_PT_Maju_Jaya.pdf', fileType: 'PDF', fileSizeBytes: 310000, fileUrl: '/uploads/mou-maju.pdf', uploadedById: 'user-sinta' } }),
    prisma.dealDocument.create({ data: { id: 'doc-brief-maju', dealId: 'deal-pt-maju-jaya-won', fileName: 'Content_Brief_Maju_Jaya.docx', fileType: 'DOC', fileSizeBytes: 95000, fileUrl: '/uploads/brief-maju.docx', uploadedById: 'user-sinta' } }),
    prisma.dealDocument.create({ data: { id: 'doc-strategi-maju', dealId: 'deal-pt-maju-jaya-won', fileName: 'Strategi_Konten_Maju_Jaya.pdf', fileType: 'PDF', fileSizeBytes: 4200000, fileUrl: '/uploads/strategi-maju.pdf', uploadedById: 'user-sinta' } }),
    prisma.dealDocument.create({ data: { id: 'doc-mou-teknologi', dealId: 'deal-smk-teknologi', fileName: 'MOU_SMK_Teknologi.pdf', fileType: 'PDF', fileSizeBytes: 190000, fileUrl: '/uploads/mou-teknologi.pdf', uploadedById: 'user-dewi' } }),
  ]);
  console.log(`  ✓ ${docs.length} deal documents`);

  // ── Invoices ────────────────────────────────────────────
  // Data from template: PM Parama/creativeos-v3.html
  const invData = [
    { id: 'inv-041', clientId: 'cl-smk-teknologi', dealId: 'deal-smk-teknologi', nomorInvoice: '#INV-041', namaProject: 'Photo/Video', nominal: 15000000, tanggalTerbit: new Date('2026-03-01'), jatuhTempo: new Date('2026-04-01'), status: 'paid', keterangan: 'Lunas tepat waktu', paidAmount: 15000000, createdById: 'user-dewi' },
    { id: 'inv-042', clientId: 'cl-sma-cendekia', dealId: 'deal-sma-cendekia', nomorInvoice: '#INV-042', namaProject: 'Yearbook 2025/26', nominal: 12500000, tanggalTerbit: new Date('2026-03-01'), jatuhTempo: new Date('2026-03-30'), status: 'overdue', keterangan: 'Menunggu acc bendahara sekolah', paidAmount: 0, createdById: 'user-riza' },
    { id: 'inv-043', clientId: 'cl-kopi-nusantara', dealId: 'deal-kopi-nusantara-won', nomorInvoice: '#INV-043', namaProject: 'Branding', nominal: 8200000, tanggalTerbit: new Date('2026-03-20'), jatuhTempo: new Date('2026-04-18'), status: 'unpaid', keterangan: null, paidAmount: 0, createdById: 'user-bimo' },
    { id: 'inv-044', clientId: 'cl-pt-maju-jaya', dealId: 'deal-pt-maju-jaya-won', nomorInvoice: '#INV-044', namaProject: 'Social Media Q2', nominal: 12000000, tanggalTerbit: new Date('2026-03-25'), jatuhTempo: new Date('2026-04-22'), status: 'partial', keterangan: 'Sudah bayar 50%, sisa bulan depan', paidAmount: 6000000, createdById: 'user-sinta' },
    { id: 'inv-045', clientId: 'cl-smk-bintang', dealId: null, nomorInvoice: '#INV-045', namaProject: 'Yearbook 2025/26', nominal: 7500000, tanggalTerbit: new Date('2026-04-10'), jatuhTempo: new Date('2026-05-10'), status: 'unpaid', keterangan: null, paidAmount: 0, createdById: 'user-riza' },
  ];
  const invoices = await Promise.all(invData.map((d) => prisma.invoice.create({ data: d })));
  console.log(`  ✓ ${invoices.length} invoices`);

  // ── Invoice Terms (Termin) ─────────────────────────────
  await prisma.invoiceTerm.createMany({
    data: [
      // INV-042: SMA Cendekia - 2 term
      { invoiceId: 'inv-042', terminKe: 1, percentage: 50, amount: 6250000, jatuhTempo: new Date('2026-03-15'), status: 'paid', paidAt: new Date('2026-03-10'), paidAmount: 6250000, keterangan: 'DP 50% - lunas' },
      { invoiceId: 'inv-042', terminKe: 2, percentage: 50, amount: 6250000, jatuhTempo: new Date('2026-03-30'), status: 'overdue', paidAmount: 0, keterangan: 'Pelunasan - belum dibayar' },
      // INV-043: Kopi Nusantara - 2 term
      { invoiceId: 'inv-043', terminKe: 1, percentage: 40, amount: 3280000, jatuhTempo: new Date('2026-04-01'), status: 'paid', paidAt: new Date('2026-03-28'), paidAmount: 3280000, keterangan: 'Termin 1 - lunas' },
      { invoiceId: 'inv-043', terminKe: 2, percentage: 60, amount: 4920000, jatuhTempo: new Date('2026-04-18'), status: 'pending', paidAmount: 0, keterangan: 'Termin 2 - menunggu' },
      // INV-044: PT Maju Jaya - 3 term
      { invoiceId: 'inv-044', terminKe: 1, percentage: 30, amount: 3600000, jatuhTempo: new Date('2026-04-01'), status: 'paid', paidAt: new Date('2026-03-30'), paidAmount: 3600000, keterangan: 'Termin 1' },
      { invoiceId: 'inv-044', terminKe: 2, percentage: 50, amount: 6000000, jatuhTempo: new Date('2026-04-15'), status: 'pending', paidAmount: 0, keterangan: 'Termin 2 - 50%' },
      { invoiceId: 'inv-044', terminKe: 3, percentage: 20, amount: 2400000, jatuhTempo: new Date('2026-04-22'), status: 'pending', paidAmount: 0, keterangan: 'Termin 3 - pelunasan' },
      // INV-045: SMK Bintang - 1 term
      { invoiceId: 'inv-045', terminKe: 1, percentage: 100, amount: 7500000, jatuhTempo: new Date('2026-05-10'), status: 'pending', paidAmount: 0, keterangan: 'Pelunasan' },
    ],
  });
  console.log('  ✓ invoice terms');

  // ── System Settings ─────────────────────────────────────
  const settings = await Promise.all([
    prisma.systemSetting.create({ data: { key: 'studio_name', value: 'CreativeStudio BSD' } }),
    prisma.systemSetting.create({ data: { key: 'wa_admin', value: '0812-xxxx-xxxx' } }),
    prisma.systemSetting.create({ data: { key: 'email_admin', value: 'admin@creativestudio.id' } }),
    prisma.systemSetting.create({ data: { key: 'fu_overdue_days', value: '3' } }),
    prisma.systemSetting.create({ data: { key: 'lead_inactive_days', value: '7' } }),
    prisma.systemSetting.create({ data: { key: 'annual_target', value: '500000000' } }),
  ]);
  console.log(`  ✓ ${settings.length} system settings`);

  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
