# Panduan Pengelolaan Materi Pembelajaran MathEdu

## Pengenalan

Sistem pengelolaan materi pembelajaran MathEdu memungkinkan administrator untuk melakukan operasi CRUD (Create, Read, Update, Delete) terhadap materi pembelajaran, termasuk:

- Pengelolaan kategori materi
- Pengelolaan konten materi dengan rich text editor
- Penambahan video YouTube
- Penambahan contoh soal dan pembahasan
- dan lainnya

## Cara Menggunakan

1. Login sebagai administrator menggunakan email dan password admin
2. Navigasi ke halaman Admin Dashboard
3. Pilih "Kelola Materi" untuk masuk ke halaman pengelolaan materi

### Mengelola Kategori

1. Di halaman Kelola Materi, klik tombol "Kelola Kategori"
2. Tambahkan kategori baru dengan mengisi formulir
3. Edit atau hapus kategori yang sudah ada melalui tabel kategori

### Menambahkan Materi Baru

1. Di halaman Kelola Materi, klik tombol "Tambah Materi Baru"
2. Isi formulir dengan informasi yang diperlukan:
   - Judul materi
   - Slug (untuk URL)
   - Kategori
   - Deskripsi singkat
   - URL video YouTube (opsional)
   - Konten materi dengan rich text editor
   - Contoh soal (opsional)
3. Klik "Simpan" untuk menyimpan materi

### Mengedit atau Menghapus Materi

Di tabel daftar materi, Anda dapat:
- Klik "Edit" untuk mengedit materi
- Klik "Hapus" untuk menghapus materi

## Pengaturan Database

Sebelum dapat menggunakan sistem, Anda perlu mengatur tabel di Supabase:

### Langkah 1: Buat Tabel

Jalankan SQL yang terdapat dalam file `setup-materials-table.sql` di konsol SQL Supabase Anda.

```sql
-- Check if material_categories table exists, if not create it
CREATE TABLE IF NOT EXISTS material_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if the materials table exists, if not create it
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category_id UUID REFERENCES material_categories(id),
  video_embed TEXT,
  example_problems JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Langkah 2: Mengatur Kebijakan Keamanan (RLS)

Tambahkan kebijakan keamanan untuk tabel `materials` dan `material_categories`:

```sql
-- Materials policies
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Materials are viewable by everyone" 
  ON materials FOR SELECT 
  USING (true);

CREATE POLICY "Materials can be managed by admins" 
  ON materials FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Categories policies
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" 
  ON material_categories FOR SELECT 
  USING (true);

CREATE POLICY "Categories can be managed by admins" 
  ON material_categories FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
```

### Langkah 3: Menambahkan Kategori Awal

Tambahkan beberapa kategori awal dengan menjalankan:

```sql
INSERT INTO material_categories (name, slug, description) 
VALUES 
  ('Aljabar', 'aljabar', 'Materi aljabar dasar hingga lanjutan'),
  ('Geometri', 'geometri', 'Materi geometri dan pengukuran'),
  ('Kalkulus', 'kalkulus', 'Materi kalkulus dasar dan lanjutan'),
  ('Trigonometri', 'trigonometri', 'Materi trigonometri')
ON CONFLICT (slug) DO NOTHING;
```

## Struktur Data dan Format

### Format Contoh Soal

Contoh soal disimpan dalam format JSONB dengan struktur:

```json
[
  {
    "question": "Pertanyaan soal",
    "answer": "Jawaban soal",
    "explanation": "Penjelasan jawaban"
  }
]
```

### Format Video

URL video YouTube dikonversi ke format embed URL dan disimpan di kolom `video_embed`. Sistem secara otomatis mengekstrak ID video YouTube dari berbagai format URL YouTube.

## Mengatasi Masalah Umum

### Materi Tidak Muncul

1. Periksa apakah tabel `materials` dan `material_categories` sudah dibuat
2. Periksa apakah RLS (Row Level Security) sudah dikonfigurasi dengan benar
3. Pastikan Anda login sebagai admin dengan peran yang benar di tabel `user_roles`

### Error Saat Menyimpan Materi

1. Pastikan semua field wajib diisi
2. Pastikan slug materi unik dan tidak duplikat
3. Periksa koneksi ke Supabase 