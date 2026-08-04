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

-- Tabel untuk menyimpan catatan MPASI
CREATE TABLE mpasi_records (
  id BIGSERIAL PRIMARY KEY,
  amount INTEGER NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('ml', 'gr')),
  time TEXT NOT NULL,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel untuk menyimpan additional food (snack dan buah)
CREATE TABLE additional_food (
  id BIGSERIAL PRIMARY KEY,
  food_type TEXT NOT NULL CHECK (food_type IN ('snack', 'fruit')),
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(food_type, date)
);

-- Tabel untuk menyimpan catatan pertumbuhan
CREATE TABLE growth_records (
  id BIGSERIAL PRIMARY KEY,
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(6,1) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel untuk menyimpan pengaturan user (opsional)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_target INTEGER NOT NULL DEFAULT 1000,
  daily_target_mpasi INTEGER DEFAULT 500,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_interval INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX idx_milk_records_date ON milk_records(date DESC);
CREATE INDEX idx_milk_records_timestamp ON milk_records(timestamp DESC);
CREATE INDEX idx_mpasi_records_date ON mpasi_records(date DESC);
CREATE INDEX idx_mpasi_records_timestamp ON mpasi_records(timestamp DESC);
CREATE INDEX idx_additional_food_date ON additional_food(date DESC);
CREATE INDEX idx_additional_food_food_type_date ON additional_food(food_type, date);
CREATE INDEX idx_growth_records_date ON growth_records(date DESC);
CREATE INDEX idx_growth_records_timestamp ON growth_records(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE milk_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpasi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_food ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;

-- Policy untuk akses publik (untuk development)
-- CATATAN: Untuk production, gunakan policy yang lebih ketat dengan auth
CREATE POLICY "Enable all access for milk_records" ON milk_records FOR ALL USING (true);
CREATE POLICY "Enable all access for mpasi_records" ON mpasi_records FOR ALL USING (true);
CREATE POLICY "Enable all access for additional_food" ON additional_food FOR ALL USING (true);
CREATE POLICY "Enable all access for growth_records" ON growth_records FOR ALL USING (true);
