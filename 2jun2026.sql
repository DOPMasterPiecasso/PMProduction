-- ============================================================
-- 2 Juni 2026 — Tidak ada perubahan tabel
-- ============================================================
-- 
-- Perubahan pada sesi ini:
--   1. Dashboard: select option bulan + filter data per bulan
--   2. Pipeline: tombol Hapus di modal detail deal (DELETE /api/pipeline)
--   3. Settings: upload logo & favicon di Preferensi Sistem
--
-- Tidak ada migrasi database.
-- Logo & favicon disimpan di system_settings (key: logo_url, favicon_url)
-- melalui API (Prisma upsert), bukan SQL langsung.
--
-- ============================================================

SELECT '2 Jun 2026 — No schema changes. Logo & favicon stored via API into system_settings.' AS migration_note;
