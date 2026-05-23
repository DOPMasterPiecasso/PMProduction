-- ===============================================================
-- CREATIVEOS v3 — Master Tables + Seed Data
-- Tabel: lead_sources, activity_types, cities
-- ===============================================================
-- Cara pakai:
--   mysql -u user -p database_name < master-tables.sql
-- atau copy-paste di phpMyAdmin / MariaDB
-- ===============================================================

-- ─── LEAD SOURCES (Sumber Lead) ──────────────────────────────
CREATE TABLE IF NOT EXISTS `lead_sources` (
  `id`       VARCHAR(191) NOT NULL,
  `nama`     VARCHAR(191) NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lead_sources_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `lead_sources` (`id`, `nama`, `isActive`) VALUES
('src_whatsapp',   'WhatsApp Admin',              1),
('src_ig_dm',      'DM Instagram',                1),
('src_tiktok_dm',  'DM TikTok',                   1),
('src_referral',   'Referral / Rekomendasi',       1),
('src_website',    'Website / Landing Page',       1),
('src_email',      'Email Marketing',              1),
('src_event',      'Event / Pameran',              1),
('src_tele',       'Telemarketing',                1),
('src_walkin',     'Walk-in / Datang Langsung',    1),
('src_lain',       'Lainnya',                      1);

-- ─── ACTIVITY TYPES (Tipe Aktivitas) ─────────────────────────
CREATE TABLE IF NOT EXISTS `activity_types` (
  `id`       VARCHAR(191) NOT NULL,
  `nama`     VARCHAR(191) NOT NULL,
  `colorHex` VARCHAR(191) NOT NULL DEFAULT '#2563EB',
  `icon`     VARCHAR(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activity_types_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `activity_types` (`id`, `nama`, `colorHex`, `icon`) VALUES
('act_call',       'Call',        '#2563EB', '📞'),
('act_meeting',    'Meeting',     '#16A34A', '🤝'),
('act_chat_wa',    'Chat/WA',     '#0D9488', '💬'),
('act_proposal',   'Proposal',    '#D97706', '📑'),
('act_visit',      'Visit',       '#7C3AED', '🏢'),
('act_email',      'Email',       '#6B7280', '📧'),
('act_followup',   'Follow Up',   '#DC2626', '🔄'),
('act_survey',     'Survey',      '#0891B2', '📊'),
('act_nego',       'Negotiation', '#D946EF', '🤝');

-- ─── CITIES (Master Kota & Provinsi) ─────────────────────────
CREATE TABLE IF NOT EXISTS `cities` (
  `id`       VARCHAR(191) NOT NULL,
  `nama`     VARCHAR(191) NOT NULL,
  `provinsi` VARCHAR(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `cities` (`id`, `nama`, `provinsi`) VALUES

-- ACEH
('kt_banda_aceh',    'Banda Aceh',     'Aceh'),
('kt_lhokseumawe',   'Lhokseumawe',    'Aceh'),
('kt_langsa',        'Langsa',         'Aceh'),
('kt_meulaboh',      'Meulaboh',       'Aceh'),
('kt_sabang',        'Sabang',         'Aceh'),

-- SUMATERA UTARA
('kt_medan',         'Medan',          'Sumatera Utara'),
('kt_binjai',        'Binjai',         'Sumatera Utara'),
('kt_pematangsiantar','Pematangsiantar','Sumatera Utara'),
('kt_sibolga',       'Sibolga',        'Sumatera Utara'),
('kt_tanjungbalai',  'Tanjungbalai',   'Sumatera Utara'),
('kt_tebingtinggi',  'Tebing Tinggi',  'Sumatera Utara'),
('kt_padangsidempuan','Padangsidempuan','Sumatera Utara'),
('kt_gunungsitoli',  'Gunungsitoli',   'Sumatera Utara'),

-- SUMATERA BARAT
('kt_padang',        'Padang',         'Sumatera Barat'),
('kt_bukittinggi',   'Bukittinggi',    'Sumatera Barat'),
('kt_payakumbuh',    'Payakumbuh',     'Sumatera Barat'),
('kt_sawahlunto',    'Sawahlunto',     'Sumatera Barat'),
('kt_solok',         'Solok',          'Sumatera Barat'),

-- RIAU
('kt_pekanbaru',     'Pekanbaru',      'Riau'),
('kt_durai',         'Dumai',          'Riau'),

-- KEPULAUAN RIAU
('kt_tanjungpinang', 'Tanjungpinang',  'Kepulauan Riau'),
('kt_batam',         'Batam',          'Kepulauan Riau'),

-- JAMBI
('kt_jambi',         'Jambi',          'Jambi'),
('kt_sungaipenuh',   'Sungai Penuh',   'Jambi'),

-- SUMATERA SELATAN
('kt_palembang',     'Palembang',      'Sumatera Selatan'),
('kt_lubuklinggau',  'Lubuklinggau',   'Sumatera Selatan'),
('kt_pagaralam',     'Pagar Alam',     'Sumatera Selatan'),
('kt_prabumulih',    'Prabumulih',     'Sumatera Selatan'),

-- BENGKULU
('kt_bengkulu',      'Bengkulu',       'Bengkulu'),

-- LAMPUNG
('kt_bandarlampung', 'Bandar Lampung', 'Lampung'),
('kt_metro',         'Metro',          'Lampung'),

-- BANGKA BELITUNG
('kt_pangkalpinang', 'Pangkalpinang',  'Kepulauan Bangka Belitung'),

-- DKI JAKARTA
('kt_jakpus',        'Jakarta Pusat',  'DKI Jakarta'),
('kt_jakut',         'Jakarta Utara',  'DKI Jakarta'),
('kt_jakbar',        'Jakarta Barat',  'DKI Jakarta'),
('kt_jaksel',        'Jakarta Selatan','DKI Jakarta'),
('kt_jaktim',        'Jakarta Timur',  'DKI Jakarta'),
('kt_kepseribu',     'Kepulauan Seribu','DKI Jakarta'),

-- JAWA BARAT
('kt_bandung',       'Bandung',        'Jawa Barat'),
('kt_bekasi',        'Bekasi',         'Jawa Barat'),
('kt_bogor',         'Bogor',          'Jawa Barat'),
('kt_depok',         'Depok',          'Jawa Barat'),
('kt_cimahi',        'Cimahi',         'Jawa Barat'),
('kt_tasikmalaya',   'Tasikmalaya',    'Jawa Barat'),
('kt_banjar',        'Banjar',         'Jawa Barat'),
('kt_sukabumi',      'Sukabumi',       'Jawa Barat'),
('kt_cirebon',       'Cirebon',        'Jawa Barat'),

-- BANTEN
('kt_serang',        'Serang',         'Banten'),
('kt_tangerang',     'Tangerang',      'Banten'),
('kt_tangerangsel',  'Tangerang Selatan','Banten'),
('kt_cilegon',       'Cilegon',        'Banten'),

-- JAWA TENGAH
('kt_semarang',      'Semarang',       'Jawa Tengah'),
('kt_surakarta',     'Surakarta / Solo','Jawa Tengah'),
('kt_salatiga',      'Salatiga',       'Jawa Tengah'),
('kt_pekalongan',    'Pekalongan',     'Jawa Tengah'),
('kt_tegal',         'Tegal',          'Jawa Tengah'),
('kt_magelang',      'Magelang',       'Jawa Tengah'),
('kt_kudus',         'Kudus',          'Jawa Tengah'),
('kt_purwokerto',    'Purwokerto',     'Jawa Tengah'),

-- DI YOGYAKARTA
('kt_yogyakarta',    'Yogyakarta',     'Daerah Istimewa Yogyakarta'),
('kt_sleman',        'Sleman',         'Daerah Istimewa Yogyakarta'),
('kt_bantul',        'Bantul',         'Daerah Istimewa Yogyakarta'),
('kt_gunungkidul',   'Gunung Kidul',   'Daerah Istimewa Yogyakarta'),
('kt_kulonprogo',    'Kulon Progo',    'Daerah Istimewa Yogyakarta'),

-- JAWA TIMUR
('kt_surabaya',      'Surabaya',       'Jawa Timur'),
('kt_malang',        'Malang',         'Jawa Timur'),
('kt_kediri',        'Kediri',         'Jawa Timur'),
('kt_blitar',        'Blitar',         'Jawa Timur'),
('kt_madiun',        'Madiun',         'Jawa Timur'),
('kt_mojokerto',     'Mojokerto',      'Jawa Timur'),
('kt_pasuruan',      'Pasuruan',       'Jawa Timur'),
('kt_probolinggo',   'Probolinggo',    'Jawa Timur'),
('kt_batu',          'Batu',           'Jawa Timur'),
('kt_jember',        'Jember',         'Jawa Timur'),
('kt_banyuwangi',    'Banyuwangi',     'Jawa Timur'),
('kt_gresik',        'Gresik',         'Jawa Timur'),
('kt_sidoarjo',      'Sidoarjo',       'Jawa Timur'),

-- BALI
('kt_denpasar',      'Denpasar',       'Bali'),
('kt_badung',        'Badung',         'Bali'),
('kt_gianyar',       'Gianyar',        'Bali'),
('kt_singaraja',     'Singaraja',      'Bali'),
('kt_tabanan',       'Tabanan',        'Bali'),

-- NTB
('kt_mataram',       'Mataram',        'Nusa Tenggara Barat'),
('kt_bima',          'Bima',           'Nusa Tenggara Barat'),

-- NTT
('kt_kupang',        'Kupang',         'Nusa Tenggara Timur'),
('kt_ende',          'Ende',           'Nusa Tenggara Timur'),
('kt_maumere',       'Maumere',        'Nusa Tenggara Timur'),
('kt_labuanbajo',    'Labuan Bajo',    'Nusa Tenggara Timur'),

-- KALIMANTAN BARAT
('kt_pontianak',     'Pontianak',      'Kalimantan Barat'),
('kt_singkawang',    'Singkawang',     'Kalimantan Barat'),

-- KALIMANTAN TENGAH
('kt_palangkaraya',  'Palangkaraya',   'Kalimantan Tengah'),
('kt_sampit',        'Sampit',         'Kalimantan Tengah'),

-- KALIMANTAN SELATAN
('kt_banjarmasin',   'Banjarmasin',    'Kalimantan Selatan'),
('kt_banjarbaru',    'Banjarbaru',     'Kalimantan Selatan'),

-- KALIMANTAN TIMUR
('kt_samarinda',     'Samarinda',      'Kalimantan Timur'),
('kt_balikpapan',    'Balikpapan',     'Kalimantan Timur'),
('kt_bontang',       'Bontang',        'Kalimantan Timur'),

-- KALIMANTAN UTARA
('kt_tarakan',       'Tarakan',        'Kalimantan Utara'),

-- SULAWESI UTARA
('kt_manado',        'Manado',         'Sulawesi Utara'),
('kt_bitung',        'Bitung',         'Sulawesi Utara'),
('kt_tomohon',       'Tomohon',        'Sulawesi Utara'),
('kt_kotamobagu',    'Kotamobagu',     'Sulawesi Utara'),

-- SULAWESI TENGAH
('kt_palu',          'Palu',           'Sulawesi Tengah'),

-- SULAWESI SELATAN
('kt_makassar',      'Makassar',       'Sulawesi Selatan'),
('kt_parepare',      'Parepare',       'Sulawesi Selatan'),
('kt_palopo',        'Palopo',         'Sulawesi Selatan'),

-- SULAWESI TENGGARA
('kt_kendari',       'Kendari',        'Sulawesi Tenggara'),
('kt_baubau',        'Bau-Bau',        'Sulawesi Tenggara'),

-- GORONTALO
('kt_gorontalo',     'Gorontalo',      'Gorontalo'),

-- SULAWESI BARAT
('kt_mamuju',        'Mamuju',         'Sulawesi Barat'),

-- MALUKU
('kt_ambon',         'Ambon',          'Maluku'),
('kt_ternate',       'Ternate',        'Maluku Utara'),
('kt_tidore',        'Tidore',         'Maluku Utara'),

-- PAPUA
('kt_jayapura',      'Jayapura',       'Papua'),
('kt_merauke',       'Merauke',        'Papua Selatan'),
('kt_sorong',        'Sorong',         'Papua Barat Daya'),
('kt_manokwari',     'Manokwari',      'Papua Barat'),
('kt_nabire',        'Nabire',         'Papua Tengah'),
('kt_wamena',        'Wamena',         'Papua Pegunungan');
