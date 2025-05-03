// Script untuk menambahkan user admin (VERSI CommonJS)
// Jalankan dengan: node add-admin-cjs.js

const { createClient } = require('@supabase/supabase-js');

// PENTING: Masukkan URL dan key Supabase Anda di sini
const supabaseUrl = 'https://ttyoqmcuoqjmtnadgypc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW9xbWN1b3FqbXRuYWRneXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU0MTUsImV4cCI6MjA2MDczMTQxNX0.bgSnqmIfAvS_hwKbnjTLUYzhHlnlOfaLHU72HqPQ6v4';

// Email user yang akan dijadikan admin
const userEmail = 'pashaalmadani@gmail.com';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdmin() {
  console.log(`Mencoba menjadikan ${userEmail} sebagai admin...`);
  
  try {
    // Cari user berdasarkan email
    console.log('Mencari user di database...');
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (userError) {
      console.error('Error mencari user:', userError.message);
      return;
    }
    
    if (!userData) {
      console.error(`User dengan email ${userEmail} tidak ditemukan`);
      return;
    }
    
    const userId = userData.id;
    console.log(`User ditemukan dengan ID: ${userId}`);
    
    // Tambahkan peran admin
    console.log('Menambahkan peran admin...');
    const { error: insertError } = await supabase
      .from('user_roles')
      .upsert({ 
        id: userId, 
        role: 'admin',
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error menambahkan peran admin:', insertError.message);
      return;
    }
    
    console.log(`✅ Berhasil! User ${userEmail} sekarang memiliki peran admin`);
    console.log('Akses admin tersedia di: /admin');
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
  }
}

// Jalankan fungsi
makeAdmin(); 