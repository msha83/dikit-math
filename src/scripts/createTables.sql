-- Kode SQL untuk membuat tabel-tabel flashcard di Supabase
-- Salin kode ini dan jalankan di SQL Editor Supabase

-- Aktifkan extension uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel untuk kategori flashcard
CREATE TABLE IF NOT EXISTS public.flashcard_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabel untuk topik flashcard
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

-- Tabel untuk flashcard
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

-- Atur izin baca untuk akses publik (opsional, sesuaikan dengan kebutuhan)
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

-- Kebijakan untuk memungkinkan akses tulis hanya untuk admin (asumsi ada tabel user_roles)
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