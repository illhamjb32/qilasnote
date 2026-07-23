-- SQL untuk setup database Supabase
-- Jalankan query ini di Supabase SQL Editor

-- Tabel untuk menyimpan catatan konsumsi susu
CREATE TABLE milk_records (
  id BIGSERIAL PRIMARY KEY,
  amount INTEGER NOT NULL,
  time TEXT NOT NULL,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel untuk menyimpan pengaturan user (opsional)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_target INTEGER NOT NULL DEFAULT 1000,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_interval INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX idx_milk_records_date ON milk_records(date DESC);
CREATE INDEX idx_milk_records_timestamp ON milk_records(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE milk_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy untuk akses publik (untuk development)
-- CATATAN: Untuk production, gunakan policy yang lebih ketat dengan auth
CREATE POLICY "Enable all access for milk_records" ON milk_records FOR ALL USING (true);
CREATE POLICY "Enable all access for user_settings" ON user_settings FOR ALL USING (true);
