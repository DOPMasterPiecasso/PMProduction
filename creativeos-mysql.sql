-- ========================================
-- CreativeOS v3 - MySQL Database Dump
-- Generated from PostgreSQL via Prisma
-- Date: 2026-05-08T03:47:03.664Z
-- ========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---- TABLE: users ----
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'ae',
  `avatarInitial` VARCHAR(10) DEFAULT NULL,
  `avatarColor` VARCHAR(50) DEFAULT '#18181B',
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `avatarInitial`, `avatarColor`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmoshl7h6000y6ki0eg0cda7p', 'Dhamar', 'owner@studio.id', '$2b$12$T7JaBZe0SF.WXi65WmPCjOzvHP2.BD/ZR.N7IDC1mIaQW5YHcK6v6', 'owner', 'D', '#18181B', 1, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `avatarInitial`, `avatarColor`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmoshl7id00146ki0z97da5v3', 'Staff Demo', 'staff@studio.id', '$2b$12$2aMHrETdiGZL47EC60gI2uJ4Lqm9X1ICAic3VEkzdnK7zi2Me4PIK', 'ae', 'ST', '#1E3A5F', 1, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `avatarInitial`, `avatarColor`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmoshl7hn000z6ki06iq2kttb', 'Dhamar', 'manager@studio.id', '$2b$12$pi2KSWc3/Fo/L/vanp.sXOY.xWBeMUPDYRio.rW9D6RcffbylzdaK', 'ae', 'D', '#18181B', 1, '2026-05-05 10:29:42', '2026-05-05 11:01:24');
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `avatarInitial`, `avatarColor`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmoshl7ht00106ki02nu6z3zb', 'Riza Maulana', 'riza@studio.id', '$2b$12$2aMHrETdiGZL47EC60gI2uJ4Lqm9X1ICAic3VEkzdnK7zi2Me4PIK', 'ae', 'RM', '#92400E', 1, '2026-05-05 10:29:42', '2026-05-05 11:04:36');
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `avatarInitial`, `avatarColor`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmoshl7hx00116ki0gr97p82u', 'Sinta Aryani', 'sinta@studio.id', '$2b$12$2aMHrETdiGZL47EC60gI2uJ4Lqm9X1ICAic3VEkzdnK7zi2Me4PIK', 'ae', 'SA', '#14532D', 1, '2026-05-05 10:29:42', '2026-05-05 11:06:41');
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `avatarInitial`, `avatarColor`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmoshl7i400126ki04i20w0a1', 'Bimo Raharjo', 'bimo@studio.id', '$2b$12$2aMHrETdiGZL47EC60gI2uJ4Lqm9X1ICAic3VEkzdnK7zi2Me4PIK', 'ae', 'BR', '#4C1D95', 1, '2026-05-05 10:29:42', '2026-05-05 11:06:44');
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `avatarInitial`, `avatarColor`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmoshl7i900136ki0ntwv0zxa', 'Dewi Lestari', 'dewi@studio.id', '$2b$12$2aMHrETdiGZL47EC60gI2uJ4Lqm9X1ICAic3VEkzdnK7zi2Me4PIK', 'manager', 'DL', '#7F1D1D', 1, '2026-05-05 10:29:42', '2026-05-05 11:08:43');

-- ---- TABLE: services ----
DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL UNIQUE,
  `deskripsi` TEXT DEFAULT NULL,
  `colorHex` VARCHAR(50) DEFAULT '#2563EB',
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `services` (`id`, `nama`, `deskripsi`, `colorHex`, `isActive`, `createdAt`) VALUES ('cmoshl6no00006ki064oa3788', 'Social Media Management', 'Kelola konten IG, TikTok, Facebook', '#16A34A', 1, '2026-05-05 10:29:40');
INSERT INTO `services` (`id`, `nama`, `deskripsi`, `colorHex`, `isActive`, `createdAt`) VALUES ('cmoshl6nq00016ki0le2es1zt', 'Yearbook', 'Produksi buku tahunan sekolah', '#2563EB', 1, '2026-05-05 10:29:40');
INSERT INTO `services` (`id`, `nama`, `deskripsi`, `colorHex`, `isActive`, `createdAt`) VALUES ('cmoshl6nq00026ki0b2vnekmb', 'Branding', 'Logo, brand identity, visual system', '#7C3AED', 1, '2026-05-05 10:29:40');
INSERT INTO `services` (`id`, `nama`, `deskripsi`, `colorHex`, `isActive`, `createdAt`) VALUES ('cmoshl6nr00036ki0j6glxsdy', 'Photo & Video', 'Foto produk, video profil, dokumentasi', '#D97706', 1, '2026-05-05 10:29:40');
INSERT INTO `services` (`id`, `nama`, `deskripsi`, `colorHex`, `isActive`, `createdAt`) VALUES ('cmoshl6nr00046ki0lmoltkit', 'Desain Cetak', 'Brosur, banner, merchandise', '#94A3B8', 0, '2026-05-05 10:29:40');

