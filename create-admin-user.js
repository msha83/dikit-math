// Script untuk membuat user admin baru
const { createClient } = require('@supabase/supabase-js');

// PENTING: Masukkan URL dan key Supabase Anda di sini
const supabaseUrl = 'https://ttyoqmcuoqjmtnadgypc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW9xbWN1b3FqbXRuYWRneXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU0MTUsImV4cCI6MjA2MDczMTQxNX0.bgSnqmIfAvS_hwKbnjTLUYzhHlnlOfaLHU72HqPQ6v4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

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
    
    console.log('User berhasil dibuat dengan ID:', authData.user.id);
    
    // Step 2: Tambahkan data ke tabel profiles 
    console.log('Menambahkan data ke tabel profiles...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        name: adminName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error('Error menambahkan data profile:', profileError.message);
      // Lanjutkan meskipun ada error
    } else {
      console.log('Data profile berhasil ditambahkan');
    }
    
    // Step 3: Tambahkan peran admin
    console.log('Menambahkan peran admin...');
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        id: authData.user.id,
        role: 'admin',
        created_at: new Date().toISOString()
      });
    
    if (roleError) {
      console.error('Error menambahkan peran admin:', roleError.message);
      return;
    }
    
    console.log(`✅ BERHASIL! User admin telah dibuat dengan email ${adminEmail}`);
    console.log('Kredensial login:');
    console.log('- Email:', adminEmail);
    console.log('- Password:', adminPassword);
    console.log('Akses admin tersedia di: /admin');
  } catch (error) {
    console.error('Terjadi kesalahan tidak terduga:', error.message);
  }
}

// Jalankan fungsi
createAdminUser(); 