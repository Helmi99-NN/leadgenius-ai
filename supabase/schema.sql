-- ====================================
-- LeadGenius AI — Database Schema
-- Jalankan SQL ini di Supabase SQL Editor
-- ====================================

-- 1. Tabel Leads (Prospek)
CREATE TABLE leads (
  id BIGSERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  contact TEXT,
  initials TEXT,
  platform TEXT DEFAULT 'shopee',
  store_id TEXT,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  category TEXT DEFAULT 'cold' CHECK (category IN ('hot', 'warm', 'cold')),
  sentiment TEXT,
  context TEXT,
  ai_recommendation TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  needs_followup BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Chat Messages (Pesan Chat)
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'extension',
  analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Follow-ups (Tindak Lanjut)
CREATE TABLE follow_ups (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  ai_draft TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Generated Replies (Balasan AI)
CREATE TABLE generated_replies (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
  style TEXT CHECK (style IN ('hard', 'soft', 'authority', 'scarcity')),
  content TEXT NOT NULL,
  tone_score INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Notifications (Notifikasi)
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Competitors (Kompetitor)
CREATE TABLE competitors (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT DEFAULT 'shopee',
  rating DECIMAL(2,1) DEFAULT 0,
  products INTEGER DEFAULT 0,
  followers TEXT,
  avg_price TEXT,
  price_change INTEGER DEFAULT 0,
  response_time TEXT,
  threat TEXT DEFAULT 'low' CHECK (threat IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- Row Level Security (RLS) — Keamanan
-- ====================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated and anon users (untuk MVP)
CREATE POLICY "Allow all for leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for follow_ups" ON follow_ups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for generated_replies" ON generated_replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for competitors" ON competitors FOR ALL USING (true) WITH CHECK (true);

-- ====================================
-- Data Awal (Seed Data)
-- ====================================

-- Leads
INSERT INTO leads (company, contact, initials, score, category, context, ai_recommendation, last_message_time, needs_followup) VALUES
('Acme Corp', 'Jane Doe', 'AC', 98, 'hot', '"Kami ingin menerapkan solusi AI pada Q3. Bisakah kita menjadwalkan demo?"', 'Niat pembelian tinggi terdeteksi. Disarankan menjadwalkan demo teknis segera.', NOW() - INTERVAL '10 minutes', true),
('TechFlow Inc.', 'Mike S.', 'TF', 92, 'hot', 'Kontrak dikirim untuk ditinjau. Menunggu persetujuan tim legal.', 'Tindak lanjuti dalam 24 jam untuk memastikan kontrak tidak tertunda.', NOW() - INTERVAL '2 hours', false),
('NexGen Labs', 'Lisa T.', 'NL', 89, 'hot', 'Tertarik dengan paket enterprise. Minta perbandingan harga.', 'Siapkan tabel perbandingan fitur dan jadwalkan call.', NOW() - INTERVAL '1 day', true),
('DataPrime', 'Sarah K.', 'DP', 72, 'warm', 'Minta informasi lebih lanjut tentang integrasi API.', 'Kirim dokumentasi API dan contoh kasus penggunaan.', NOW() - INTERVAL '3 hours', false),
('CloudSync', 'Tom B.', 'CS', 65, 'warm', 'Sedang evaluasi beberapa vendor. Minta proposal.', 'Buat proposal yang menonjolkan keunggulan kompetitif.', NOW() - INTERVAL '1 day', true),
('SmartRetail', 'Diana R.', 'SR', 58, 'warm', 'Baru mulai riset solusi. Belum ada timeline.', 'Lakukan nurturing dengan konten edukatif.', NOW() - INTERVAL '2 days', false),
('MegaStore', 'Bob W.', 'MS', 35, 'cold', 'Hanya browsing. Belum ada kebutuhan spesifik.', 'Tambahkan ke nurturing campaign jangka panjang.', NOW() - INTERVAL '5 days', false),
('QuickMart', 'Ali P.', 'QM', 28, 'cold', 'Menanyakan harga secara umum.', 'Kirim katalog produk dan follow up dalam 2 minggu.', NOW() - INTERVAL '1 week', false),
('BudgetShop', 'Nina L.', 'BS', 15, 'cold', 'Tidak responsif setelah kontak awal.', 'Arsipkan dan coba kembali bulan depan.', NOW() - INTERVAL '2 weeks', false);

-- Chat messages for Acme Corp (lead_id = 1)
INSERT INTO chat_messages (lead_id, sender, message, created_at) VALUES
(1, 'customer', '"Kami ingin menerapkan solusi AI pada Q3. Bisakah kita menjadwalkan demo?"', NOW() - INTERVAL '10 minutes');

-- Follow-ups
INSERT INTO follow_ups (lead_id, scheduled_at, status, ai_draft, description) VALUES
(1, NOW() - INTERVAL '2 days', 'overdue', '"Hai Sarah, menindaklanjuti percakapan terakhir kita mengenai persyaratan perusahaan. Apakah Anda sudah sempat meninjau tingkat harga yang direvisi?"', 'Negosiasi Kontrak Terhenti'),
(2, NOW(), 'pending', '"Hai David, semoga demonya bermanfaat. Saya ingin melihat apakah Anda memiliki pertanyaan yang belum terjawab tentang kemampuan integrasi API yang kita diskusikan."', 'Pemeriksaan Pasca-Demo'),
(4, NOW() + INTERVAL '1 day', 'pending', '"Hai Tim, hanya memunculkan ini ke bagian atas kotak masuk Anda. Beri tahu saya jika Anda punya waktu 10 menit minggu depan."', 'Tindak Lanjut Penjangkauan Awal');

-- Notifications
INSERT INTO notifications (type, title, description, lead_id) VALUES
('new-lead', 'Prospek Baru: PT. Maju Jaya', 'Prospek baru telah ditambahkan ke saluran Anda dari kampanye LinkedIn. Nilai potensial: Rp 50.000.000.', 1),
('competitor', 'Peringatan Kompetitor: Harga Turun', 'Kompetitor TechCorp baru saja menurunkan harga produk andalan mereka sebesar 15%.', NULL),
('followup', 'Pengingat Tindak Lanjut: Budi Santoso', 'Jadwal panggilan tindak lanjut mengenai penawaran lisensi perangkat lunak.', 3),
('followup', 'Kesepakatan Ditutup: CV. Abadi Makmur', 'Selamat! Kesepakatan dengan CV. Abadi Makmur telah berhasil ditutup.', NULL);

-- Competitors
INSERT INTO competitors (name, platform, rating, products, followers, avg_price, price_change, response_time, threat) VALUES
('TechCorp Store', 'Shopee', 4.8, 342, '12.5K', 'Rp 2.450.000', -15, '< 1 jam', 'high'),
('MegaElektro', 'Shopee', 4.6, 218, '8.2K', 'Rp 2.380.000', -8, '2 jam', 'medium'),
('Digital Paradise', 'Tokopedia', 4.9, 567, '25.1K', 'Rp 2.600.000', 0, '< 30 mnt', 'high'),
('BudgetGadget', 'Shopee', 4.3, 89, '3.1K', 'Rp 2.100.000', -22, '5 jam', 'low');
