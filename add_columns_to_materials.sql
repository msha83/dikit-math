-- Script untuk menambahkan kolom-kolom yang diperlukan ke tabel materials

-- 1. Periksa struktur tabel saat ini
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- 2. Tambahkan kolom-kolom yang diperlukan jika belum ada
DO $$
BEGIN
  -- Tambahkan kolom slug jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'slug'
  ) THEN
    ALTER TABLE materials ADD COLUMN slug VARCHAR(255);
    
    -- Tambahkan constraint unique untuk slug
    ALTER TABLE materials ADD CONSTRAINT materials_slug_unique UNIQUE (slug);
    
    -- Tambahkan indeks untuk mempercepat pencarian
    CREATE INDEX IF NOT EXISTS materials_slug_idx ON materials(slug);
    
    RAISE NOTICE 'Kolom slug berhasil ditambahkan';
  ELSE
    RAISE NOTICE 'Kolom slug sudah ada pada tabel materials';
  END IF;
  
  -- Tambahkan kolom video_embed jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'video_embed'
  ) THEN
    ALTER TABLE materials ADD COLUMN video_embed TEXT;
    RAISE NOTICE 'Kolom video_embed berhasil ditambahkan';
  ELSE
    RAISE NOTICE 'Kolom video_embed sudah ada pada tabel materials';
  END IF;
  
  -- Tambahkan kolom example_problems jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'example_problems'
  ) THEN
    ALTER TABLE materials ADD COLUMN example_problems JSONB;
    RAISE NOTICE 'Kolom example_problems berhasil ditambahkan';
  ELSE
    RAISE NOTICE 'Kolom example_problems sudah ada pada tabel materials';
  END IF;
  
  -- Isi nilai slug berdasarkan title untuk data yang sudah ada
  UPDATE materials 
  SET slug = LOWER(REPLACE(REPLACE(REPLACE(title, ' ', '-'), '.', ''), ',', ''))
  WHERE slug IS NULL;
END
$$;

-- 3. Periksa struktur tabel setelah perubahan
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- 4. Perbarui view materials_view untuk menyertakan kolom-kolom baru
DROP VIEW IF EXISTS materials_view;

-- 5. Buat view baru yang hanya menggunakan kolom-kolom yang ada
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

-- 6. Verifikasi bahwa view sudah dibuat dengan benar
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name = 'materials_view'
ORDER BY ordinal_position; 