-- CreativeOS Database Export
-- Generated: 2026-05-19T09:19:33.422Z

CREATE TABLE `activities` (
  `id` varchar(191) NOT NULL,
  `dealId` varchar(191) DEFAULT NULL,
  `clientId` varchar(191) DEFAULT NULL,
  `typeId` varchar(191) DEFAULT NULL,
  `picId` varchar(191) DEFAULT NULL,
  `tanggalAktivitas` datetime(3) NOT NULL,
  `catatan` text DEFAULT NULL,
  `nextAction` text DEFAULT NULL,
  `nextActionDate` datetime(3) DEFAULT NULL,
  `isDone` tinyint(1) NOT NULL DEFAULT 0,
  `fileUrl` varchar(191) DEFAULT NULL,
  `fileName` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `activities_dealId_fkey` (`dealId`),
  KEY `activities_clientId_fkey` (`clientId`),
  KEY `activities_typeId_fkey` (`typeId`),
  KEY `activities_picId_fkey` (`picId`),
  CONSTRAINT `activities_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `activities_dealId_fkey` FOREIGN KEY (`dealId`) REFERENCES `deals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `activities_picId_fkey` FOREIGN KEY (`picId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `activities_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `activity_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `activity_types` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `colorHex` varchar(191) NOT NULL DEFAULT '#2563EB',
  `icon` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activity_types_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO activity_types (id, nama, colorHex, icon) VALUES ('act-call', 'Call', '#2563EB', NULL);
INSERT INTO activity_types (id, nama, colorHex, icon) VALUES ('act-chat', 'Chat/WA', '#16A34A', NULL);
INSERT INTO activity_types (id, nama, colorHex, icon) VALUES ('act-followup', 'Follow Up', '#DC2626', NULL);
INSERT INTO activity_types (id, nama, colorHex, icon) VALUES ('act-meeting', 'Meeting', '#7C3AED', NULL);
INSERT INTO activity_types (id, nama, colorHex, icon) VALUES ('act-proposal', 'Proposal', '#D97706', NULL);

CREATE TABLE `cities` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `provinsi` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO cities (id, nama, provinsi) VALUES ('city-bsd', 'BSD', 'Banten');
INSERT INTO cities (id, nama, provinsi) VALUES ('city-jakarta', 'Jakarta', 'DKI Jakarta');
INSERT INTO cities (id, nama, provinsi) VALUES ('city-serpong', 'Serpong', 'Banten');
INSERT INTO cities (id, nama, provinsi) VALUES ('city-tangerang', 'Tangerang', 'Banten');

CREATE TABLE `client_types` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_types_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO client_types (id, nama) VALUES ('ct-brand', 'Brand');
INSERT INTO client_types (id, nama) VALUES ('ct-corporate', 'Corporate');
INSERT INTO client_types (id, nama) VALUES ('ct-school', 'School');

CREATE TABLE `clients` (
  `id` varchar(191) NOT NULL,
  `namaKlien` varchar(191) NOT NULL,
  `clientTypeId` varchar(191) DEFAULT NULL,
  `kotaId` varchar(191) DEFAULT NULL,
  `namaContact` varchar(191) DEFAULT NULL,
  `noHp` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `sourceId` varchar(191) DEFAULT NULL,
  `serviceId` varchar(191) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'unqualified',
  `nextFuDate` datetime(3) DEFAULT NULL,
  `catatan` text DEFAULT NULL,
  `invoiceAccessCode` text DEFAULT NULL,
  `createdById` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `clients_clientTypeId_fkey` (`clientTypeId`),
  KEY `clients_kotaId_fkey` (`kotaId`),
  KEY `clients_sourceId_fkey` (`sourceId`),
  KEY `clients_serviceId_fkey` (`serviceId`),
  KEY `clients_createdById_fkey` (`createdById`),
  CONSTRAINT `clients_clientTypeId_fkey` FOREIGN KEY (`clientTypeId`) REFERENCES `client_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `clients_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `clients_kotaId_fkey` FOREIGN KEY (`kotaId`) REFERENCES `cities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `clients_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `clients_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `lead_sources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO clients (id, namaKlien, clientTypeId, kotaId, namaContact, noHp, email, sourceId, serviceId, tags, status, nextFuDate, catatan, invoiceAccessCode, createdById, createdAt, updatedAt) VALUES ('cl-kopi-nusantara', 'Kopi Nusantara', 'ct-brand', 'city-bsd', 'Bu Windi', '087780319183', 'windi@kopinusantara.id', NULL, 'svc-branding', 'branding', 'ongoing', NULL, '', 'Y2PMVL', 'user-bimo', '2026-05-15 13:05:40', '2026-05-19 00:06:49');
INSERT INTO clients (id, namaKlien, clientTypeId, kotaId, namaContact, noHp, email, sourceId, serviceId, tags, status, nextFuDate, catatan, invoiceAccessCode, createdById, createdAt, updatedAt) VALUES ('cl-pt-maju-jaya', 'PT Maju Jaya', 'ct-corporate', 'city-jakarta', 'Pak Budi', '0878-1234-5678', 'budi@ptmajujaya.co.id', 'src-referral', 'svc-sosmed', 'sosmed', 'ongoing', NULL, NULL, NULL, 'user-sinta', '2026-05-15 13:05:40', '2026-05-15 13:05:40');
INSERT INTO clients (id, namaKlien, clientTypeId, kotaId, namaContact, noHp, email, sourceId, serviceId, tags, status, nextFuDate, catatan, invoiceAccessCode, createdById, createdAt, updatedAt) VALUES ('cl-sma-cendekia', 'SMA Cendekia 1', 'ct-school', 'city-tangerang', 'Pak Hendra', '082125189383', 'hendra@smacendekia.sch.id', NULL, 'svc-yearbook', 'yearbook', 'ongoing', NULL, '', '4RF3R4', 'user-riza', '2026-05-15 13:05:40', '2026-05-19 00:08:14');
INSERT INTO clients (id, namaKlien, clientTypeId, kotaId, namaContact, noHp, email, sourceId, serviceId, tags, status, nextFuDate, catatan, invoiceAccessCode, createdById, createdAt, updatedAt) VALUES ('cl-smk-alhikmah', 'SMK Al Hikmah', 'ct-school', 'city-tangerang', 'Pak Zainal', '0813-5544-6677', 'zainal@smkalhikmah.sch.id', 'src-instagram', 'svc-yearbook', 'yearbook', 'qualified', NULL, NULL, NULL, 'user-sinta', '2026-05-15 13:05:40', '2026-05-15 13:05:40');
INSERT INTO clients (id, namaKlien, clientTypeId, kotaId, namaContact, noHp, email, sourceId, serviceId, tags, status, nextFuDate, catatan, invoiceAccessCode, createdById, createdAt, updatedAt) VALUES ('cl-smk-bintang', 'SMK Bintang', 'ct-school', 'city-tangerang', 'Pak Rudi', '0813-1111-2222', 'rudi@smkbintang.sch.id', 'src-referral', 'svc-yearbook', 'yearbook', 'qualified', NULL, NULL, NULL, 'user-riza', '2026-05-15 13:05:40', '2026-05-15 13:05:40');
INSERT INTO clients (id, namaKlien, clientTypeId, kotaId, namaContact, noHp, email, sourceId, serviceId, tags, status, nextFuDate, catatan, invoiceAccessCode, createdById, createdAt, updatedAt) VALUES ('cl-smk-teknologi', 'SMK Teknologi', 'ct-school', 'city-serpong', 'Bu Ratna', '0857-6655-4433', 'ratna@smkteknologi.sch.id', 'src-referral', 'svc-photo', 'photo', 'closed', NULL, NULL, NULL, 'user-dewi', '2026-05-15 13:05:40', '2026-05-15 13:05:40');

CREATE TABLE `deal_documents` (
  `id` varchar(191) NOT NULL,
  `dealId` varchar(191) NOT NULL,
  `fileName` text NOT NULL,
  `fileType` varchar(191) DEFAULT NULL,
  `fileSizeBytes` int(11) DEFAULT NULL,
  `fileUrl` text DEFAULT NULL,
  `uploadedById` varchar(191) DEFAULT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `deal_documents_dealId_fkey` (`dealId`),
  KEY `deal_documents_uploadedById_fkey` (`uploadedById`),
  CONSTRAINT `deal_documents_dealId_fkey` FOREIGN KEY (`dealId`) REFERENCES `deals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `deal_documents_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO deal_documents (id, dealId, fileName, fileType, fileSizeBytes, fileUrl, uploadedById, uploadedAt) VALUES ('doc-brief-cendekia', 'deal-sma-cendekia', 'Brief_Yearbook_Cendekia.docx', 'DOC', 180000, '/uploads/brief-cendekia.docx', 'user-riza', '2026-05-15 13:05:41');
INSERT INTO deal_documents (id, dealId, fileName, fileType, fileSizeBytes, fileUrl, uploadedById, uploadedAt) VALUES ('doc-brief-maju', 'deal-pt-maju-jaya-won', 'Content_Brief_Maju_Jaya.docx', 'DOC', 95000, '/uploads/brief-maju.docx', 'user-sinta', '2026-05-15 13:05:41');
INSERT INTO deal_documents (id, dealId, fileName, fileType, fileSizeBytes, fileUrl, uploadedById, uploadedAt) VALUES ('doc-moodboard-kopi', 'deal-kopi-nusantara-won', 'Moodboard_Kopi_Nusantara.pdf', 'PDF', 5600000, '/uploads/moodboard-kopi.pdf', 'user-bimo', '2026-05-15 13:05:41');
INSERT INTO deal_documents (id, dealId, fileName, fileType, fileSizeBytes, fileUrl, uploadedById, uploadedAt) VALUES ('doc-mou-cendekia', 'deal-sma-cendekia', 'MOU_SMA_Cendekia_2026.pdf', 'PDF', 245000, '/uploads/mou-sma-cendekia.pdf', 'user-riza', '2026-05-15 13:05:41');
INSERT INTO deal_documents (id, dealId, fileName, fileType, fileSizeBytes, fileUrl, uploadedById, uploadedAt) VALUES ('doc-mou-kopi', 'deal-kopi-nusantara-won', 'MOU_Kopi_Nusantara.pdf', 'PDF', 210000, '/uploads/mou-kopi.pdf', 'user-bimo', '2026-05-15 13:05:41');
INSERT INTO deal_documents (id, dealId, fileName, fileType, fileSizeBytes, fileUrl, uploadedById, uploadedAt) VALUES ('doc-mou-maju', 'deal-pt-maju-jaya-won', 'MOU_PT_Maju_Jaya.pdf', 'PDF', 310000, '/uploads/mou-maju.pdf', 'user-sinta', '2026-05-15 13:05:41');
INSERT INTO deal_documents (id, dealId, fileName, fileType, fileSizeBytes, fileUrl, uploadedById, uploadedAt) VALUES ('doc-mou-teknologi', 'deal-smk-teknologi', 'MOU_SMK_Teknologi.pdf', 'PDF', 190000, '/uploads/mou-teknologi.pdf', 'user-dewi', '2026-05-15 13:05:41');
INSERT INTO deal_documents (id, dealId, fileName, fileType, fileSizeBytes, fileUrl, uploadedById, uploadedAt) VALUES ('doc-permintaan-cendekia', 'deal-sma-cendekia', 'Permintaan_Khusus_Cendekia.pdf', 'PDF', 120000, '/uploads/permintaan-cendekia.pdf', 'user-riza', '2026-05-15 13:05:41');
INSERT INTO deal_documents (id, dealId, fileName, fileType, fileSizeBytes, fileUrl, uploadedById, uploadedAt) VALUES ('doc-strategi-maju', 'deal-pt-maju-jaya-won', 'Strategi_Konten_Maju_Jaya.pdf', 'PDF', 4200000, '/uploads/strategi-maju.pdf', 'user-sinta', '2026-05-15 13:05:41');

CREATE TABLE `deals` (
  `id` varchar(191) NOT NULL,
  `clientId` varchar(191) NOT NULL,
  `serviceId` varchar(191) DEFAULT NULL,
  `assignedAeId` varchar(191) DEFAULT NULL,
  `stageId` varchar(191) DEFAULT NULL,
  `nilai` double NOT NULL DEFAULT 0,
  `namaProject` varchar(191) DEFAULT NULL,
  `probability` int(11) NOT NULL DEFAULT 50,
  `isHot` tinyint(1) NOT NULL DEFAULT 0,
  `tanggalMasuk` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `deadline` datetime(3) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `lostReason` text DEFAULT NULL,
  `dealStatus` varchar(191) NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `deals_clientId_fkey` (`clientId`),
  KEY `deals_serviceId_fkey` (`serviceId`),
  KEY `deals_assignedAeId_fkey` (`assignedAeId`),
  KEY `deals_stageId_fkey` (`stageId`),
  CONSTRAINT `deals_assignedAeId_fkey` FOREIGN KEY (`assignedAeId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `deals_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `deals_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `deals_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `pipeline_stages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-brand-lokal', 'cl-smk-alhikmah', 'svc-branding', 'user-bimo', 'stage-lead', 12000000, 'Brand Identity', 20, 0, '2026-04-11 17:00:00', NULL, NULL, NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-cv-kreatif', 'cl-kopi-nusantara', 'svc-branding', 'user-bimo', 'stage-meeting', 15000000, NULL, 55, 0, '2026-03-24 17:00:00', NULL, NULL, NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-kafe-aesthetic', 'cl-kopi-nusantara', 'svc-sosmed', 'user-sinta', 'stage-contacted', 6000000, NULL, 50, 0, '2026-04-07 17:00:00', NULL, NULL, NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-kopi-nusantara-won', 'cl-kopi-nusantara', 'svc-branding', 'user-bimo', 'stage-won', 18000000, 'Branding', 100, 0, '2026-02-14 17:00:00', '2026-05-14 17:00:00', NULL, NULL, 'won', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-pt-agro', 'cl-pt-maju-jaya', 'svc-sosmed', 'user-sinta', 'stage-negotiation', 18000000, 'Social Media Q3', 75, 1, '2026-03-14 17:00:00', '2026-04-30 17:00:00', 'Menunggu feedback proposal', NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-pt-maju-jaya-won', 'cl-pt-maju-jaya', 'svc-sosmed', 'user-sinta', 'stage-won', 24000000, 'Social Media Q2', 100, 0, '2026-01-09 17:00:00', '2026-06-29 17:00:00', NULL, NULL, 'won', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-resto-padang', 'cl-pt-maju-jaya', 'svc-photo', 'user-dewi', 'stage-lost', 14000000, NULL, 0, 0, '2026-03-07 17:00:00', NULL, 'Kalah kompetitor', 'Kalah kompetitor', 'lost', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-sma-bintang', 'cl-sma-cendekia', 'svc-yearbook', 'user-riza', 'stage-meeting', 35000000, 'Yearbook 2025/26', 65, 1, '2026-03-19 17:00:00', '2026-05-31 17:00:00', NULL, NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-sma-cendekia', 'cl-sma-cendekia', 'svc-yearbook', 'user-riza', 'stage-won', 42000000, 'Yearbook 2025/26', 100, 0, '2026-01-31 17:00:00', '2026-04-29 17:00:00', 'MOU - deal', NULL, 'won', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-sma-taruna', 'cl-sma-cendekia', 'svc-yearbook', 'user-riza', 'stage-contacted', 32000000, 'Yearbook 2025/26', 40, 0, '2026-04-04 17:00:00', '2026-06-30 17:00:00', NULL, NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-smk-alhikmah', 'cl-smk-alhikmah', 'svc-yearbook', 'user-sinta', 'stage-lead', 28000000, 'Yearbook 2025/26', 30, 0, '2026-04-09 17:00:00', '2026-06-14 17:00:00', NULL, NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-smk-teknologi', 'cl-smk-teknologi', 'svc-photo', 'user-dewi', 'stage-won', 15000000, 'Photo/Video', 100, 0, '2026-02-28 17:00:00', '2026-04-07 17:00:00', 'Done', NULL, 'won', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-smp-nusantara', 'cl-smk-alhikmah', 'svc-yearbook', 'user-riza', 'stage-negotiation', 24000000, 'Yearbook 2025/26', 80, 0, '2026-03-09 17:00:00', '2026-05-14 17:00:00', NULL, NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-startup-fintech', 'cl-smk-alhikmah', 'svc-photo', 'user-dewi', 'stage-lead', 9000000, NULL, 25, 0, '2026-04-13 17:00:00', NULL, NULL, NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-toko-batik', 'cl-pt-maju-jaya', 'svc-sosmed', 'user-bimo', 'stage-proposal', 8000000, NULL, 50, 0, '2026-03-31 17:00:00', NULL, NULL, NULL, 'active', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO deals (id, clientId, serviceId, assignedAeId, stageId, nilai, namaProject, probability, isHot, tanggalMasuk, deadline, notes, lostReason, dealStatus, createdAt, updatedAt) VALUES ('deal-toko-batik-lost', 'cl-kopi-nusantara', 'svc-sosmed', 'user-bimo', 'stage-lost', 8000000, NULL, 0, 0, '2026-03-04 17:00:00', NULL, 'Harga terlalu mahal', 'Harga terlalu mahal', 'lost', '2026-05-15 13:05:41', '2026-05-15 13:05:41');

CREATE TABLE `invoice_documents` (
  `id` varchar(191) NOT NULL,
  `invoiceId` varchar(191) NOT NULL,
  `fileName` text NOT NULL,
  `fileType` varchar(191) DEFAULT NULL,
  `fileSizeBytes` int(11) DEFAULT NULL,
  `fileUrl` text DEFAULT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `invoice_documents_invoiceId_fkey` (`invoiceId`),
  CONSTRAINT `invoice_documents_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO invoice_documents (id, invoiceId, fileName, fileType, fileSizeBytes, fileUrl, uploadedAt) VALUES ('cmpc7s3do0005pri07ovcimw1', 'inv-042', 'INVOICE #43870.pdf', 'PDF', 817329, '/uploads/invoices/1779169830655-oomk8h.pdf', '2026-05-18 22:50:30');

CREATE TABLE `invoice_reminders` (
  `id` varchar(191) NOT NULL,
  `invoiceId` varchar(191) NOT NULL,
  `daysBefore` int(11) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastSentAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_invoice_reminder` (`invoiceId`,`daysBefore`),
  CONSTRAINT `fk_reminder_invoice` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO invoice_reminders (id, invoiceId, daysBefore, isActive, lastSentAt, createdAt, updatedAt) VALUES ('cmpccveic00002qi07zaoniu4', 'inv-041', 3, 1, NULL, '2026-05-19 01:13:03', '2026-05-19 01:13:03');
INSERT INTO invoice_reminders (id, invoiceId, daysBefore, isActive, lastSentAt, createdAt, updatedAt) VALUES ('cmpce83om0000gsi0cszpzftc', 'inv-042', 1, 1, NULL, '2026-05-19 01:50:55', '2026-05-19 01:50:55');
INSERT INTO invoice_reminders (id, invoiceId, daysBefore, isActive, lastSentAt, createdAt, updatedAt) VALUES ('cmpce85730001gsi0u8oqpyz7', 'inv-042', 3, 1, NULL, '2026-05-19 01:50:57', '2026-05-19 01:50:57');

CREATE TABLE `invoice_term_documents` (
  `id` varchar(191) NOT NULL,
  `termId` varchar(191) NOT NULL,
  `fileName` text NOT NULL,
  `fileType` varchar(191) DEFAULT NULL,
  `fileSizeBytes` int(11) DEFAULT NULL,
  `fileUrl` text DEFAULT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `invoice_term_documents_termId_fkey` (`termId`),
  CONSTRAINT `invoice_term_documents_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `invoice_terms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO invoice_term_documents (id, termId, fileName, fileType, fileSizeBytes, fileUrl, uploadedAt) VALUES ('cmpc6hdvu0002pri0q9nb68mg', 'cmp7ckg9e0000vmi0q9ffujum', 'INVOICE #43870.pdf', 'PDF', 817329, '/uploads/invoices/1779167651390-fspezl.pdf', '2026-05-18 22:14:11');

CREATE TABLE `invoice_terms` (
  `id` varchar(30) NOT NULL,
  `invoiceId` varchar(30) NOT NULL,
  `terminKe` int(11) NOT NULL,
  `percentage` float DEFAULT NULL,
  `amount` float NOT NULL,
  `jatuhTempo` datetime NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `paidAt` datetime DEFAULT NULL,
  `paidAmount` float DEFAULT 0,
  `keterangan` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO invoice_terms (id, invoiceId, terminKe, percentage, amount, jatuhTempo, status, paidAt, paidAmount, keterangan, createdAt, updatedAt) VALUES ('cmp7ckg9e0000vmi0q9ffujum', 'inv-042', 1, 50, 6250000, '2026-03-14 17:00:00', 'paid', '2026-03-09 17:00:00', 6250000, 'DP 50% - lunas', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO invoice_terms (id, invoiceId, terminKe, percentage, amount, jatuhTempo, status, paidAt, paidAmount, keterangan, createdAt, updatedAt) VALUES ('cmp7ckg9e0001vmi0qsqgfb73', 'inv-042', 2, 50, 6250000, '2026-03-29 17:00:00', 'overdue', NULL, 0, 'Pelunasan - belum dibayar', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO invoice_terms (id, invoiceId, terminKe, percentage, amount, jatuhTempo, status, paidAt, paidAmount, keterangan, createdAt, updatedAt) VALUES ('cmp7ckg9e0002vmi0y3dqubl0', 'inv-043', 1, 40, 3280000, '2026-03-31 17:00:00', 'paid', '2026-03-27 17:00:00', 3280000, 'Termin 1 - lunas', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO invoice_terms (id, invoiceId, terminKe, percentage, amount, jatuhTempo, status, paidAt, paidAmount, keterangan, createdAt, updatedAt) VALUES ('cmp7ckg9e0003vmi035z5z35t', 'inv-043', 2, 60, 4920000, '2026-04-17 17:00:00', 'pending', NULL, 0, 'Termin 2 - menunggu', '2026-05-15 13:05:41', '2026-05-15 13:07:20');
INSERT INTO invoice_terms (id, invoiceId, terminKe, percentage, amount, jatuhTempo, status, paidAt, paidAmount, keterangan, createdAt, updatedAt) VALUES ('cmp7ckg9e0004vmi0lgzfrin8', 'inv-044', 1, 30, 3600000, '2026-03-31 17:00:00', 'paid', '2026-03-29 17:00:00', 3600000, 'Termin 1', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO invoice_terms (id, invoiceId, terminKe, percentage, amount, jatuhTempo, status, paidAt, paidAmount, keterangan, createdAt, updatedAt) VALUES ('cmp7ckg9e0005vmi0fl86152w', 'inv-044', 2, 50, 6000000, '2026-04-14 17:00:00', 'pending', NULL, 0, 'Termin 2 - 50%', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO invoice_terms (id, invoiceId, terminKe, percentage, amount, jatuhTempo, status, paidAt, paidAmount, keterangan, createdAt, updatedAt) VALUES ('cmp7ckg9e0006vmi0y921rjaw', 'inv-044', 3, 20, 2400000, '2026-04-21 17:00:00', 'pending', NULL, 0, 'Termin 3 - pelunasan', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO invoice_terms (id, invoiceId, terminKe, percentage, amount, jatuhTempo, status, paidAt, paidAmount, keterangan, createdAt, updatedAt) VALUES ('cmp7d2fdb0000vti0rugj4fz7', 'inv-042', 3, NULL, 4166670, '2026-03-16 17:00:00', 'pending', NULL, 0, NULL, '2026-05-15 13:19:39', '2026-05-15 13:19:52');
INSERT INTO invoice_terms (id, invoiceId, terminKe, percentage, amount, jatuhTempo, status, paidAt, paidAmount, keterangan, createdAt, updatedAt) VALUES ('cmp7d5h9z0001vti083j0n6rz', 'inv-045', 2, NULL, 3750000, '2026-05-09 17:00:00', 'paid', '2026-05-15 14:40:40', 3750000, NULL, '2026-05-15 13:22:02', '2026-05-15 14:40:40');

CREATE TABLE `invoices` (
  `id` varchar(191) NOT NULL,
  `clientId` varchar(191) NOT NULL,
  `dealId` varchar(191) DEFAULT NULL,
  `nomorInvoice` varchar(191) NOT NULL,
  `namaProject` varchar(191) DEFAULT NULL,
  `nominal` double NOT NULL,
  `tanggalTerbit` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `jatuhTempo` datetime(3) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'unpaid',
  `keterangan` text DEFAULT NULL,
  `paidAmount` double DEFAULT 0,
  `createdById` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_nomorInvoice_key` (`nomorInvoice`),
  KEY `invoices_clientId_fkey` (`clientId`),
  KEY `invoices_dealId_fkey` (`dealId`),
  KEY `invoices_createdById_fkey` (`createdById`),
  CONSTRAINT `invoices_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `invoices_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoices_dealId_fkey` FOREIGN KEY (`dealId`) REFERENCES `deals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO invoices (id, clientId, dealId, nomorInvoice, namaProject, nominal, tanggalTerbit, jatuhTempo, status, keterangan, paidAmount, createdById, createdAt, updatedAt) VALUES ('inv-041', 'cl-smk-teknologi', 'deal-smk-teknologi', '#INV-041', 'Photo/Video', 15000000, '2026-02-28 17:00:00', '2026-03-31 17:00:00', 'paid', 'Lunas tepat waktu', 15000000, 'user-dewi', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO invoices (id, clientId, dealId, nomorInvoice, namaProject, nominal, tanggalTerbit, jatuhTempo, status, keterangan, paidAmount, createdById, createdAt, updatedAt) VALUES ('inv-042', 'cl-sma-cendekia', 'deal-sma-cendekia', '#INV-042', 'Yearbook 2025/26', 12500000, '2026-02-28 17:00:00', '2026-03-29 17:00:00', 'overdue', 'Menunggu acc bendahara sekolah', 6250000, 'user-riza', '2026-05-15 13:05:41', '2026-05-15 13:19:52');
INSERT INTO invoices (id, clientId, dealId, nomorInvoice, namaProject, nominal, tanggalTerbit, jatuhTempo, status, keterangan, paidAmount, createdById, createdAt, updatedAt) VALUES ('inv-043', 'cl-kopi-nusantara', 'deal-kopi-nusantara-won', '#INV-043', 'Branding', 8200000, '2026-03-19 17:00:00', '2026-04-17 17:00:00', 'partial', NULL, 3280000, 'user-bimo', '2026-05-15 13:05:41', '2026-05-15 13:07:20');
INSERT INTO invoices (id, clientId, dealId, nomorInvoice, namaProject, nominal, tanggalTerbit, jatuhTempo, status, keterangan, paidAmount, createdById, createdAt, updatedAt) VALUES ('inv-044', 'cl-pt-maju-jaya', 'deal-pt-maju-jaya-won', '#INV-044', 'Social Media Q2', 12000000, '2026-03-24 17:00:00', '2026-04-21 17:00:00', 'partial', 'Sudah bayar 50%, sisa bulan depan', 6000000, 'user-sinta', '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO invoices (id, clientId, dealId, nomorInvoice, namaProject, nominal, tanggalTerbit, jatuhTempo, status, keterangan, paidAmount, createdById, createdAt, updatedAt) VALUES ('inv-045', 'cl-smk-bintang', NULL, '#INV-045', 'Yearbook 2025/26', 7500000, '2026-04-09 17:00:00', '2026-05-09 17:00:00', 'paid', NULL, 3750000, 'user-riza', '2026-05-15 13:05:41', '2026-05-15 14:40:40');

CREATE TABLE `kpi_targets` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `bulan` varchar(191) NOT NULL,
  `targetDeals` int(11) NOT NULL DEFAULT 10,
  `targetRevenue` double NOT NULL DEFAULT 100000000,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kpi_targets_userId_bulan_key` (`userId`,`bulan`),
  CONSTRAINT `kpi_targets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lead_sources` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lead_sources_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO lead_sources (id, nama, isActive) VALUES ('src-instagram', 'Instagram', 1);
INSERT INTO lead_sources (id, nama, isActive) VALUES ('src-referral', 'Referral', 1);
INSERT INTO lead_sources (id, nama, isActive) VALUES ('src-relasi', 'Relasi Tim', 1);
INSERT INTO lead_sources (id, nama, isActive) VALUES ('src-tiktok', 'DM TikTok', 1);
INSERT INTO lead_sources (id, nama, isActive) VALUES ('src-wa', 'WA Admin', 1);

CREATE TABLE `leads` (
  `id` varchar(191) NOT NULL,
  `namaInstitusi` varchar(191) NOT NULL,
  `namaContact` varchar(191) DEFAULT NULL,
  `noHp` varchar(191) DEFAULT NULL,
  `sourceId` varchar(191) DEFAULT NULL,
  `serviceId` varchar(191) DEFAULT NULL,
  `assignedToId` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'baru',
  `tanggalMasuk` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `catatan` text DEFAULT NULL,
  `clientId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `leads_sourceId_fkey` (`sourceId`),
  KEY `leads_serviceId_fkey` (`serviceId`),
  KEY `leads_assignedToId_fkey` (`assignedToId`),
  KEY `leads_clientId_fkey` (`clientId`),
  CONSTRAINT `leads_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `leads_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `leads_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `leads_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `lead_sources` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO leads (id, namaInstitusi, namaContact, noHp, sourceId, serviceId, assignedToId, status, tanggalMasuk, catatan, clientId, createdAt, updatedAt) VALUES ('lead-klinik', 'Klinik Sehat Mandiri', 'Bu Rina', '0819-3333-4444', 'src-wa', 'svc-photo', 'user-dewi', 'dihubungi', '2026-04-16 17:00:00', NULL, NULL, '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO leads (id, namaInstitusi, namaContact, noHp, sourceId, serviceId, assignedToId, status, tanggalMasuk, catatan, clientId, createdAt, updatedAt) VALUES ('lead-sma-harapan', 'SMA Harapan Bangsa', 'Pak Ahmad', '0812-1111-2222', 'src-instagram', 'svc-yearbook', NULL, 'baru', '2026-04-16 17:00:00', NULL, NULL, '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO leads (id, namaInstitusi, namaContact, noHp, sourceId, serviceId, assignedToId, status, tanggalMasuk, catatan, clientId, createdAt, updatedAt) VALUES ('lead-smk-karya', 'SMK Karya Nusa', 'Pak Dedi', '0813-7777-8888', 'src-relasi', 'svc-yearbook', NULL, 'baru', '2026-04-14 17:00:00', NULL, NULL, '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO leads (id, namaInstitusi, namaContact, noHp, sourceId, serviceId, assignedToId, status, tanggalMasuk, catatan, clientId, createdAt, updatedAt) VALUES ('lead-startup-edtech', 'Startup EdTech XYZ', 'Mas Fajar', '0857-9999-0000', 'src-instagram', 'svc-branding', 'user-bimo', 'qualified', '2026-04-13 17:00:00', NULL, NULL, '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO leads (id, namaInstitusi, namaContact, noHp, sourceId, serviceId, assignedToId, status, tanggalMasuk, catatan, clientId, createdAt, updatedAt) VALUES ('lead-toko-fashion', 'Toko Fashion Lokal', 'Mas Kevin', '0856-5555-6666', 'src-tiktok', 'svc-sosmed', 'user-sinta', 'dihubungi', '2026-04-15 17:00:00', NULL, NULL, '2026-05-15 13:05:41', '2026-05-15 13:05:41');
INSERT INTO leads (id, namaInstitusi, namaContact, noHp, sourceId, serviceId, assignedToId, status, tanggalMasuk, catatan, clientId, createdAt, updatedAt) VALUES ('lead-warung-makan', 'Warung Makan Pak Slamet', NULL, '0821-1234-0000', 'src-wa', 'svc-photo', 'user-dewi', 'unqualified', '2026-04-12 17:00:00', NULL, NULL, '2026-05-15 13:05:41', '2026-05-15 13:05:41');

CREATE TABLE `message_logs` (
  `id` varchar(255) NOT NULL,
  `invoiceId` varchar(255) DEFAULT NULL,
  `clientId` varchar(255) DEFAULT NULL,
  `clientName` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `messageType` varchar(50) DEFAULT 'invoice',
  `status` varchar(50) DEFAULT 'sent',
  `sentAt` datetime DEFAULT current_timestamp(),
  `error` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO message_logs (id, invoiceId, clientId, clientName, phoneNumber, message, messageType, status, sentAt, error) VALUES ('cmp7nqtkw0001cxi0xob33mea', 'inv-042', 'cl-sma-cendekia', 'SMA Cendekia', '087780319183', '*INVOICE #INV-042*
─────────────────
*Project:* Yearbook 2025/26
*Klien:* SMA Cendekia
*Total:* Rp 12.500.000
*Jatuh Tempo:* 30 Maret 2026
*Status:* Jatuh Tempo

*Link Invoice:* http://localhost:3000/invoice/inv-042

Terima kasih atas kerjasamanya. 🙏

---
CreativeStudio BSD', 'invoice', 'sent', '2026-05-15 18:18:34', NULL);
INSERT INTO message_logs (id, invoiceId, clientId, clientName, phoneNumber, message, messageType, status, sentAt, error) VALUES ('cmp7pvoio0002cxi0u3a4l4wf', 'inv-042', 'cl-sma-cendekia', 'SMA Cendekia', '087780319183', '*INVOICE #INV-042*
─────────────────
*Project:* Yearbook 2025/26
*Klien:* SMA Cendekia
*Total:* Rp 12.500.000
*Jatuh Tempo:* 30 Maret 2026
*Status:* Jatuh Tempo

*Link Invoice:* http://localhost:3000/invoice/inv-042

Terima kasih atas kerjasamanya. 🙏

---
CreativeStudio BSD', 'invoice', 'sent', '2026-05-15 19:18:20', NULL);
INSERT INTO message_logs (id, invoiceId, clientId, clientName, phoneNumber, message, messageType, status, sentAt, error) VALUES ('cmpc6htcn0003pri0q2kmtvyz', 'inv-042', 'cl-sma-cendekia', 'SMA Cendekia', '087780319183', '*TERMIN 1 — #INV-042*
─────────────────
Yth. SMA Cendekia,

Pembayaran *Termin 1* untuk invoice *#INV-042*
sebesar *Rp 6.250.000* telah jatuh tempo pada *15 Maret 2026*.

Mohon segera dilakukan pembayaran.

*Link Invoice:* http://localhost:3000/invoice/inv-042

Terima kasih atas kerjasamanya. 🙏

---
CreativeOS', 'invoice', 'sent', '2026-05-18 22:14:31', NULL);
INSERT INTO message_logs (id, invoiceId, clientId, clientName, phoneNumber, message, messageType, status, sentAt, error) VALUES ('cmpc6ubru0004pri04rdewsrk', 'inv-042', 'cl-sma-cendekia', 'SMA Cendekia', '082125189383', '*TERMIN 1 — #INV-042*
─────────────────
Yth. SMA Cendekia,

Pembayaran *Termin 1* untuk invoice *#INV-042*
sebesar *Rp 6.250.000* telah jatuh tempo pada *15 Maret 2026*.

Mohon segera dilakukan pembayaran.

*Link Invoice:* http://localhost:3000/invoice/inv-042

Terima kasih atas kerjasamanya. 🙏

---
CreativeOS', 'invoice', 'sent', '2026-05-18 22:24:15', NULL);
INSERT INTO message_logs (id, invoiceId, clientId, clientName, phoneNumber, message, messageType, status, sentAt, error) VALUES ('cmpcb8pxj00005ni0k1c0lhyx', 'inv-042', 'cl-sma-cendekia', 'SMA Cendekia 1', '082125189383', '*INVOICE #INV-042*
─────────────────
*Project:* Yearbook 2025/26
*Klien:* SMA Cendekia 1
*Total:* Rp 12.500.000
*Jatuh Tempo:* 30 Maret 2026
*Status:* Jatuh Tempo
*Link Invoice:* http://localhost:3000/invoice/inv-042

Terima kasih atas kerjasamanya. 🙏

---
CreativeStudio BSD', 'invoice', 'sent', '2026-05-19 00:27:25', NULL);
INSERT INTO message_logs (id, invoiceId, clientId, clientName, phoneNumber, message, messageType, status, sentAt, error) VALUES ('cmpcbtthg00035ni0kvm6h7fa', 'inv-042', 'cl-sma-cendekia', 'SMA Cendekia 1', '082125189383', '*INVOICE #INV-042*
─────────────────
*Project:* Yearbook 2025/26
*Klien:* SMA Cendekia 1
*Total:* Rp 12.500.000
*Jatuh Tempo:* 30 Maret 2026
*Status:* Jatuh Tempo

Gunakan kode akses untuk masuk kedalam halaman invoices 
*Kode Akses:* 4RF3R4
*Link Invoice:* http://localhost:3000/invoice/inv-042

Terima kasih atas kerjasamanya. 🙏

---
CreativeStudio BSD', 'invoice', 'sent', '2026-05-19 00:43:49', NULL);
INSERT INTO message_logs (id, invoiceId, clientId, clientName, phoneNumber, message, messageType, status, sentAt, error) VALUES ('cmpcejbv70002gsi05w8p1lpd', 'inv-042', 'cl-sma-cendekia', 'SMA Cendekia 1', '082125189383', '*KONFIRMASI PEMBAYARAN TERMIN 1*
─────────────────
Yth. SMA Cendekia 1,

Pembayaran *Termin 1* untuk invoice *#INV-042*
sebesar *Rp 6.250.000* telah kami terima.

Terima kasih atas pembayarannya. 🙏

*Kode Akses:* 4RF3R4
*Link Invoice:* http://localhost:3000/invoice/inv-042

---
CreativeOS', 'payment', 'sent', '2026-05-19 01:59:39', NULL);

CREATE TABLE `pipeline_stages` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `urutan` int(11) NOT NULL,
  `probabilityDefault` int(11) NOT NULL DEFAULT 50,
  `colorHex` varchar(191) NOT NULL DEFAULT '#6B7280',
  `isTerminal` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pipeline_stages_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO pipeline_stages (id, nama, urutan, probabilityDefault, colorHex, isTerminal) VALUES ('stage-contacted', 'Contacted', 2, 40, '#3B82F6', 0);
INSERT INTO pipeline_stages (id, nama, urutan, probabilityDefault, colorHex, isTerminal) VALUES ('stage-lead', 'Lead', 1, 25, '#6B7280', 0);
INSERT INTO pipeline_stages (id, nama, urutan, probabilityDefault, colorHex, isTerminal) VALUES ('stage-lost', 'Lost', 7, 0, '#9CA3AF', 1);
INSERT INTO pipeline_stages (id, nama, urutan, probabilityDefault, colorHex, isTerminal) VALUES ('stage-meeting', 'Meeting', 4, 65, '#F59E0B', 0);
INSERT INTO pipeline_stages (id, nama, urutan, probabilityDefault, colorHex, isTerminal) VALUES ('stage-negotiation', 'Negotiation', 5, 80, '#EF4444', 0);
INSERT INTO pipeline_stages (id, nama, urutan, probabilityDefault, colorHex, isTerminal) VALUES ('stage-proposal', 'Proposal Sent', 3, 50, '#8B5CF6', 0);
INSERT INTO pipeline_stages (id, nama, urutan, probabilityDefault, colorHex, isTerminal) VALUES ('stage-won', 'Won', 6, 100, '#10B981', 1);

CREATE TABLE `services` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `deskripsi` varchar(191) DEFAULT NULL,
  `colorHex` varchar(191) NOT NULL DEFAULT '#2563EB',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `services_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO services (id, nama, deskripsi, colorHex, isActive, createdAt) VALUES ('svc-branding', 'Branding', 'Logo, brand identity, visual system', '#7C3AED', 1, '2026-05-15 13:05:40');
INSERT INTO services (id, nama, deskripsi, colorHex, isActive, createdAt) VALUES ('svc-desain', 'Desain Cetak', 'Brosur, banner, merchandise', '#94A3B8', 0, '2026-05-15 13:05:40');
INSERT INTO services (id, nama, deskripsi, colorHex, isActive, createdAt) VALUES ('svc-photo', 'Photo & Video', 'Foto produk, video profil, dokumentasi', '#D97706', 1, '2026-05-15 13:05:40');
INSERT INTO services (id, nama, deskripsi, colorHex, isActive, createdAt) VALUES ('svc-sosmed', 'Social Media Management', 'Kelola konten IG, TikTok, Facebook', '#16A34A', 1, '2026-05-15 13:05:40');
INSERT INTO services (id, nama, deskripsi, colorHex, isActive, createdAt) VALUES ('svc-yearbook', 'Yearbook', 'Produksi buku tahunan sekolah', '#2563EB', 1, '2026-05-15 13:05:40');

CREATE TABLE `system_settings` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` longtext NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmp7ckg9z0008vmi0uyyxhq2e', 'studio_name', 'CreativeStudio BSD', '2026-05-19 00:43:38');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmp7ckga10009vmi07z2oa8p5', 'wa_admin', ' 082298008994', '2026-05-19 00:43:38');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmp7ckga3000avmi0ruqaxqsd', 'email_admin', 'admin@creativestudio.id', '2026-05-19 00:43:38');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmp7ckga5000bvmi0osieibjw', 'lead_inactive_days', '7', '2026-05-19 00:43:38');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmp7ckga7000cvmi0nxwa00pq', 'fu_overdue_days', '3', '2026-05-19 00:43:38');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmp7ckga9000dvmi0j8sziy0y', 'annual_target', '500000000', '2026-05-15 13:05:41');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmp7n5fsr0000hzi0t45oydg1', 'wa_api_key', 'ZTKGBzDPY8TVrbnbnxMT', '2026-05-19 00:43:38');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmp7n5fv50001hzi0sszyqdz2', 'target_revenue_tahunan', '500000000', '2026-05-19 00:43:38');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmpcbtktl00015ni0tgc2bf89', 'wa_template_payment_confirm', '*KONFIRMASI PEMBAYARAN*
─────────────────
Yth. {{namaKlien}},

Pembayaran untuk invoice berikut telah kami terima:

*Invoice:* {{nomorInvoice}}
*Project:* {{namaProject}}
*Total:* {{nominal}}
{{kodeAkses}}{{linkInvoice}}
Terima kasih atas kepercayaannya. 🙏

---
{{namaStudio}}', '2026-05-19 00:43:38');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmpcbtktq00025ni0pfhgp3ed', 'wa_template_invoice', '*INVOICE {{nomorInvoice}}*
─────────────────
*Project:* {{namaProject}}
*Klien:* {{namaKlien}}
*Total:* {{nominal}}
*Jatuh Tempo:* {{jatuhTempo}}
*Status:* {{status}}

Gunakan kode akses untuk masuk kedalam halaman invoices 
{{kodeAkses}}{{linkInvoice}}
Terima kasih atas kerjasamanya. 🙏

---
{{namaStudio}}', '2026-05-19 00:43:38');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmpccqhy000045ni0kq6gj1qf', 'invoice_reminder_time', '08:00', '2026-05-19 01:11:11');
INSERT INTO system_settings (id, key, value, updatedAt) VALUES ('cmpccqhy300055ni0ky33ough', 'invoice_reminder_days', '[1,3,5,7,10,15]', '2026-05-19 01:11:11');

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'ae',
  `avatarInitial` varchar(191) DEFAULT NULL,
  `avatarColor` varchar(191) DEFAULT '#18181B',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (id, nama, email, password, role, avatarInitial, avatarColor, isActive, createdAt, updatedAt) VALUES ('user-bimo', 'Bimo Raharjo', 'bimo@studio.id', '$2b$10$qVhpZCVw5HzftiGVYyhIi.E6Uo7pZh8o3pbVxSycMwJa71wHgXBBG', 'ae', 'BR', '#EDE9FE', 1, '2026-05-15 13:05:40', '2026-05-15 13:05:40');
INSERT INTO users (id, nama, email, password, role, avatarInitial, avatarColor, isActive, createdAt, updatedAt) VALUES ('user-dewi', 'Dewi Lestari', 'dewi@studio.id', '$2b$10$qVhpZCVw5HzftiGVYyhIi.E6Uo7pZh8o3pbVxSycMwJa71wHgXBBG', 'ae', 'DL', '#FEE2E2', 1, '2026-05-15 13:05:40', '2026-05-15 13:05:40');
INSERT INTO users (id, nama, email, password, role, avatarInitial, avatarColor, isActive, createdAt, updatedAt) VALUES ('user-dhamar', 'Dhamar', 'dhamar@studio.id', '$2b$10$qVhpZCVw5HzftiGVYyhIi.i0omLiwl90cURa7BqL4l94Vv7b9IckC', 'manager', 'D', '#18181B', 1, '2026-05-15 13:05:40', '2026-05-15 13:05:40');
INSERT INTO users (id, nama, email, password, role, avatarInitial, avatarColor, isActive, createdAt, updatedAt) VALUES ('user-riza', 'Riza Maulana', 'riza@studio.id', '$2b$10$qVhpZCVw5HzftiGVYyhIi.E6Uo7pZh8o3pbVxSycMwJa71wHgXBBG', 'ae', 'RM', '#FEF3C7', 1, '2026-05-15 13:05:40', '2026-05-15 13:05:40');
INSERT INTO users (id, nama, email, password, role, avatarInitial, avatarColor, isActive, createdAt, updatedAt) VALUES ('user-sinta', 'Sinta Aryani', 'sinta@studio.id', '$2b$10$qVhpZCVw5HzftiGVYyhIi.E6Uo7pZh8o3pbVxSycMwJa71wHgXBBG', 'ae', 'SA', '#DCFCE7', 1, '2026-05-15 13:05:40', '2026-05-15 13:05:40');