-- ---- TABLE: lead_sources ----
DROP TABLE IF EXISTS `lead_sources`;
CREATE TABLE IF NOT EXISTS `lead_sources` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL UNIQUE,
  `isActive` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lead_sources` (`id`, `nama`, `isActive`) VALUES ('cmoshl6o900056ki0ykserhlj', 'WhatsApp Admin', 1);
INSERT INTO `lead_sources` (`id`, `nama`, `isActive`) VALUES ('cmoshl6ob00066ki0a62ilskw', 'DM TikTok', 1);
INSERT INTO `lead_sources` (`id`, `nama`, `isActive`) VALUES ('cmoshl6oc00076ki0zh1es9j0', 'DM Instagram', 1);
INSERT INTO `lead_sources` (`id`, `nama`, `isActive`) VALUES ('cmoshl6of00086ki0u2orhk6v', 'Referral Klien', 1);
INSERT INTO `lead_sources` (`id`, `nama`, `isActive`) VALUES ('cmoshl6og00096ki084eq129n', 'Relasi Tim', 1);
INSERT INTO `lead_sources` (`id`, `nama`, `isActive`) VALUES ('cmoshl6ov000a6ki0nn9dqhqd', 'Website', 1);
INSERT INTO `lead_sources` (`id`, `nama`, `isActive`) VALUES ('cmoshl6ow000b6ki0ksqlwgor', 'Walk In', 1);

-- ---- TABLE: client_types ----
DROP TABLE IF EXISTS `client_types`;
CREATE TABLE IF NOT EXISTS `client_types` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `client_types` (`id`, `nama`) VALUES ('cmoshl6p8000c6ki02k1cluis', 'School');
INSERT INTO `client_types` (`id`, `nama`) VALUES ('cmoshl6p9000d6ki0z305ucl8', 'Corporate');
INSERT INTO `client_types` (`id`, `nama`) VALUES ('cmoshl6p9000e6ki0k0kp2rpz', 'Brand');
INSERT INTO `client_types` (`id`, `nama`) VALUES ('cmoshl6pa000f6ki0659sdnza', 'UMKM');
INSERT INTO `client_types` (`id`, `nama`) VALUES ('cmoshl6pb000g6ki04i7jnj8b', 'Pemerintah');

-- ---- TABLE: cities ----
DROP TABLE IF EXISTS `cities`;
CREATE TABLE IF NOT EXISTS `cities` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `provinsi` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cities` (`id`, `nama`, `provinsi`) VALUES ('city-tangerang', 'Tangerang', 'Banten');
INSERT INTO `cities` (`id`, `nama`, `provinsi`) VALUES ('city-depok', 'Depok', 'Jawa Barat');
INSERT INTO `cities` (`id`, `nama`, `provinsi`) VALUES ('city-tansel', 'Tangerang Selatan', 'Banten');
INSERT INTO `cities` (`id`, `nama`, `provinsi`) VALUES ('city-jakarta', 'Jakarta', 'DKI Jakarta');
INSERT INTO `cities` (`id`, `nama`, `provinsi`) VALUES ('city-serpong', 'Serpong', 'Banten');
INSERT INTO `cities` (`id`, `nama`, `provinsi`) VALUES ('city-bekasi', 'Bekasi', 'Jawa Barat');
INSERT INTO `cities` (`id`, `nama`, `provinsi`) VALUES ('city-bsd', 'BSD', 'Banten');
INSERT INTO `cities` (`id`, `nama`, `provinsi`) VALUES ('city-bogor', 'Bogor', 'Jawa Barat');

-- ---- TABLE: pipeline_stages ----
DROP TABLE IF EXISTS `pipeline_stages`;
CREATE TABLE IF NOT EXISTS `pipeline_stages` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL UNIQUE,
  `urutan` INT NOT NULL,
  `probabilityDefault` INT DEFAULT 50,
  `colorHex` VARCHAR(50) DEFAULT '#6B7280',
  `isTerminal` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pipeline_stages` (`id`, `nama`, `urutan`, `probabilityDefault`, `colorHex`, `isTerminal`) VALUES ('cmoshl6r6000h6ki0krp7n5jz', 'Lead', 1, 20, '#94A3B8', 0);
INSERT INTO `pipeline_stages` (`id`, `nama`, `urutan`, `probabilityDefault`, `colorHex`, `isTerminal`) VALUES ('cmoshl6r7000i6ki09w15k646', 'Proposal Sent', 3, 50, '#7C3AED', 0);
INSERT INTO `pipeline_stages` (`id`, `nama`, `urutan`, `probabilityDefault`, `colorHex`, `isTerminal`) VALUES ('cmoshl6r9000j6ki0k5p9u678', 'Won', 6, 100, '#16A34A', 1);
INSERT INTO `pipeline_stages` (`id`, `nama`, `urutan`, `probabilityDefault`, `colorHex`, `isTerminal`) VALUES ('cmoshl6r9000k6ki0w8dly69g', 'Negotiation', 5, 80, '#F97316', 0);
INSERT INTO `pipeline_stages` (`id`, `nama`, `urutan`, `probabilityDefault`, `colorHex`, `isTerminal`) VALUES ('cmoshl6ra000l6ki0ygnyclak', 'Contacted', 2, 40, '#60A5FA', 0);
INSERT INTO `pipeline_stages` (`id`, `nama`, `urutan`, `probabilityDefault`, `colorHex`, `isTerminal`) VALUES ('cmoshl6rd000m6ki09wgbw0zg', 'Lost', 7, 0, '#6B7280', 1);
INSERT INTO `pipeline_stages` (`id`, `nama`, `urutan`, `probabilityDefault`, `colorHex`, `isTerminal`) VALUES ('cmoshl6re000n6ki0nfmxm99t', 'Meeting', 4, 65, '#F59E0B', 0);

-- ---- TABLE: activity_types ----
DROP TABLE IF EXISTS `activity_types`;
CREATE TABLE IF NOT EXISTS `activity_types` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL UNIQUE,
  `colorHex` VARCHAR(50) DEFAULT '#2563EB',
  `icon` VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activity_types` (`id`, `nama`, `colorHex`, `icon`) VALUES ('cmoshl6rw000o6ki0s0exclmc', 'Chat/WA', '#16A34A', 'message-circle');
INSERT INTO `activity_types` (`id`, `nama`, `colorHex`, `icon`) VALUES ('cmoshl6rw000p6ki0podxj96t', 'Email', '#6B7280', 'mail');
INSERT INTO `activity_types` (`id`, `nama`, `colorHex`, `icon`) VALUES ('cmoshl6rx000q6ki0letr7m70', 'Proposal', '#D97706', 'file-text');
INSERT INTO `activity_types` (`id`, `nama`, `colorHex`, `icon`) VALUES ('cmoshl6rx000r6ki02jhl0sah', 'Call', '#2563EB', 'phone');
INSERT INTO `activity_types` (`id`, `nama`, `colorHex`, `icon`) VALUES ('cmoshl6rz000s6ki0k15lnm5o', 'Visit', '#7C3AED', 'map-pin');
INSERT INTO `activity_types` (`id`, `nama`, `colorHex`, `icon`) VALUES ('cmoshl6s0000t6ki0sp9rx348', 'Meeting', '#16A34A', 'users');
INSERT INTO `activity_types` (`id`, `nama`, `colorHex`, `icon`) VALUES ('ff027e91-4e17-45b9-858a-84f1766f393d', 'Follow Up', '#DC2626', 'refresh-cw');

