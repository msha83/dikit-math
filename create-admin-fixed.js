// Script untuk membuat user admin baru (versi diperbaiki)
const { createClient } = require('@supabase/supabase-js');

// PENTING: Masukkan URL dan key Supabase Anda di sini
const supabaseUrl = 'https://ttyoqmcuoqjmtnadgypc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW9xbWN1b3FqbXRuYWRneXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU0MTUsImV4cCI6MjA2MDczMTQxNX0.bgSnqmIfAvS_hwKbnjTLUYzhHlnlOfaLHU72HqPQ6v4';

// Service role key (admin) untuk bypass RLS - PERHATIAN: jangan share service key ini!
// Jika Anda memiliki service key, ganti dengan service key yang asli:
// const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW9xbWN1b3Fx...';

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseKey);
// const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

// User admin yang akan dibuat
const adminEmail = 'pashaalmadani@gmail.com';
const adminPassword = 'admin123';
const adminName = 'Pasha Almadani';

async function createAdminUser() {
  console.log(`Membuat user admin dengan email ${adminEmail}...`);
  
  try {
    // Step 1: Daftarkan user baru
    console.log('Mendaftarkan user...');
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: adminName
        }
      }
    });
    
    if (signUpError) {
      console.error('Error mendaftarkan user:', signUpError.message);
      return;
    }
    
    if (!authData.user) {
      console.error('Gagal membuat user');
      return;
    }
    
    const userId = authData.user.id;
    console.log('User berhasil dibuat dengan ID:', userId);
    
    // Step 2: Periksa struktur tabel profiles terlebih dahulu
    console.log('Memeriksa struktur tabel profiles...');
    
    try {
      // Coba tambahkan data ke tabel profiles dengan field minimal
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: adminEmail,
          name: adminName
        });
      
      if (profileError) {
        console.error('Error menambahkan data profile:', profileError.message);
      } else {
        console.log('Data profile berhasil ditambahkan');
      }
    } catch (profileErr) {
      console.error('Error saat menambahkan profile:', profileErr.message);
    }
    
    console.log(`
=====================================================================
PENTING: Admin API key diperlukan untuk menambahkan peran admin
=====================================================================

User telah dibuat dengan ID: ${userId}
Email: ${adminEmail}
Password: ${adminPassword}

Untuk menambahkan peran admin, jalankan SQL berikut di console Supabase:

INSERT INTO user_roles (id, role, created_at)
VALUES ('${userId}', 'admin', NOW());

Atau gunakan script browser yang telah disediakan (make-admin.html)
dengan mengisi Service Role (Admin) key untuk bypass RLS.

Akses admin tersedia di: /admin setelah peran admin ditambahkan.
    `);
    
  } catch (error) {
    console.error('Terjadi kesalahan tidak terduga:', error.message);
  }
}

// Jalankan fungsi
createAdminUser(); 