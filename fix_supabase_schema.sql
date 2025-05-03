-- Script SQL untuk memperbaiki masalah schema cache pada tabel materials

-- 1. Periksa skema tabel materials
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials';

-- 2. Tetapkan REPLICA IDENTITY ke FULL untuk memungkinkan update
ALTER TABLE materials REPLICA IDENTITY FULL;

-- 3. Disable semua trigger untuk sementara
ALTER TABLE materials DISABLE TRIGGER ALL;

-- 4. Enable kembali trigger
ALTER TABLE materials ENABLE TRIGGER ALL;

-- 5. Refresh semua view materialized (jika ada)
-- Ganti [view_name] dengan nama view yang sesuai jika perlu
-- REFRESH MATERIALIZED VIEW [view_name];

-- 6. Re-create foreign key constraint untuk memastikan index terbentuk dengan benar
ALTER TABLE materials DROP CONSTRAINT IF EXISTS materials_category_id_fkey;
ALTER TABLE materials ADD CONSTRAINT materials_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES material_categories(id);

-- 7. Refresh konfigurasi PostgreSQL
SELECT pg_reload_conf();

-- 8. Optional: Jika ingin memperbaiki struktur tabel sepenuhnya
-- Peringatan: Ini akan membuat tabel baru dan memindahkan data, gunakan dengan hati-hati
-- CREATE TABLE materials_new (LIKE materials INCLUDING ALL);
-- INSERT INTO materials_new SELECT * FROM materials;
-- ALTER TABLE materials RENAME TO materials_old;
-- ALTER TABLE materials_new RENAME TO materials;

-- 9. Optional: Hapus tabel lama jika sudah yakin data telah dipindahkan dengan benar
-- DROP TABLE materials_old;

-- 10. Tambahkan komentar untuk menandai bahwa tabel telah diperbaiki
COMMENT ON TABLE materials IS 'Tabel materi pembelajaran yang telah diperbaiki schema cache-nya'; 