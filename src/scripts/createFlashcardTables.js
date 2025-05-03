import { supabase } from '../config/supabase';

/**
 * Skrip untuk membuat tabel-tabel yang diperlukan untuk fitur flashcard di Supabase
 * 
 * Catatan: Untuk membuat tabel di Supabase, kita harus menggunakan SQL langsung
 * karena JavaScript API tidak mendukung CREATE TABLE
 */
export const createFlashcardTables = async () => {
  console.log('Membuat tabel flashcard di Supabase...');
  
  try {
    // Buat tabel flashcard_categories
    const { data: categories, error: categoriesError } = await supabase.rpc(
      'create_flashcard_categories_table',
      {}
    );
    
    if (categoriesError) {
      console.error('Error saat membuat tabel flashcard_categories:', categoriesError);
      alert('Gagal membuat tabel flashcard_categories. Silakan lihat konsol untuk detail error.');
      return;
    }
    
    console.log('Tabel flashcard_categories berhasil dibuat:', categories);
    
    // Buat tabel flashcard_topics
    const { data: topics, error: topicsError } = await supabase.rpc(
      'create_flashcard_topics_table',
      {}
    );
    
    if (topicsError) {
      console.error('Error saat membuat tabel flashcard_topics:', topicsError);
      alert('Gagal membuat tabel flashcard_topics. Silakan lihat konsol untuk detail error.');
      return;
    }
    
    console.log('Tabel flashcard_topics berhasil dibuat:', topics);
    
    // Buat tabel flashcards
    const { data: flashcards, error: flashcardsError } = await supabase.rpc(
      'create_flashcards_table',
      {}
    );
    
    if (flashcardsError) {
      console.error('Error saat membuat tabel flashcards:', flashcardsError);
      alert('Gagal membuat tabel flashcards. Silakan lihat konsol untuk detail error.');
      return;
    }
    
    console.log('Tabel flashcards berhasil dibuat:', flashcards);
    
    alert('Semua tabel flashcard berhasil dibuat!');
  } catch (error) {
    console.error('Error saat membuat tabel flashcard:', error);
    alert('Terjadi kesalahan saat membuat tabel flashcard. Silakan lihat konsol untuk detail error.');
  }
};

/**
 * CATATAN PENTING:
 * 
 * Sebelum menggunakan skrip ini, Anda perlu membuat 3 fungsi SQL di Supabase:
 * 
 * 1. create_flashcard_categories_table - untuk membuat tabel flashcard_categories
 * 2. create_flashcard_topics_table - untuk membuat tabel flashcard_topics
 * 3. create_flashcards_table - untuk membuat tabel flashcards
 * 
 * Berikut adalah SQL untuk membuat fungsi-fungsi tersebut:
 * 
 * -- Fungsi untuk membuat tabel flashcard_categories
 * CREATE OR REPLACE FUNCTION create_flashcard_categories_table()
 * RETURNS text AS $$
 * BEGIN
 *   CREATE TABLE IF NOT EXISTS public.flashcard_categories (
 *     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *     name TEXT NOT NULL,
 *     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
 *   );
 *   
 *   RETURN 'Tabel flashcard_categories berhasil dibuat';
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 * 
 * -- Fungsi untuk membuat tabel flashcard_topics
 * CREATE OR REPLACE FUNCTION create_flashcard_topics_table()
 * RETURNS text AS $$
 * BEGIN
 *   CREATE TABLE IF NOT EXISTS public.flashcard_topics (
 *     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *     name TEXT NOT NULL,
 *     slug TEXT NOT NULL,
 *     category_id UUID REFERENCES public.flashcard_categories(id) ON DELETE CASCADE,
 *     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
 *   );
 *   
 *   CREATE INDEX IF NOT EXISTS flashcard_topics_category_id_idx ON public.flashcard_topics(category_id);
 *   
 *   RETURN 'Tabel flashcard_topics berhasil dibuat';
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 * 
 * -- Fungsi untuk membuat tabel flashcards
 * CREATE OR REPLACE FUNCTION create_flashcards_table()
 * RETURNS text AS $$
 * BEGIN
 *   CREATE TABLE IF NOT EXISTS public.flashcards (
 *     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *     question TEXT NOT NULL,
 *     answer TEXT NOT NULL,
 *     topic_id UUID REFERENCES public.flashcard_topics(id) ON DELETE CASCADE,
 *     difficulty INTEGER DEFAULT 1 NOT NULL,
 *     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
 *   );
 *   
 *   CREATE INDEX IF NOT EXISTS flashcards_topic_id_idx ON public.flashcards(topic_id);
 *   
 *   RETURN 'Tabel flashcards berhasil dibuat';
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 */ 