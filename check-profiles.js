// Script untuk memeriksa tabel profiles
const { createClient } = require('@supabase/supabase-js');

// PENTING: Masukkan URL dan key Supabase Anda di sini
const supabaseUrl = 'https://ttyoqmcuoqjmtnadgypc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW9xbWN1b3FqbXRuYWRneXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU0MTUsImV4cCI6MjA2MDczMTQxNX0.bgSnqmIfAvS_hwKbnjTLUYzhHlnlOfaLHU72HqPQ6v4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  console.log('Memeriksa tabel profiles...');
  
  try {
    // Ambil semua kolom dari tabel profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error memeriksa tabel profiles:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('Tidak ada data dalam tabel profiles');
      return;
    }
    
    console.log('Struktur dan contoh data tabel profiles:');
    console.log('Jumlah data yang diambil:', data.length);
    console.log('Kolom-kolom yang tersedia:', Object.keys(data[0]));
    console.log('Contoh data pertama:', data[0]);
  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
  }
}

// Jalankan fungsi
checkProfiles(); 