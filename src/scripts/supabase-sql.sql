-- Script ini harus dijalankan di SQL Editor Supabase
-- Login ke dashboard Supabase -> Pilih project -> SQL Editor -> New Query -> Paste script ini

-- Aktifkan extension uuid jika belum
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

------------------------------------
-- MEMBUAT TABEL UNTUK FLASHCARD --
------------------------------------

-- 1. Tabel untuk kategori flashcard
CREATE TABLE IF NOT EXISTS public.flashcard_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Tabel untuk topik flashcard
CREATE TABLE IF NOT EXISTS public.flashcard_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category_id UUID REFERENCES public.flashcard_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indeks untuk mempercepat pencarian berdasarkan category_id
CREATE INDEX IF NOT EXISTS flashcard_topics_category_id_idx ON public.flashcard_topics(category_id);

-- 3. Tabel untuk flashcard
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  topic_id UUID REFERENCES public.flashcard_topics(id) ON DELETE CASCADE,
  difficulty INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indeks untuk mempercepat pencarian berdasarkan topic_id
CREATE INDEX IF NOT EXISTS flashcards_topic_id_idx ON public.flashcards(topic_id);

---------------------------------------
-- PENGATURAN HAK AKSES DAN KEBIJAKAN --
---------------------------------------

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.flashcard_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk memungkinkan akses baca untuk semua orang
CREATE POLICY "Allow public read access" ON public.flashcard_categories 
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read access" ON public.flashcard_topics 
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read access" ON public.flashcards 
  FOR SELECT USING (true);

-- Kebijakan untuk memungkinkan akses tulis hanya untuk admin
-- Catatan: Ini mengasumsikan adanya tabel user_roles
-- Ubah sesuai dengan struktur peran pengguna di aplikasi Anda
CREATE POLICY "Allow write access for admins" ON public.flashcard_categories 
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.user_roles WHERE role = 'admin')
  );
  
CREATE POLICY "Allow write access for admins" ON public.flashcard_topics 
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.user_roles WHERE role = 'admin')
  );
  
CREATE POLICY "Allow write access for admins" ON public.flashcards 
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.user_roles WHERE role = 'admin')
  );

----------------------------------------
-- CONTOH DATA UNTUK TESTING (OPSIONAL) --
----------------------------------------

-- Menambahkan kategori contoh
INSERT INTO public.flashcard_categories (name)
VALUES 
  ('Aljabar'), 
  ('Geometri');

-- Menambahkan topik contoh
INSERT INTO public.flashcard_topics (name, slug, category_id)
VALUES 
  ('Persamaan Linear', 'persamaan-linear', (SELECT id FROM public.flashcard_categories WHERE name = 'Aljabar')),
  ('Persamaan Kuadrat', 'persamaan-kuadrat', (SELECT id FROM public.flashcard_categories WHERE name = 'Aljabar')),
  ('Bangun Datar', 'bangun-datar', (SELECT id FROM public.flashcard_categories WHERE name = 'Geometri')),
  ('Bangun Ruang', 'bangun-ruang', (SELECT id FROM public.flashcard_categories WHERE name = 'Geometri'));

-- Menambahkan beberapa flashcard contoh
INSERT INTO public.flashcards (question, answer, topic_id, difficulty)
VALUES
  (
    'Apa yang dimaksud dengan persamaan linear?', 
    'Persamaan linear adalah persamaan yang variabelnya berpangkat satu. Bentuk umumnya adalah ax + b = 0, di mana a ≠ 0.',
    (SELECT id FROM public.flashcard_topics WHERE name = 'Persamaan Linear'),
    1
  ),
  (
    'Bagaimana ciri-ciri persamaan linear?', 
    'Ciri-ciri persamaan linear: (1) Variabel berpangkat satu, (2) Tidak ada perkalian antar variabel, (3) Grafiknya berupa garis lurus.',
    (SELECT id FROM public.flashcard_topics WHERE name = 'Persamaan Linear'),
    1
  ),
  (
    'Rumus luas lingkaran adalah?', 
    'πr². Dimana r adalah jari-jari lingkaran dan π adalah konstanta dengan nilai sekitar 3,14.',
    (SELECT id FROM public.flashcard_topics WHERE name = 'Bangun Datar'),
    1
  );

------------------------------
-- SELESAI! --
------------------------------
-- Periksa tabel yang telah dibuat:
-- SELECT * FROM public.flashcard_categories;
-- SELECT * FROM public.flashcard_topics;
-- SELECT * FROM public.flashcards; 