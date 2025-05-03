-- Script untuk memeriksa struktur tabel materials secara detail

-- 1. Periksa struktur tabel materials dari information_schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- 2. Tampilkan sampel data dari tabel materials (jika ada)
SELECT * FROM materials LIMIT 5;

-- 3. Periksa definisi tabel secara lengkap
SELECT pg_catalog.pg_get_tabledef('materials'::regclass::oid);

-- 4. Cek constraints yang ada pada tabel materials
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'materials'::regclass::oid;

-- 5. Periksa struktur tabel material_categories
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'material_categories'
ORDER BY ordinal_position; 