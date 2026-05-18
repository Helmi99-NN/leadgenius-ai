-- ====================================
-- LeadGenius AI — Machine Reply Database Schema
-- Jalankan SQL ini di Supabase SQL Editor
-- ====================================

-- 1. Tabel Machines (Daftar Mesin)
CREATE TABLE machines (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Machine Replies (Template Jawaban per Mesin)
CREATE TABLE machine_replies (
  id BIGSERIAL PRIMARY KEY,
  machine_id BIGINT REFERENCES machines(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- Row Level Security (RLS)
-- ====================================
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (untuk MVP)
CREATE POLICY "Allow all for machines" ON machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for machine_replies" ON machine_replies FOR ALL USING (true) WITH CHECK (true);

-- ====================================
-- Indexes untuk performa
-- ====================================
CREATE INDEX idx_machine_replies_machine_id ON machine_replies(machine_id);
CREATE INDEX idx_machines_name ON machines(name);
