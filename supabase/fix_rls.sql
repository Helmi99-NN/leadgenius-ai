-- ====================================
-- FIX: Tambahkan RLS Policy untuk semua tabel
-- Jalankan di Supabase SQL Editor
-- ====================================

-- Opsi 1: MATIKAN RLS (paling simpel untuk development)
-- Ini membuat semua data bisa diakses tanpa autentikasi
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE competitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_replies DISABLE ROW LEVEL SECURITY;
