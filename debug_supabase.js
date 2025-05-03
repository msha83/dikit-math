// Script untuk memperbaiki masalah schema cache di Supabase
// Run dengan: node debug_supabase.js

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables jika ada
dotenv.config();

// Supabase configuration - ambil dari file supabase.js
const supabaseUrl = 'https://ttyoqmcuoqjmtnadgypc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW9xbWN1b3FqbXRuYWRneXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU0MTUsImV4cCI6MjA2MDczMTQxNX0.bgSnqmIfAvS_hwKbnjTLUYzhHlnlOfaLHU72HqPQ6v4';

// Buat Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Dummy data untuk proses refresh
const dummyMaterial = {
  title: "Test Material for Cache Refresh",
  slug: "test-material-cache-refresh",
  description: "This is a test material to force cache refresh",
  content: "Test content",
  // Kita tidak gunakan category_id dulu untuk memeriksa skema
  video_embed: "https://www.youtube.com/embed/test",
  example_problems: [{ question: "Test?", answer: "Test answer", explanation: "Test explanation" }]
};

async function debugSupabase() {
  try {
    console.log("===== DEBUGGING SUPABASE SCHEMA CACHE =====");
    
    // 1. Periksa struktur tabel materials
    console.log("1. Memeriksa struktur tabel materials...");
    const { data: materialsInfo, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .limit(1);
    
    if (materialsError) {
      console.error("Error saat query tabel materials:", materialsError);
    } else {
      console.log("✅ Tabel materials dapat diakses");
      console.log("Sample data:", materialsInfo);
    }
    
    // 2. Periksa struktur tabel material_categories
    console.log("\n2. Memeriksa struktur tabel material_categories...");
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('material_categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      console.error("Error saat query tabel material_categories:", categoriesError);
    } else {
      console.log("✅ Tabel material_categories dapat diakses");
      console.log("Categories:", categoriesData);
      
      if (categoriesData && categoriesData.length > 0) {
        // 3. Coba insert dengan category_id dari kategori yang ada
        const categoryId = categoriesData[0].id;
        console.log(`\n3. Mencoba insert dengan category_id: ${categoryId}`);
        
        const testMaterial = {
          ...dummyMaterial,
          category_id: categoryId
        };
        
        // Tambahkan timestamp ke slug agar unik
        testMaterial.slug = `${testMaterial.slug}-${Date.now()}`;
        
        console.log("Data yang akan diinsert:", testMaterial);
        
        const { data: insertData, error: insertError } = await supabase
          .from('materials')
          .insert(testMaterial)
          .select();
        
        if (insertError) {
          console.error("Error saat insert test material:", insertError);
          console.log(`
=========================================================
DIAGNOSIS: Terjadi masalah dengan cache schema.

LANGKAH PERBAIKAN:
1. Buka dashboard Supabase di https://app.supabase.io
2. Pilih project Anda
3. Buka SQL Editor
4. Jalankan query berikut:

   ALTER TABLE materials REPLICA IDENTITY FULL;
   ALTER TABLE materials DISABLE TRIGGER ALL;
   ALTER TABLE materials ENABLE TRIGGER ALL;
   
   -- Optional: refresh seluruh cache schema
   SELECT pg_reload_conf();

5. Restart aplikasi frontend Anda
=========================================================`);
        } else {
          console.log("✅ Test insert berhasil!", insertData);
          
          // 4. Hapus test material
          console.log("\n4. Membersihkan test material...");
          const { error: deleteError } = await supabase
            .from('materials')
            .delete()
            .eq('slug', testMaterial.slug);
          
          if (deleteError) {
            console.error("Error saat delete test material:", deleteError);
          } else {
            console.log("✅ Test material berhasil dihapus");
          }
        }
      } else {
        console.log("⚠️ Tidak ada kategori yang tersedia. Harap tambahkan kategori terlebih dahulu.");
      }
    }
    
  } catch (error) {
    console.error("Terjadi kesalahan tidak terduga:", error);
  }
}

// Jalankan fungsi debug
debugSupabase();
