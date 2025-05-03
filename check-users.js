// Script untuk memeriksa user dari Supabase Auth
const { createClient } = require('@supabase/supabase-js');

// PENTING: Masukkan URL dan key Supabase Anda di sini
const supabaseUrl = 'https://ttyoqmcuoqjmtnadgypc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW9xbWN1b3FqbXRuYWRneXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU0MTUsImV4cCI6MjA2MDczMTQxNX0.bgSnqmIfAvS_hwKbnjTLUYzhHlnlOfaLHU72HqPQ6v4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthUsers() {
  console.log('Memeriksa user yang sudah terdaftar...');
  
  try {
    // Memeriksa user saat ini
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error memeriksa user:', error.message);
      return;
    }
    
    if (!user) {
      console.log('Tidak ada user yang sedang login');
      return;
    }
    
    console.log('User saat ini:', user);
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
  }
}

// Jalankan fungsi
checkAuthUsers(); 