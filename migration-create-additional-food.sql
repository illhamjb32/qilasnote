-- Migration: Membuat tabel additional_food
-- Jalankan query ini di Supabase SQL Editor

CREATE TABLE additional_food (
  id BIGSERIAL PRIMARY KEY,
  food_type TEXT NOT NULL CHECK (food_type IN ('snack', 'fruit')),
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(food_type, date)
);

-- Index untuk performa query
CREATE INDEX idx_additional_food_date ON additional_food(date DESC);
CREATE INDEX idx_additional_food_food_type_date ON additional_food(food_type, date);

-- Enable Row Level Security (RLS)
ALTER TABLE additional_food ENABLE ROW LEVEL SECURITY;

-- Policy untuk akses publik (untuk development)
CREATE POLICY "Enable all access for additional_food" ON additional_food FOR ALL USING (true);
