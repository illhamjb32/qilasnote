# Setup Supabase untuk QilasNote

## Langkah 1: Buat Database di Supabase

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda atau buat project baru
3. Buka **SQL Editor** di sidebar
4. Copy dan jalankan query dari file `supabase-setup.sql`

## Langkah 2: Verifikasi Koneksi

Environment variables sudah dikonfigurasi di `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xcnwajvkedafuwnjdoaj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_DlPwTfAC17GAv2-qajoVhA_ddH208kd
```

## Langkah 3: Test Koneksi

Jalankan development server:
```bash
npm run dev
```

Buka browser dan test aplikasi. Data akan otomatis tersimpan ke Supabase.

## Struktur Database

### Tabel `milk_records`
- `id` (BIGSERIAL): Primary key
- `amount` (INTEGER): Jumlah susu dalam ml
- `time` (TEXT): Waktu dalam format HH:MM
- `date` (DATE): Tanggal record
- `timestamp` (TIMESTAMPTZ): Timestamp lengkap
- `created_at` (TIMESTAMPTZ): Waktu pembuatan record

### Tabel `user_settings` (opsional)
- `id` (UUID): Primary key
- `daily_target` (INTEGER): Target harian
- `notifications_enabled` (BOOLEAN): Status notifikasi
- `reminder_interval` (INTEGER): Interval reminder

## Migrasi Data dari LocalStorage

Jika Anda memiliki data lama di localStorage, buat script migrasi atau input ulang data secara manual.

## Catatan Keamanan

Policy RLS saat ini diset untuk akses publik (development). Untuk production:
1. Implementasikan Supabase Auth
2. Update RLS policy untuk user-specific access
3. Tambahkan user_id ke tabel milk_records
