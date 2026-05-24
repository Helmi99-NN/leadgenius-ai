-- ==========================================
-- SQL SETUP: DATABASE PENGETAHUAN & MESIN
-- Silakan jalankan script ini di Supabase SQL Editor
-- ==========================================

-- 1. Buat Tabel Topik/Mesin
CREATE TABLE IF NOT EXISTS public.machines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat Tabel Template Jawaban
CREATE TABLE IF NOT EXISTS public.machine_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. (Opsional) Buat Fungsi untuk Menambah Usage Count
CREATE OR REPLACE FUNCTION increment_reply_usage(reply_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.machine_replies
  SET usage_count = usage_count + 1
  WHERE id = reply_id;
END;
$$ LANGUAGE plpgsql;
