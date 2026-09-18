-- Fix: set goal (susu/MPASI) di Settings error 500
-- Root cause: API route user-settings pakai .upsert({ onConflict: 'user_id' }),
-- tapi tabel user_settings tidak punya unique constraint di kolom user_id
-- -> Postgres error 42P10 "there is no unique or exclusion constraint
--    matching the ON CONFLICT specification".
--
-- Kode sudah difix di app/api/user-settings/route.ts (update-then-insert,
-- tidak butuh constraint). SQL di bawah opsional/hardening: bikin upsert
-- native jalan lagi dan cegah duplikat baris per user.
--
-- Jalankan di Supabase Dashboard > SQL Editor.

-- 1. Cegah duplikat: kalau ada lebih dari 1 row untuk user yang sama,
--    sisakan yang paling lama dibuat (paling awal), hapus sisanya.
DELETE FROM user_settings a
USING user_settings b
WHERE a.user_id = b.user_id
  AND a.created_at > b.created_at;

-- 2. Tambahkan unique constraint supaya ON CONFLICT (user_id) valid
--    dan data settings selalu 1 baris per user.
ALTER TABLE user_settings
  ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);