-- ---- TABLE: system_settings ----
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  `value` TEXT NOT NULL,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `system_settings` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmoshl6sf000u6ki0dlinznsh', 'studio_name', 'CreativeOS Studio', '2026-05-05 10:29:41');
INSERT INTO `system_settings` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmoshl6sg000v6ki0ih9if063', 'currency', 'IDR', '2026-05-05 10:29:41');
INSERT INTO `system_settings` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmoshl6sg000w6ki09y5fmqff', 'target_revenue_tahunan', '500000000', '2026-05-05 10:29:41');
INSERT INTO `system_settings` (`id`, `key`, `value`, `updatedAt`) VALUES ('cmoshl6sh000x6ki0kd21ql80', 'timezone', 'Asia/Jakarta', '2026-05-05 10:29:41');

-- ---- TABLE: clients ----
DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `namaKlien` VARCHAR(255) NOT NULL,
  `clientTypeId` VARCHAR(255) DEFAULT NULL,
  `kotaId` VARCHAR(255) DEFAULT NULL,
  `namaContact` VARCHAR(255) DEFAULT NULL,
  `noHp` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `sourceId` VARCHAR(255) DEFAULT NULL,
  `serviceId` VARCHAR(255) DEFAULT NULL,
  `tags` VARCHAR(500) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'unqualified',
  `nextFuDate` DATETIME DEFAULT NULL,
  `catatan` TEXT DEFAULT NULL,
  `createdById` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_clients_status` (`status`),
  INDEX `idx_clients_service` (`serviceId`),
  INDEX `idx_clients_kota` (`kotaId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmoshl7im00156ki0kwxagjki', 'SMA Cendekia', 'cmoshl6p8000c6ki02k1cluis', 'city-tangerang', 'Pak Hendra', '0812-3456-7890', 'hendra@smacendekia.sch.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6nq00016ki0le2es1zt', 'yearbook,loyal', 'ongoing', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmoshl7is00166ki0fm8p9iqb', 'Kopi Nusantara', 'cmoshl6p9000e6ki0k0kp2rpz', 'city-bsd', 'Bu Windi', '0821-9988-7766', 'windi@kopinusantara.id', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6nq00026ki0b2vnekmb', 'branding', 'ongoing', '2026-04-15 00:00:00', NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmoshl7iv00176ki0ho28phnb', 'PT Maju Jaya', 'cmoshl6p9000d6ki0z305ucl8', 'city-jakarta', 'Pak Budi', '0878-1234-5678', 'budi@ptmajujaya.co.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6no00006ki064oa3788', 'sosmed', 'ongoing', '2026-04-20 00:00:00', NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmoshl7iz00186ki0niidn9al', 'SMK Teknologi', 'cmoshl6p8000c6ki02k1cluis', 'city-serpong', 'Bu Ratna', '0857-6655-4433', 'ratna@smkteknologi.sch.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6nr00036ki0j6glxsdy', 'photo', 'closed', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmotev34w0000v2i0px5gwjuh', 'SMA Cendekia', 'cmoshl6p8000c6ki02k1cluis', 'city-tangerang', 'Pak Hendra', '0812-3456-7890', 'hendra@smacendekia.sch.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6nq00016ki0le2es1zt', 'yearbook,loyal', 'ongoing', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmotev35r0001v2i0qom3poz2', 'Kopi Nusantara', 'cmoshl6p9000e6ki0k0kp2rpz', 'city-bsd', 'Bu Windi', '0821-9988-7766', 'windi@kopinusantara.id', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6nq00026ki0b2vnekmb', 'branding', 'ongoing', '2026-04-15 00:00:00', NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmotev3610002v2i0m3rhyjni', 'PT Maju Jaya', 'cmoshl6p9000d6ki0z305ucl8', 'city-jakarta', 'Pak Budi', '0878-1234-5678', 'budi@ptmajujaya.co.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6no00006ki064oa3788', 'sosmed', 'ongoing', '2026-04-20 00:00:00', NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmotev3690003v2i0zmeu6uiz', 'SMK Teknologi', 'cmoshl6p8000c6ki02k1cluis', 'city-serpong', 'Bu Ratna', '0857-6655-4433', 'ratna@smkteknologi.sch.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6nr00036ki0j6glxsdy', 'photo', 'closed', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('client-smk-hikmah', 'SMK Al Hikmah', 'cmoshl6p8000c6ki02k1cluis', 'city-tangerang', 'Pak Zainal', '0813-5544-6677', 'zainal@smkalhikmah.sch.id', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6nq00016ki0le2es1zt', 'yearbook', 'qualified', '2026-04-10 00:00:00', NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('client-sma-bintang', 'SMA Bintang', 'cmoshl6p8000c6ki02k1cluis', 'city-tangerang', 'Pak Rahman', '0811-2233-4455', 'rahman@smabintang.sch.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6nq00016ki0le2es1zt', 'yearbook', 'ongoing', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('client-kafe-aesthetic', 'Kafe Aesthetic', 'cmoshl6pa000f6ki0659sdnza', 'city-bsd', 'Bu Sari', '0821-5566-7788', 'sari@kafeaesthetic.id', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6no00006ki064oa3788', 'sosmed', 'qualified', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('client-cv-kreatif', 'CV Kreatif Indo', 'cmoshl6p9000d6ki0z305ucl8', 'city-jakarta', 'Pak Anton', '0857-3344-5566', 'anton@cvkreatifindo.co.id', 'cmoshl6og00096ki084eq129n', 'cmoshl6nq00026ki0b2vnekmb', 'branding', 'qualified', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('client-pt-agro', 'PT Agro Makmur', 'cmoshl6p9000d6ki0z305ucl8', 'city-jakarta', 'Bu Dewi', '0878-9900-1122', 'dewi@ptagromakmur.co.id', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6no00006ki064oa3788', 'sosmed', 'ongoing', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('client-smp-nusantara', 'SMP Nusantara', 'cmoshl6p8000c6ki02k1cluis', 'city-tangerang', 'Pak Heri', '0812-6677-8899', 'heri@smpnusantara.sch.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6nq00016ki0le2es1zt', 'yearbook', 'ongoing', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('client-toko-batik', 'Toko Batik XYZ', 'cmoshl6pa000f6ki0659sdnza', 'city-jakarta', 'Bu Laras', '0856-1122-3344', 'laras@tokobatik.com', 'cmoshl6o900056ki0ykserhlj', 'cmoshl6no00006ki064oa3788', 'sosmed', 'unqualified', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('client-resto-padang', 'Restaurant Padang', 'cmoshl6pa000f6ki0659sdnza', 'city-jakarta', 'Pak Rizal', '0821-9988-0011', 'rizal@restopadang.com', 'cmoshl6o900056ki0ykserhlj', 'cmoshl6nr00036ki0j6glxsdy', 'photo', 'unqualified', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmotevzvv0000wvi0nyl06637', 'SMA Cendekia', 'cmoshl6p8000c6ki02k1cluis', 'city-tangerang', 'Pak Hendra', '0812-3456-7890', 'hendra@smacendekia.sch.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6nq00016ki0le2es1zt', 'yearbook,loyal', 'ongoing', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmotevzwi0001wvi0i0dggv2w', 'Kopi Nusantara', 'cmoshl6p9000e6ki0k0kp2rpz', 'city-bsd', 'Bu Windi', '0821-9988-7766', 'windi@kopinusantara.id', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6nq00026ki0b2vnekmb', 'branding', 'ongoing', '2026-04-15 00:00:00', NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmotevzwq0002wvi003ikyldp', 'PT Maju Jaya', 'cmoshl6p9000d6ki0z305ucl8', 'city-jakarta', 'Pak Budi', '0878-1234-5678', 'budi@ptmajujaya.co.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6no00006ki064oa3788', 'sosmed', 'ongoing', '2026-04-20 00:00:00', NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `clients` (`id`, `namaKlien`, `clientTypeId`, `kotaId`, `namaContact`, `noHp`, `email`, `sourceId`, `serviceId`, `tags`, `status`, `nextFuDate`, `catatan`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmotevzwx0003wvi0fo7y14sp', 'SMK Teknologi', 'cmoshl6p8000c6ki02k1cluis', 'city-serpong', 'Bu Ratna', '0857-6655-4433', 'ratna@smkteknologi.sch.id', 'cmoshl6of00086ki0u2orhk6v', 'cmoshl6nr00036ki0j6glxsdy', 'photo', 'closed', NULL, NULL, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-06 02:01:52', '2026-05-06 02:01:52');

-- ---- TABLE: leads ----
DROP TABLE IF EXISTS `leads`;
CREATE TABLE IF NOT EXISTS `leads` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `namaInstitusi` VARCHAR(255) NOT NULL,
  `namaContact` VARCHAR(255) DEFAULT NULL,
  `noHp` VARCHAR(100) DEFAULT NULL,
  `sourceId` VARCHAR(255) DEFAULT NULL,
  `serviceId` VARCHAR(255) DEFAULT NULL,
  `assignedToId` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'baru',
  `tanggalMasuk` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `catatan` TEXT DEFAULT NULL,
  `clientId` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_leads_status` (`status`),
  INDEX `idx_leads_assigned` (`assignedToId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmoshl7kk001i6ki01lxzuaqo', 'Klinik Sehat Mandiri', 'Bu Rina', '0819-3333-4444', 'cmoshl6o900056ki0ykserhlj', 'cmoshl6nr00036ki0j6glxsdy', 'cmoshl7i900136ki0ntwv0zxa', 'dihubungi', '2026-05-05 10:29:42', NULL, NULL, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmoshl7km001m6ki0eibamjc8', 'Warung Makan Pak Slamet', NULL, '0821-1234-0000', 'cmoshl6o900056ki0ykserhlj', 'cmoshl6nr00036ki0j6glxsdy', 'cmoshl7i900136ki0ntwv0zxa', 'unqualified', '2026-05-05 10:29:42', NULL, NULL, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmoshl7kj001h6ki0v3fpr3pj', 'SMA Harapan Bangsa', 'Pak Ahmad', '0812-1111-2222', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6nq00016ki0le2es1zt', NULL, 'baru', '2026-05-05 10:29:42', NULL, NULL, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmoshl7kk001j6ki0baw70q5h', 'Toko Fashion Lokal', 'Mas Kevin', '0856-5555-6666', 'cmoshl6ob00066ki0a62ilskw', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'dihubungi', '2026-05-05 10:29:42', NULL, NULL, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmotew04v000nwvi0jb58rn5o', 'Warung Makan Pak Slamet', NULL, '0821-1234-0000', 'cmoshl6o900056ki0ykserhlj', 'cmoshl6nr00036ki0j6glxsdy', 'cmoshl7i900136ki0ntwv0zxa', 'unqualified', '2026-05-06 02:01:53', NULL, NULL, '2026-05-06 02:01:53', '2026-05-06 02:01:53');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmow7cts2000004i0xvxaig7l', 'Sma Budhi Dharma 22', 'Bapak Kirun', '081213123892138', 'cmoshl6ob00066ki0a62ilskw', 'cmoshl6no00006ki064oa3788', 'cmoshl7id00146ki0z97da5v3', 'dihubungi', '2026-05-08 00:54:19', 'asldsajd awdlwad awd', NULL, '2026-05-08 00:54:19', '2026-05-08 00:54:37');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmotew04t000jwvi01jkg0hog', 'Klinik Sehat Mandiri', 'Bu Rina', '0819-3333-4444', 'cmoshl6o900056ki0ykserhlj', 'cmoshl6nr00036ki0j6glxsdy', 'cmoshl7i900136ki0ntwv0zxa', 'dihubungi', '2026-05-06 02:01:53', NULL, NULL, '2026-05-06 02:01:53', '2026-05-06 02:01:53');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmotew04s000iwvi0inmth2z4', 'SMA Harapan Bangsa', 'Pak Ahmad', '0812-1111-2222', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6nq00016ki0le2es1zt', NULL, 'baru', '2026-05-06 02:01:53', NULL, NULL, '2026-05-06 02:01:53', '2026-05-06 02:01:53');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmotew04u000mwvi0f161y9q2', 'Startup EdTech XYZ', 'Mas Fajar', '0857-9999-0000', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6nq00026ki0b2vnekmb', 'cmoshl7i400126ki04i20w0a1', 'qualified', '2026-05-06 02:01:53', NULL, NULL, '2026-05-06 02:01:53', '2026-05-06 02:01:53');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmotew04t000kwvi0ugyisd01', 'Toko Fashion Lokal', 'Mas Kevin', '0856-5555-6666', 'cmoshl6ob00066ki0a62ilskw', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'dihubungi', '2026-05-06 02:01:53', NULL, NULL, '2026-05-06 02:01:53', '2026-05-06 02:01:53');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmotew04u000lwvi01ftqw5rq', 'SMK Karya Nusa', 'Pak Dedi', '0813-7777-8888', 'cmoshl6og00096ki084eq129n', 'cmoshl6nq00016ki0le2es1zt', NULL, 'baru', '2026-05-06 02:01:53', NULL, NULL, '2026-05-06 02:01:53', '2026-05-06 02:01:53');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmoshl7kk001k6ki0zryd55uf', 'SMK Karya Nusa', 'Pak Dedi', '0813-7777-8888', 'cmoshl6og00096ki084eq129n', 'cmoshl6nq00016ki0le2es1zt', NULL, 'baru', '2026-05-05 10:29:42', NULL, NULL, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `leads` (`id`, `namaInstitusi`, `namaContact`, `noHp`, `sourceId`, `serviceId`, `assignedToId`, `status`, `tanggalMasuk`, `catatan`, `clientId`, `createdAt`, `updatedAt`) VALUES ('cmoshl7kl001l6ki0tck7l692', 'Startup EdTech XYZ', 'Mas Fajar', '0857-9999-0000', 'cmoshl6oc00076ki0zh1es9j0', 'cmoshl6nq00026ki0b2vnekmb', 'cmoshl7i400126ki04i20w0a1', 'qualified', '2026-05-05 10:29:42', NULL, NULL, '2026-05-05 10:29:42', '2026-05-05 10:29:42');

