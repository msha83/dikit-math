-- Script untuk menambahkan kolom slug ke tabel materials

-- 1. Periksa struktur tabel saat ini untuk melihat apakah kolom slug sudah ada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials' AND column_name = 'slug';

-- 2. Tambahkan kolom slug jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'slug'
  ) THEN
    -- Tambahkan kolom slug dengan tipe text
    ALTER TABLE materials ADD COLUMN slug VARCHAR(255);
    
    -- Tambahkan constraint unique untuk slug
    ALTER TABLE materials ADD CONSTRAINT materials_slug_unique UNIQUE (slug);
    
    -- Tambahkan indeks untuk mempercepat pencarian
    CREATE INDEX IF NOT EXISTS materials_slug_idx ON materials(slug);
    
    -- Isi nilai slug berdasarkan title untuk data yang sudah ada
    UPDATE materials 
    SET slug = LOWER(REPLACE(REPLACE(REPLACE(title, ' ', '-'), '.', ''), ',', ''))
    WHERE slug IS NULL;
  ELSE
    RAISE NOTICE 'Kolom slug sudah ada pada tabel materials';
  END IF;
END
$$;

-- 3. Periksa struktur tabel setelah perubahan
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- 4. Perbarui view materials_view untuk menyertakan kolom slug
DROP VIEW IF EXISTS materials_view;

CREATE VIEW materials_view AS
SELECT 
  m.id,
  m.title,
  m.slug,
  m.description,
  m.content,
  m.category,
  m.category_id,
  mc.name AS category_name,
  m.video_embed,
  m.example_problems,
  m.created_by,
  m.created_at,
  m.updated_at
FROM 
  materials m
LEFT JOIN 
  material_categories mc ON m.category_id = mc.id;

-- 5. Verifikasi bahwa view sudah dibuat dengan benar
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'materials_view'
ORDER BY ordinal_position; 