/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.23-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: creativeos
-- ------------------------------------------------------
-- Server version	11.8.5-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

USE salesdb;

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_types`
--

DROP TABLE IF EXISTS `activity_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_types` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `colorHex` varchar(191) NOT NULL DEFAULT '#2563EB',
  `icon` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activity_types_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_types`
--

LOCK TABLES `activity_types` WRITE;
/*!40000 ALTER TABLE `activity_types` DISABLE KEYS */;
INSERT INTO `activity_types` VALUES ('act-call','Call','#2563EB',NULL),('act-chat','Chat/WA','#16A34A',NULL),('act-followup','Follow Up','#DC2626',NULL),('act-meeting','Meeting','#7C3AED',NULL),('act-proposal','Proposal','#D97706',NULL);
/*!40000 ALTER TABLE `activity_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `provinsi` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES ('city-bsd','BSD','Banten'),('city-jakarta','Jakarta','DKI Jakarta'),('city-serpong','Serpong','Banten'),('city-tangerang','Tangerang','Banten');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_types`
--

DROP TABLE IF EXISTS `client_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_types` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_types_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_types`
--

LOCK TABLES `client_types` WRITE;
/*!40000 ALTER TABLE `client_types` DISABLE KEYS */;
INSERT INTO `client_types` VALUES ('ct-brand','Brand'),('ct-corporate','Corporate'),('ct-school','School');
/*!40000 ALTER TABLE `client_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES ('cl-kopi-nusantara','Kopi Nusantara','ct-brand','city-bsd','Bu Windi','087780319183','windi@kopinusantara.id',NULL,'svc-branding','branding','ongoing',NULL,'','user-bimo','2026-05-15 20:05:40.982','2026-05-16 01:03:10.943'),('cl-pt-maju-jaya','PT Maju Jaya','ct-corporate','city-jakarta','Pak Budi','0878-1234-5678','budi@ptmajujaya.co.id','src-referral','svc-sosmed','sosmed','ongoing',NULL,NULL,'user-sinta','2026-05-15 20:05:40.990','2026-05-15 20:05:40.990'),('cl-sma-cendekia','SMA Cendekia','ct-school','city-tangerang','Pak Hendra','087780319183','hendra@smacendekia.sch.id',NULL,'svc-yearbook','yearbook','ongoing',NULL,'','user-riza','2026-05-15 20:05:40.979','2026-05-16 01:03:33.995'),('cl-smk-alhikmah','SMK Al Hikmah','ct-school','city-tangerang','Pak Zainal','0813-5544-6677','zainal@smkalhikmah.sch.id','src-instagram','svc-yearbook','yearbook','qualified',NULL,NULL,'user-sinta','2026-05-15 20:05:40.986','2026-05-15 20:05:40.986'),('cl-smk-bintang','SMK Bintang','ct-school','city-tangerang','Pak Rudi','0813-1111-2222','rudi@smkbintang.sch.id','src-referral','svc-yearbook','yearbook','qualified',NULL,NULL,'user-riza','2026-05-15 20:05:40.994','2026-05-15 20:05:40.994'),('cl-smk-teknologi','SMK Teknologi','ct-school','city-serpong','Bu Ratna','0857-6655-4433','ratna@smkteknologi.sch.id','src-referral','svc-photo','photo','closed',NULL,NULL,'user-dewi','2026-05-15 20:05:40.992','2026-05-15 20:05:40.992');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deal_documents`
--

DROP TABLE IF EXISTS `deal_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deal_documents`
--

LOCK TABLES `deal_documents` WRITE;
/*!40000 ALTER TABLE `deal_documents` DISABLE KEYS */;
INSERT INTO `deal_documents` VALUES ('doc-brief-cendekia','deal-sma-cendekia','Brief_Yearbook_Cendekia.docx','DOC',180000,'/uploads/brief-cendekia.docx','user-riza','2026-05-15 20:05:41.221'),('doc-brief-maju','deal-pt-maju-jaya-won','Content_Brief_Maju_Jaya.docx','DOC',95000,'/uploads/brief-maju.docx','user-sinta','2026-05-15 20:05:41.226'),('doc-moodboard-kopi','deal-kopi-nusantara-won','Moodboard_Kopi_Nusantara.pdf','PDF',5600000,'/uploads/moodboard-kopi.pdf','user-bimo','2026-05-15 20:05:41.225'),('doc-mou-cendekia','deal-sma-cendekia','MOU_SMA_Cendekia_2026.pdf','PDF',245000,'/uploads/mou-sma-cendekia.pdf','user-riza','2026-05-15 20:05:41.218'),('doc-mou-kopi','deal-kopi-nusantara-won','MOU_Kopi_Nusantara.pdf','PDF',210000,'/uploads/mou-kopi.pdf','user-bimo','2026-05-15 20:05:41.223'),('doc-mou-maju','deal-pt-maju-jaya-won','MOU_PT_Maju_Jaya.pdf','PDF',310000,'/uploads/mou-maju.pdf','user-sinta','2026-05-15 20:05:41.228'),('doc-mou-teknologi','deal-smk-teknologi','MOU_SMK_Teknologi.pdf','PDF',190000,'/uploads/mou-teknologi.pdf','user-dewi','2026-05-15 20:05:41.242'),('doc-permintaan-cendekia','deal-sma-cendekia','Permintaan_Khusus_Cendekia.pdf','PDF',120000,'/uploads/permintaan-cendekia.pdf','user-riza','2026-05-15 20:05:41.219'),('doc-strategi-maju','deal-pt-maju-jaya-won','Strategi_Konten_Maju_Jaya.pdf','PDF',4200000,'/uploads/strategi-maju.pdf','user-sinta','2026-05-15 20:05:41.244');
/*!40000 ALTER TABLE `deal_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deals`
--

DROP TABLE IF EXISTS `deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deals`
--

LOCK TABLES `deals` WRITE;
/*!40000 ALTER TABLE `deals` DISABLE KEYS */;
INSERT INTO `deals` VALUES ('deal-brand-lokal','cl-smk-alhikmah','svc-branding','user-bimo','stage-lead',12000000,'Brand Identity',20,0,'2026-04-12 00:00:00.000',NULL,NULL,NULL,'active','2026-05-15 20:05:41.094','2026-05-15 20:05:41.094'),('deal-cv-kreatif','cl-kopi-nusantara','svc-branding','user-bimo','stage-meeting',15000000,NULL,55,0,'2026-03-25 00:00:00.000',NULL,NULL,NULL,'active','2026-05-15 20:05:41.114','2026-05-15 20:05:41.114'),('deal-kafe-aesthetic','cl-kopi-nusantara','svc-sosmed','user-sinta','stage-contacted',6000000,NULL,50,0,'2026-04-08 00:00:00.000',NULL,NULL,NULL,'active','2026-05-15 20:05:41.103','2026-05-15 20:05:41.103'),('deal-kopi-nusantara-won','cl-kopi-nusantara','svc-branding','user-bimo','stage-won',18000000,'Branding',100,0,'2026-02-15 00:00:00.000','2026-05-15 00:00:00.000',NULL,NULL,'won','2026-05-15 20:05:41.173','2026-05-15 20:05:41.173'),('deal-pt-agro','cl-pt-maju-jaya','svc-sosmed','user-sinta','stage-negotiation',18000000,'Social Media Q3',75,1,'2026-03-15 00:00:00.000','2026-05-01 00:00:00.000','Menunggu feedback proposal',NULL,'active','2026-05-15 20:05:41.111','2026-05-15 20:05:41.111'),('deal-pt-maju-jaya-won','cl-pt-maju-jaya','svc-sosmed','user-sinta','stage-won',24000000,'Social Media Q2',100,0,'2026-01-10 00:00:00.000','2026-06-30 00:00:00.000',NULL,NULL,'won','2026-05-15 20:05:41.175','2026-05-15 20:05:41.175'),('deal-resto-padang','cl-pt-maju-jaya','svc-photo','user-dewi','stage-lost',14000000,NULL,0,0,'2026-03-08 00:00:00.000',NULL,'Kalah kompetitor','Kalah kompetitor','lost','2026-05-15 20:05:41.181','2026-05-15 20:05:41.181'),('deal-sma-bintang','cl-sma-cendekia','svc-yearbook','user-riza','stage-meeting',35000000,'Yearbook 2025/26',65,1,'2026-03-20 00:00:00.000','2026-06-01 00:00:00.000',NULL,NULL,'active','2026-05-15 20:05:41.108','2026-05-15 20:05:41.108'),('deal-sma-cendekia','cl-sma-cendekia','svc-yearbook','user-riza','stage-won',42000000,'Yearbook 2025/26',100,0,'2026-02-01 00:00:00.000','2026-04-30 00:00:00.000','MOU - deal',NULL,'won','2026-05-15 20:05:41.171','2026-05-15 20:05:41.171'),('deal-sma-taruna','cl-sma-cendekia','svc-yearbook','user-riza','stage-contacted',32000000,'Yearbook 2025/26',40,0,'2026-04-05 00:00:00.000','2026-07-01 00:00:00.000',NULL,NULL,'active','2026-05-15 20:05:41.099','2026-05-15 20:05:41.099'),('deal-smk-alhikmah','cl-smk-alhikmah','svc-yearbook','user-sinta','stage-lead',28000000,'Yearbook 2025/26',30,0,'2026-04-10 00:00:00.000','2026-06-15 00:00:00.000',NULL,NULL,'active','2026-05-15 20:05:41.092','2026-05-15 20:05:41.092'),('deal-smk-teknologi','cl-smk-teknologi','svc-photo','user-dewi','stage-won',15000000,'Photo/Video',100,0,'2026-03-01 00:00:00.000','2026-04-08 00:00:00.000','Done',NULL,'won','2026-05-15 20:05:41.178','2026-05-15 20:05:41.178'),('deal-smp-nusantara','cl-smk-alhikmah','svc-yearbook','user-riza','stage-negotiation',24000000,'Yearbook 2025/26',80,0,'2026-03-10 00:00:00.000','2026-05-15 00:00:00.000',NULL,NULL,'active','2026-05-15 20:05:41.089','2026-05-15 20:05:41.089'),('deal-startup-fintech','cl-smk-alhikmah','svc-photo','user-dewi','stage-lead',9000000,NULL,25,0,'2026-04-14 00:00:00.000',NULL,NULL,NULL,'active','2026-05-15 20:05:41.097','2026-05-15 20:05:41.097'),('deal-toko-batik','cl-pt-maju-jaya','svc-sosmed','user-bimo','stage-proposal',8000000,NULL,50,0,'2026-04-01 00:00:00.000',NULL,NULL,NULL,'active','2026-05-15 20:05:41.106','2026-05-15 20:05:41.106'),('deal-toko-batik-lost','cl-kopi-nusantara','svc-sosmed','user-bimo','stage-lost',8000000,NULL,0,0,'2026-03-05 00:00:00.000',NULL,'Harga terlalu mahal','Harga terlalu mahal','lost','2026-05-15 20:05:41.180','2026-05-15 20:05:41.180');
/*!40000 ALTER TABLE `deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_documents`
--

DROP TABLE IF EXISTS `invoice_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_documents`
--

LOCK TABLES `invoice_documents` WRITE;
/*!40000 ALTER TABLE `invoice_documents` DISABLE KEYS */;
INSERT INTO `invoice_documents` VALUES ('cmp7gdmog0000wxi0qvhpkmoo','inv-042','sava-nasha-ananda_resume.pdf','PDF',242362,'/uploads/invoices/1778881941504-f7ckol.pdf','2026-05-15 21:52:21.520');
/*!40000 ALTER TABLE `invoice_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_term_documents`
--

DROP TABLE IF EXISTS `invoice_term_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_term_documents`
--

LOCK TABLES `invoice_term_documents` WRITE;
/*!40000 ALTER TABLE `invoice_term_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice_term_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_terms`
--

DROP TABLE IF EXISTS `invoice_terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  PRIMARY KEY (`id`),
  KEY `invoiceId` (`invoiceId`),
  CONSTRAINT `invoice_terms_ibfk_1` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_terms`
--

LOCK TABLES `invoice_terms` WRITE;
/*!40000 ALTER TABLE `invoice_terms` DISABLE KEYS */;
INSERT INTO `invoice_terms` VALUES ('cmp7ckg9e0000vmi0q9ffujum','inv-042',1,50,6250000,'2026-03-15 00:00:00','paid','2026-03-10 00:00:00',6250000,'DP 50% - lunas','2026-05-15 20:05:41','2026-05-15 20:05:41'),('cmp7ckg9e0001vmi0qsqgfb73','inv-042',2,50,6250000,'2026-03-30 00:00:00','overdue',NULL,0,'Pelunasan - belum dibayar','2026-05-15 20:05:41','2026-05-15 20:05:41'),('cmp7ckg9e0002vmi0y3dqubl0','inv-043',1,40,3280000,'2026-04-01 00:00:00','paid','2026-03-28 00:00:00',3280000,'Termin 1 - lunas','2026-05-15 20:05:41','2026-05-15 20:05:41'),('cmp7ckg9e0003vmi035z5z35t','inv-043',2,60,4920000,'2026-04-18 00:00:00','pending',NULL,0,'Termin 2 - menunggu','2026-05-15 20:05:41','2026-05-15 20:07:20'),('cmp7ckg9e0004vmi0lgzfrin8','inv-044',1,30,3600000,'2026-04-01 00:00:00','paid','2026-03-30 00:00:00',3600000,'Termin 1','2026-05-15 20:05:41','2026-05-15 20:05:41'),('cmp7ckg9e0005vmi0fl86152w','inv-044',2,50,6000000,'2026-04-15 00:00:00','pending',NULL,0,'Termin 2 - 50%','2026-05-15 20:05:41','2026-05-15 20:05:41'),('cmp7ckg9e0006vmi0y921rjaw','inv-044',3,20,2400000,'2026-04-22 00:00:00','pending',NULL,0,'Termin 3 - pelunasan','2026-05-15 20:05:41','2026-05-15 20:05:41'),('cmp7d2fdb0000vti0rugj4fz7','inv-042',3,NULL,4166670,'2026-03-17 00:00:00','pending',NULL,0,NULL,'2026-05-15 20:19:39','2026-05-15 20:19:52'),('cmp7d5h9z0001vti083j0n6rz','inv-045',2,NULL,3750000,'2026-05-10 00:00:00','paid','2026-05-15 21:40:40',3750000,NULL,'2026-05-15 20:22:02','2026-05-15 21:40:40');
/*!40000 ALTER TABLE `invoice_terms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES ('inv-041','cl-smk-teknologi','deal-smk-teknologi','#INV-041','Photo/Video',15000000,'2026-03-01 00:00:00.000','2026-04-01 00:00:00.000','paid','Lunas tepat waktu',15000000,'user-dewi','2026-05-15 20:05:41.284','2026-05-15 20:05:41.284'),('inv-042','cl-sma-cendekia','deal-sma-cendekia','#INV-042','Yearbook 2025/26',12500000,'2026-03-01 00:00:00.000','2026-03-30 00:00:00.000','overdue','Menunggu acc bendahara sekolah',6250000,'user-riza','2026-05-15 20:05:41.282','2026-05-15 20:19:52.814'),('inv-043','cl-kopi-nusantara','deal-kopi-nusantara-won','#INV-043','Branding',8200000,'2026-03-20 00:00:00.000','2026-04-18 00:00:00.000','partial',NULL,3280000,'user-bimo','2026-05-15 20:05:41.286','2026-05-15 20:07:20.543'),('inv-044','cl-pt-maju-jaya','deal-pt-maju-jaya-won','#INV-044','Social Media Q2',12000000,'2026-03-25 00:00:00.000','2026-04-22 00:00:00.000','partial','Sudah bayar 50%, sisa bulan depan',6000000,'user-sinta','2026-05-15 20:05:41.288','2026-05-15 20:05:41.288'),('inv-045','cl-smk-bintang',NULL,'#INV-045','Yearbook 2025/26',7500000,'2026-04-10 00:00:00.000','2026-05-10 00:00:00.000','paid',NULL,3750000,'user-riza','2026-05-15 20:05:41.290','2026-05-15 21:40:40.523');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kpi_targets`
--

DROP TABLE IF EXISTS `kpi_targets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kpi_targets`
--

LOCK TABLES `kpi_targets` WRITE;
/*!40000 ALTER TABLE `kpi_targets` DISABLE KEYS */;
/*!40000 ALTER TABLE `kpi_targets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_sources`
--

DROP TABLE IF EXISTS `lead_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_sources` (
  `id` varchar(191) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lead_sources_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_sources`
--

LOCK TABLES `lead_sources` WRITE;
/*!40000 ALTER TABLE `lead_sources` DISABLE KEYS */;
INSERT INTO `lead_sources` VALUES ('src-instagram','Instagram',1),('src-referral','Referral',1),('src-relasi','Relasi Tim',1),('src-tiktok','DM TikTok',1),('src-wa','WA Admin',1);
/*!40000 ALTER TABLE `lead_sources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
INSERT INTO `leads` VALUES ('lead-klinik','Klinik Sehat Mandiri','Bu Rina','0819-3333-4444','src-wa','svc-photo','user-dewi','dihubungi','2026-04-17 00:00:00.000',NULL,NULL,'2026-05-15 20:05:41.032','2026-05-15 20:05:41.032'),('lead-sma-harapan','SMA Harapan Bangsa','Pak Ahmad','0812-1111-2222','src-instagram','svc-yearbook',NULL,'baru','2026-04-17 00:00:00.000',NULL,NULL,'2026-05-15 20:05:41.030','2026-05-15 20:05:41.030'),('lead-smk-karya','SMK Karya Nusa','Pak Dedi','0813-7777-8888','src-relasi','svc-yearbook',NULL,'baru','2026-04-15 00:00:00.000',NULL,NULL,'2026-05-15 20:05:41.033','2026-05-15 20:05:41.033'),('lead-startup-edtech','Startup EdTech XYZ','Mas Fajar','0857-9999-0000','src-instagram','svc-branding','user-bimo','qualified','2026-04-14 00:00:00.000',NULL,NULL,'2026-05-15 20:05:41.035','2026-05-15 20:05:41.035'),('lead-toko-fashion','Toko Fashion Lokal','Mas Kevin','0856-5555-6666','src-tiktok','svc-sosmed','user-sinta','dihubungi','2026-04-16 00:00:00.000',NULL,NULL,'2026-05-15 20:05:41.046','2026-05-15 20:05:41.046'),('lead-warung-makan','Warung Makan Pak Slamet',NULL,'0821-1234-0000','src-wa','svc-photo','user-dewi','unqualified','2026-04-13 00:00:00.000',NULL,NULL,'2026-05-15 20:05:41.036','2026-05-15 20:05:41.036');
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_logs`
--

DROP TABLE IF EXISTS `message_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_logs`
--

LOCK TABLES `message_logs` WRITE;
/*!40000 ALTER TABLE `message_logs` DISABLE KEYS */;
INSERT INTO `message_logs` VALUES ('cmp7nqtkw0001cxi0xob33mea','inv-042','cl-sma-cendekia','SMA Cendekia','087780319183','*INVOICE #INV-042*\n─────────────────\n*Project:* Yearbook 2025/26\n*Klien:* SMA Cendekia\n*Total:* Rp 12.500.000\n*Jatuh Tempo:* 30 Maret 2026\n*Status:* Jatuh Tempo\n\n*Link Invoice:* http://localhost:3000/invoice/inv-042\n\nTerima kasih atas kerjasamanya. 🙏\n\n---\nCreativeStudio BSD','invoice','sent','2026-05-16 01:18:34',NULL);
/*!40000 ALTER TABLE `message_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pipeline_stages`
--

DROP TABLE IF EXISTS `pipeline_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pipeline_stages`
--

LOCK TABLES `pipeline_stages` WRITE;
/*!40000 ALTER TABLE `pipeline_stages` DISABLE KEYS */;
INSERT INTO `pipeline_stages` VALUES ('stage-contacted','Contacted',2,40,'#3B82F6',0),('stage-lead','Lead',1,25,'#6B7280',0),('stage-lost','Lost',7,0,'#9CA3AF',1),('stage-meeting','Meeting',4,65,'#F59E0B',0),('stage-negotiation','Negotiation',5,80,'#EF4444',0),('stage-proposal','Proposal Sent',3,50,'#8B5CF6',0),('stage-won','Won',6,100,'#10B981',1);
/*!40000 ALTER TABLE `pipeline_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES ('svc-branding','Branding','Logo, brand identity, visual system','#7C3AED',1,'2026-05-15 20:05:40.774'),('svc-desain','Desain Cetak','Brosur, banner, merchandise','#94A3B8',0,'2026-05-15 20:05:40.784'),('svc-photo','Photo & Video','Foto produk, video profil, dokumentasi','#D97706',1,'2026-05-15 20:05:40.775'),('svc-sosmed','Social Media Management','Kelola konten IG, TikTok, Facebook','#16A34A',1,'2026-05-15 20:05:40.776'),('svc-yearbook','Yearbook','Produksi buku tahunan sekolah','#2563EB',1,'2026-05-15 20:05:40.778');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('cmp7ckg9z0008vmi0uyyxhq2e','studio_name','CreativeStudio BSD','2026-05-16 01:09:34.651'),('cmp7ckga10009vmi07z2oa8p5','wa_admin','082125189383','2026-05-16 01:09:34.658'),('cmp7ckga3000avmi0ruqaxqsd','email_admin','admin@creativestudio.id','2026-05-16 01:09:34.695'),('cmp7ckga5000bvmi0osieibjw','lead_inactive_days','7','2026-05-16 01:09:34.697'),('cmp7ckga7000cvmi0nxwa00pq','fu_overdue_days','3','2026-05-16 01:09:34.695'),('cmp7ckga9000dvmi0j8sziy0y','annual_target','500000000','2026-05-15 20:05:41.361'),('cmp7n5fsr0000hzi0t45oydg1','wa_api_key','cdp4Dk9mcJfwxUDKVQVA','2026-05-16 01:09:34.649'),('cmp7n5fv50001hzi0sszyqdz2','target_revenue_tahunan','500000000','2026-05-16 01:09:34.722');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('user-bimo','Bimo Raharjo','bimo@studio.id','$2b$10$qVhpZCVw5HzftiGVYyhIi.E6Uo7pZh8o3pbVxSycMwJa71wHgXBBG','ae','BR','#EDE9FE',1,'2026-05-15 20:05:40.753','2026-05-15 20:05:40.753'),('user-dewi','Dewi Lestari','dewi@studio.id','$2b$10$qVhpZCVw5HzftiGVYyhIi.E6Uo7pZh8o3pbVxSycMwJa71wHgXBBG','ae','DL','#FEE2E2',1,'2026-05-15 20:05:40.752','2026-05-15 20:05:40.752'),('user-dhamar','Dhamar','dhamar@studio.id','$2b$10$qVhpZCVw5HzftiGVYyhIi.i0omLiwl90cURa7BqL4l94Vv7b9IckC','manager','D','#18181B',1,'2026-05-15 20:05:40.715','2026-05-15 20:05:40.715'),('user-riza','Riza Maulana','riza@studio.id','$2b$10$qVhpZCVw5HzftiGVYyhIi.E6Uo7pZh8o3pbVxSycMwJa71wHgXBBG','ae','RM','#FEF3C7',1,'2026-05-15 20:05:40.733','2026-05-15 20:05:40.733'),('user-sinta','Sinta Aryani','sinta@studio.id','$2b$10$qVhpZCVw5HzftiGVYyhIi.E6Uo7pZh8o3pbVxSycMwJa71wHgXBBG','ae','SA','#DCFCE7',1,'2026-05-15 20:05:40.741','2026-05-15 20:05:40.741');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-16  9:07:49