-- ---- TABLE: deals ----
DROP TABLE IF EXISTS `deals`;
CREATE TABLE IF NOT EXISTS `deals` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `clientId` VARCHAR(255) NOT NULL,
  `serviceId` VARCHAR(255) DEFAULT NULL,
  `assignedAeId` VARCHAR(255) DEFAULT NULL,
  `stageId` VARCHAR(255) DEFAULT NULL,
  `nilai` DOUBLE DEFAULT 0,
  `namaProject` VARCHAR(255) DEFAULT NULL,
  `probability` INT DEFAULT 50,
  `isHot` TINYINT(1) DEFAULT 0,
  `tanggalMasuk` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `deadline` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `lostReason` VARCHAR(500) DEFAULT NULL,
  `dealStatus` VARCHAR(50) DEFAULT 'active',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_deals_client` (`clientId`),
  INDEX `idx_deals_stage` (`stageId`),
  INDEX `idx_deals_status` (`dealStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmoshl7j600196ki0orywhboi', 'cmoshl7im00156ki0kwxagjki', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6r9000j6ki0k5p9u678', 42000000, NULL, 100, 0, '2026-01-15 00:00:00', '2026-04-30 00:00:00', NULL, NULL, 'won', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmoshl7jc001a6ki03o5uhage', 'cmoshl7is00166ki0fm8p9iqb', 'cmoshl6nq00026ki0b2vnekmb', 'cmoshl7i400126ki04i20w0a1', 'cmoshl6r9000j6ki0k5p9u678', 18000000, NULL, 100, 0, '2026-05-05 10:29:42', NULL, NULL, NULL, 'won', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmoshl7ji001b6ki0l32e1vul', 'cmoshl7iv00176ki0ho28phnb', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6r9000k6ki0w8dly69g', 24000000, NULL, 80, 1, '2026-05-05 10:29:42', NULL, NULL, NULL, 'active', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmoshl7jn001c6ki0stbd4ebe', 'cmoshl7iz00186ki0niidn9al', 'cmoshl6nr00036ki0j6glxsdy', 'cmoshl7i900136ki0ntwv0zxa', 'cmoshl6r9000j6ki0k5p9u678', 15000000, NULL, 100, 0, '2026-05-05 10:29:42', NULL, NULL, NULL, 'won', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3ae0004v2i09tnwpyih', 'cmotev34w0000v2i0px5gwjuh', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6r9000j6ki0k5p9u678', 42000000, NULL, 100, 0, '2026-01-15 00:00:00', '2026-04-30 00:00:00', NULL, NULL, 'won', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3aq0005v2i00pl8e0ib', 'cmotev35r0001v2i0qom3poz2', 'cmoshl6nq00026ki0b2vnekmb', 'cmoshl7i400126ki04i20w0a1', 'cmoshl6r9000j6ki0k5p9u678', 18000000, NULL, 100, 0, '2026-05-06 02:01:10', NULL, NULL, NULL, 'won', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3aw0006v2i0yuu2w6hl', 'cmotev3610002v2i0m3rhyjni', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6r9000j6ki0k5p9u678', 24000000, NULL, 100, 0, '2026-05-06 02:01:10', NULL, NULL, NULL, 'won', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3b30007v2i04fiuj31q', 'cmotev3690003v2i0zmeu6uiz', 'cmoshl6nr00036ki0j6glxsdy', 'cmoshl7i900136ki0ntwv0zxa', 'cmoshl6r9000j6ki0k5p9u678', 15000000, NULL, 100, 0, '2026-05-06 02:01:10', NULL, NULL, NULL, 'won', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3b90008v2i0z1w4067b', 'client-smk-hikmah', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6r6000h6ki0krp7n5jz', 28000000, NULL, 20, 0, '2026-05-06 02:01:10', NULL, NULL, NULL, 'active', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3bh0009v2i02pvma618', 'client-sma-bintang', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6re000n6ki0nfmxm99t', 35000000, NULL, 65, 1, '2026-05-06 02:01:10', NULL, NULL, NULL, 'active', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3bo000av2i0ftp4ejgc', 'client-kafe-aesthetic', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6ra000l6ki0ygnyclak', 6000000, NULL, 40, 0, '2026-05-06 02:01:10', NULL, NULL, NULL, 'active', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3bu000bv2i0bymeuv8u', 'client-cv-kreatif', 'cmoshl6nq00026ki0b2vnekmb', 'cmoshl7i400126ki04i20w0a1', 'cmoshl6re000n6ki0nfmxm99t', 15000000, NULL, 55, 0, '2026-05-06 02:01:10', NULL, NULL, NULL, 'active', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3bz000cv2i02c9ykdop', 'client-pt-agro', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6r9000k6ki0w8dly69g', 18000000, NULL, 75, 1, '2026-05-06 02:01:10', NULL, NULL, NULL, 'active', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3c5000dv2i0sl96nzfd', 'client-smp-nusantara', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6r9000k6ki0w8dly69g', 24000000, NULL, 80, 1, '2026-05-06 02:01:10', NULL, NULL, NULL, 'active', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3cd000ev2i0jtm36h0m', 'client-toko-batik', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6rd000m6ki09wgbw0zg', 8000000, NULL, 0, 0, '2026-05-06 02:01:10', NULL, NULL, 'Harga terlalu mahal', 'lost', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3cj000fv2i0cwprvo8h', 'client-resto-padang', 'cmoshl6nr00036ki0j6glxsdy', 'cmoshl7i900136ki0ntwv0zxa', 'cmoshl6rd000m6ki09wgbw0zg', 14000000, NULL, 0, 0, '2026-05-06 02:01:10', NULL, NULL, 'Kalah kompetitor', 'lost', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3cv000hv2i0em4fhi20', 'cmotev3610002v2i0m3rhyjni', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6ra000l6ki0ygnyclak', 32000000, NULL, 40, 0, '2026-05-06 02:01:10', NULL, NULL, NULL, 'active', '2026-05-06 02:01:10', '2026-05-06 02:01:10');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew00j0004wvi0xdkxvgz5', 'cmotevzvv0000wvi0nyl06637', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6r9000j6ki0k5p9u678', 42000000, NULL, 100, 0, '2026-01-15 00:00:00', '2026-04-30 00:00:00', NULL, NULL, 'won', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew0180005wvi0jxfmvzdi', 'cmotevzwi0001wvi0i0dggv2w', 'cmoshl6nq00026ki0b2vnekmb', 'cmoshl7i400126ki04i20w0a1', 'cmoshl6r9000j6ki0k5p9u678', 18000000, NULL, 100, 0, '2026-05-06 02:01:52', NULL, NULL, NULL, 'won', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew01f0006wvi0ywi9gi3e', 'cmotevzwq0002wvi003ikyldp', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6r9000j6ki0k5p9u678', 24000000, NULL, 100, 0, '2026-05-06 02:01:52', NULL, NULL, NULL, 'won', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew01m0007wvi058zuyr71', 'cmotevzwx0003wvi0fo7y14sp', 'cmoshl6nr00036ki0j6glxsdy', 'cmoshl7i900136ki0ntwv0zxa', 'cmoshl6r9000j6ki0k5p9u678', 15000000, NULL, 100, 0, '2026-05-06 02:01:52', NULL, NULL, NULL, 'won', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew01t0008wvi0win6nxa7', 'client-smk-hikmah', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6r6000h6ki0krp7n5jz', 28000000, NULL, 20, 0, '2026-05-06 02:01:52', NULL, NULL, NULL, 'active', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew0220009wvi0cngd5a2n', 'client-sma-bintang', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6re000n6ki0nfmxm99t', 35000000, NULL, 65, 1, '2026-05-06 02:01:52', NULL, NULL, NULL, 'active', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew029000awvi046bqheih', 'client-kafe-aesthetic', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6ra000l6ki0ygnyclak', 6000000, NULL, 40, 0, '2026-05-06 02:01:52', NULL, NULL, NULL, 'active', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew02e000bwvi09hufms0i', 'client-cv-kreatif', 'cmoshl6nq00026ki0b2vnekmb', 'cmoshl7i400126ki04i20w0a1', 'cmoshl6re000n6ki0nfmxm99t', 15000000, NULL, 55, 0, '2026-05-06 02:01:52', NULL, NULL, NULL, 'active', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew02k000cwvi0b2y6idye', 'client-pt-agro', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6r9000k6ki0w8dly69g', 18000000, NULL, 75, 1, '2026-05-06 02:01:52', NULL, NULL, NULL, 'active', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew02q000dwvi06hlweef4', 'client-smp-nusantara', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6r9000k6ki0w8dly69g', 24000000, NULL, 80, 1, '2026-05-06 02:01:52', NULL, NULL, NULL, 'active', '2026-05-06 02:01:52', '2026-05-06 02:01:52');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew02z000ewvi0fv2z0y9k', 'client-toko-batik', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6rd000m6ki09wgbw0zg', 8000000, NULL, 0, 0, '2026-05-06 02:01:53', NULL, NULL, 'Harga terlalu mahal', 'lost', '2026-05-06 02:01:53', '2026-05-06 02:01:53');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew034000fwvi036dvpir1', 'client-resto-padang', 'cmoshl6nr00036ki0j6glxsdy', 'cmoshl7i900136ki0ntwv0zxa', 'cmoshl6rd000m6ki09wgbw0zg', 14000000, NULL, 0, 0, '2026-05-06 02:01:53', NULL, NULL, 'Kalah kompetitor', 'lost', '2026-05-06 02:01:53', '2026-05-06 02:01:53');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew03j000hwvi0gg29tjix', 'cmotevzwq0002wvi003ikyldp', 'cmoshl6no00006ki064oa3788', 'cmoshl7hx00116ki0gr97p82u', 'cmoshl6r7000i6ki09w15k646', 32000000, NULL, 50, 0, '2026-05-06 02:01:53', NULL, NULL, NULL, 'active', '2026-05-06 02:01:53', '2026-05-06 02:02:22');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotev3cp000gv2i0ysghw4bo', 'cmotev34w0000v2i0px5gwjuh', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6ra000l6ki0ygnyclak', 11000000, NULL, 40, 0, '2026-05-06 02:01:10', NULL, NULL, NULL, 'active', '2026-05-06 02:01:10', '2026-05-06 03:47:21');
