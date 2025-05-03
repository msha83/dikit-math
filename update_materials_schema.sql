-- Script untuk memperbarui skema tabel materials
-- Agar kolom category menggunakan tipe UUID dan terhubung ke material_categories

-- 1. Verifikasi struktur tabel saat ini
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials';

-- 2. Cek apakah kolom category_id sudah ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'materials' AND column_name = 'category_id'
  ) THEN
    -- Tambahkan kolom category_id baru jika belum ada
    ALTER TABLE materials ADD COLUMN category_id UUID;
  END IF;
END
$$;

-- 3. Hapus constraint jika sudah ada
ALTER TABLE materials DROP CONSTRAINT IF EXISTS materials_category_id_fkey;

-- 4. Tambahkan constraint foreign key baru
ALTER TABLE materials 
  ADD CONSTRAINT materials_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES material_categories(id);

-- 5. Salin nilai dari kolom category ke category_id jika perlu (dengan konversi tipe)
-- Perhatikan: Ini hanya akan berhasil jika nilai di kolom category sesuai format UUID
-- UPDATE materials SET category_id = category::uuid WHERE category IS NOT NULL;

-- 6. Alternatif: Update category_id dengan nilai yang sesuai dari material_categories
-- Hanya jika kolom category berisi nama kategori, bukan ID
-- UPDATE materials m 
--   SET category_id = mc.id 
--   FROM material_categories mc 
--   WHERE m.category = mc.name;

-- 7. Hapus view lama jika sudah ada
DROP VIEW IF EXISTS materials_view;

-- 8. Coba versi sederhana dari view terlebih dahulu
CREATE VIEW materials_view AS
SELECT 
  m.id,
  m.title,
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

-- 9. Refresh konfigurasi PostgreSQL
SELECT pg_reload_conf();

-- 10. Verifikasi struktur tabel setelah perubahan
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials';

-- 11. Verifikasi constraint yang ada
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'materials'; 