INSERT INTO `deals` (`id`, `clientId`, `serviceId`, `assignedAeId`, `stageId`, `nilai`, `namaProject`, `probability`, `isHot`, `tanggalMasuk`, `deadline`, `notes`, `lostReason`, `dealStatus`, `createdAt`, `updatedAt`) VALUES ('cmotew03a000gwvi0xfag2m5k', 'cmotevzvv0000wvi0nyl06637', 'cmoshl6nq00016ki0le2es1zt', 'cmoshl7ht00106ki02nu6z3zb', 'cmoshl6r6000h6ki0krp7n5jz', 11000000, NULL, 20, 0, '2026-05-06 02:01:53', NULL, NULL, NULL, 'active', '2026-05-06 02:01:53', '2026-05-07 05:14:37');

-- ---- TABLE: deal_documents ----
DROP TABLE IF EXISTS `deal_documents`;
CREATE TABLE IF NOT EXISTS `deal_documents` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `dealId` VARCHAR(255) NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `fileType` VARCHAR(50) DEFAULT NULL,
  `fileSizeBytes` INT DEFAULT NULL,
  `fileUrl` VARCHAR(500) DEFAULT NULL,
  `uploadedById` VARCHAR(255) DEFAULT NULL,
  `uploadedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_docs_deal` (`dealId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `deal_documents` (`id`, `dealId`, `fileName`, `fileType`, `fileSizeBytes`, `fileUrl`, `uploadedById`, `uploadedAt`) VALUES ('cmov17jdg0000wni06c6hpcc1', 'cmotew03a000gwvi0xfag2m5k', 'Screenshot from 2026-05-06 14-42-12.png', 'PNG', 222096, '/uploads/deals/1778130868928-Screenshot_from_2026-05-06_14-42-12.png', NULL, '2026-05-07 05:14:28');
INSERT INTO `deal_documents` (`id`, `dealId`, `fileName`, `fileType`, `fileSizeBytes`, `fileUrl`, `uploadedById`, `uploadedAt`) VALUES ('cmow8tv5l000304i011mu6jtf', 'cmotew03a000gwvi0xfag2m5k', 'Screenshot from 2026-05-07 17-14-01.png', 'PNG', 703748, '/uploads/deals/1778204134122-Screenshot_from_2026-05-07_17-14-01.png', NULL, '2026-05-08 01:35:34');
INSERT INTO `deal_documents` (`id`, `dealId`, `fileName`, `fileType`, `fileSizeBytes`, `fileUrl`, `uploadedById`, `uploadedAt`) VALUES ('cmow8u5fo000404i0xketdisk', 'cmotew03j000hwvi0gg29tjix', 'Screenshot from 2026-05-07 17-03-33.png', 'PNG', 1050931, '/uploads/deals/1778204147444-Screenshot_from_2026-05-07_17-03-33.png', NULL, '2026-05-08 01:35:47');
INSERT INTO `deal_documents` (`id`, `dealId`, `fileName`, `fileType`, `fileSizeBytes`, `fileUrl`, `uploadedById`, `uploadedAt`) VALUES ('cmow8vlln000504i0ls27yb4s', 'cmotew03j000hwvi0gg29tjix', 'Screenshot from 2026-05-07 16-05-36.png', 'PNG', 1203305, '/uploads/deals/1778204215042-Screenshot_from_2026-05-07_16-05-36.png', NULL, '2026-05-08 01:36:55');
INSERT INTO `deal_documents` (`id`, `dealId`, `fileName`, `fileType`, `fileSizeBytes`, `fileUrl`, `uploadedById`, `uploadedAt`) VALUES ('cmow8x32d000604i0rcl8mqwt', 'cmotew03j000hwvi0gg29tjix', 'Screenshot from 2026-05-07 17-22-29.png', 'PNG', 1140316, '/uploads/deals/1778204284326-Screenshot_from_2026-05-07_17-22-29.png', NULL, '2026-05-08 01:38:04');
INSERT INTO `deal_documents` (`id`, `dealId`, `fileName`, `fileType`, `fileSizeBytes`, `fileUrl`, `uploadedById`, `uploadedAt`) VALUES ('cmow9n1k3000704i0cqq5cb8h', 'cmotew03a000gwvi0xfag2m5k', 'Screenshot from 2026-05-07 15-12-41.png', 'PNG', 1585329, '/uploads/deals/1778205495433-Screenshot_from_2026-05-07_15-12-41.png', NULL, '2026-05-08 01:58:15');

-- ---- TABLE: activities ----
DROP TABLE IF EXISTS `activities`;
CREATE TABLE IF NOT EXISTS `activities` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `dealId` VARCHAR(255) DEFAULT NULL,
  `clientId` VARCHAR(255) DEFAULT NULL,
  `typeId` VARCHAR(255) DEFAULT NULL,
  `picId` VARCHAR(255) DEFAULT NULL,
  `tanggalAktivitas` DATETIME NOT NULL,
  `catatan` TEXT DEFAULT NULL,
  `nextAction` VARCHAR(500) DEFAULT NULL,
  `nextActionDate` DATETIME DEFAULT NULL,
  `isDone` TINYINT(1) DEFAULT 0,
  `fileUrl` VARCHAR(500) DEFAULT NULL,
  `fileName` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_act_client` (`clientId`),
  INDEX `idx_act_pic` (`picId`),
  INDEX `idx_act_type` (`typeId`),
  INDEX `idx_act_tanggal` (`tanggalAktivitas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activities` (`id`, `dealId`, `clientId`, `typeId`, `picId`, `tanggalAktivitas`, `catatan`, `nextAction`, `nextActionDate`, `isDone`, `fileUrl`, `fileName`, `createdAt`, `updatedAt`) VALUES ('cmow7l97n000104i02o740dst', NULL, 'client-kafe-aesthetic', 'cmoshl6rw000o6ki0s0exclmc', 'cmoshl7i900136ki0ntwv0zxa', '2026-05-08 00:00:00', 'hkhjhk', 'jkh', '2026-05-07 00:00:00', 0, NULL, NULL, '2026-05-08 01:00:52', '2026-05-08 01:00:52');

-- ---- TABLE: invoices ----
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `clientId` VARCHAR(255) NOT NULL,
  `dealId` VARCHAR(255) DEFAULT NULL,
  `nomorInvoice` VARCHAR(100) NOT NULL UNIQUE,
  `namaProject` VARCHAR(255) DEFAULT NULL,
  `nominal` DOUBLE NOT NULL,
  `tanggalTerbit` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `jatuhTempo` DATETIME NOT NULL,
  `status` VARCHAR(50) DEFAULT 'unpaid',
  `keterangan` TEXT DEFAULT NULL,
  `paidAmount` DOUBLE DEFAULT 0,
  `createdById` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_inv_client` (`clientId`),
  INDEX `idx_inv_status` (`status`),
  INDEX `idx_inv_jatuh` (`jatuhTempo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `invoices` (`id`, `clientId`, `dealId`, `nomorInvoice`, `namaProject`, `nominal`, `tanggalTerbit`, `jatuhTempo`, `status`, `keterangan`, `paidAmount`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmoshl7jv001e6ki0r4erdc3y', 'cmoshl7is00166ki0fm8p9iqb', 'cmoshl7jc001a6ki03o5uhage', '#INV-043', 'Branding', 8200000, '2026-05-05 10:29:42', '2026-04-18 00:00:00', 'unpaid', NULL, 0, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `invoices` (`id`, `clientId`, `dealId`, `nomorInvoice`, `namaProject`, `nominal`, `tanggalTerbit`, `jatuhTempo`, `status`, `keterangan`, `paidAmount`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmoshl7jz001g6ki0n05smerh', 'cmoshl7iz00186ki0niidn9al', 'cmoshl7jn001c6ki0stbd4ebe', '#INV-041', 'Photo/Video', 15000000, '2026-05-05 10:29:42', '2026-04-01 00:00:00', 'paid', 'Lunas tepat waktu', 15000000, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `invoices` (`id`, `clientId`, `dealId`, `nomorInvoice`, `namaProject`, `nominal`, `tanggalTerbit`, `jatuhTempo`, `status`, `keterangan`, `paidAmount`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmoshl7jx001f6ki0lcwos2t9', 'cmoshl7iv00176ki0ho28phnb', 'cmoshl7ji001b6ki0l32e1vul', '#INV-044', 'Social Media Q2', 6000000, '2026-05-05 10:29:42', '2026-04-22 00:00:00', 'partial', 'Sudah bayar 50%', 3000000, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `invoices` (`id`, `clientId`, `dealId`, `nomorInvoice`, `namaProject`, `nominal`, `tanggalTerbit`, `jatuhTempo`, `status`, `keterangan`, `paidAmount`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmowa24vr000804i0kg552hc5', 'cmotevzvv0000wvi0nyl06637', 'cmotew03a000gwvi0xfag2m5k', '#INV-005', 'Yearbook - SMA Cendekia', 21367123, '2026-05-08 02:09:59', '2026-05-08 00:00:00', 'unpaid', 'asdqwe', 0, NULL, '2026-05-08 02:09:59', '2026-05-08 02:09:59');
INSERT INTO `invoices` (`id`, `clientId`, `dealId`, `nomorInvoice`, `namaProject`, `nominal`, `tanggalTerbit`, `jatuhTempo`, `status`, `keterangan`, `paidAmount`, `createdById`, `createdAt`, `updatedAt`) VALUES ('cmoshl7jt001d6ki0tujh3ql3', 'cmoshl7im00156ki0kwxagjki', 'cmoshl7j600196ki0orywhboi', '#INV-042', 'Yearbook 2025/26', 12500000, '2026-05-05 10:29:42', '2026-03-30 00:00:00', 'paid', 'Menunggu acc bendahara', 12500000, 'cmoshl7h6000y6ki0eg0cda7p', '2026-05-05 10:29:42', '2026-05-08 02:10:07');

-- ---- TABLE: kpi_targets ----
DROP TABLE IF EXISTS `kpi_targets`;
CREATE TABLE IF NOT EXISTS `kpi_targets` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(255) NOT NULL,
  `bulan` VARCHAR(7) NOT NULL,
  `targetDeals` INT DEFAULT 10,
  `targetRevenue` DOUBLE DEFAULT 100000000,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_bulan` (`userId`, `bulan`),
  INDEX `idx_kpi_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kpi_targets` (`id`, `userId`, `bulan`, `targetDeals`, `targetRevenue`, `createdAt`, `updatedAt`) VALUES ('cmoshl7l5001n6ki02fbcj06e', 'cmoshl7i900136ki0ntwv0zxa', '2026-05', 5, 60000000, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `kpi_targets` (`id`, `userId`, `bulan`, `targetDeals`, `targetRevenue`, `createdAt`, `updatedAt`) VALUES ('cmoshl7l6001o6ki0vbfwufzp', 'cmoshl7ht00106ki02nu6z3zb', '2026-05', 10, 150000000, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `kpi_targets` (`id`, `userId`, `bulan`, `targetDeals`, `targetRevenue`, `createdAt`, `updatedAt`) VALUES ('cmoshl7l8001p6ki0zpei498n', 'cmoshl7hx00116ki0gr97p82u', '2026-05', 8, 120000000, '2026-05-05 10:29:42', '2026-05-05 10:29:42');
INSERT INTO `kpi_targets` (`id`, `userId`, `bulan`, `targetDeals`, `targetRevenue`, `createdAt`, `updatedAt`) VALUES ('cmoshl7l9001q6ki0ubx3unl2', 'cmoshl7i400126ki04i20w0a1', '2026-05', 6, 80000000, '2026-05-05 10:29:42', '2026-05-05 10:29:42');

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- Dump complete
-- ========================================
