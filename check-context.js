// Script untuk memeriksa file AuthContext.jsx
// Pastikan output sesuai dengan yang kita harapkan

const fs = require('fs');
const path = require('path');

function checkAuthContextFile() {
  try {
    // Path ke file AuthContext.jsx
    const authContextPath = path.join(__dirname, 'src', 'context', 'AuthContext.jsx');
    
    // Baca file
    const fileContent = fs.readFileSync(authContextPath, 'utf8');
    
    // Cek apakah implementasi signUp sudah benar
    const hasCorrectSignUpImplementation = fileContent.includes('options: {') && 
                                          fileContent.includes('data: { name }') &&
                                          !fileContent.includes('.from(\'profiles\')');
    
    console.log('=====================================');
    console.log('Pemeriksaan File AuthContext.jsx:');
    console.log('=====================================');
    console.log(`File ditemukan: ${fs.existsSync(authContextPath)}`);
    console.log(`Implementasi signUp benar: ${hasCorrectSignUpImplementation}`);
    
    // Cari apakah ada insert ke profiles table secara manual
    const insertToProfilesPattern = /\.from\([\'\"]profiles[\'\"]\)\.insert/;
    const hasProfilesInsert = insertToProfilesPattern.test(fileContent);
    
    console.log(`Masih ada insert ke tabel profiles: ${hasProfilesInsert}`);
    
    // Lihat implementasi signUp yang ada
    const signUpFunctionPattern = /const signUp = async[\s\S]*?\};/m;
    const signUpFunction = fileContent.match(signUpFunctionPattern);
    
    if (signUpFunction) {
      console.log('\nImplementasi signUp saat ini:');
      console.log('-------------------------------');
      console.log(signUpFunction[0]);
    }
    
  } catch (error) {
    console.error('Error checking AuthContext.jsx:', error.message);
  }
}

// Periksa juga file Register.jsx
function checkRegisterFile() {
  try {
    // Path ke file Register.jsx
    const registerPath = path.join(__dirname, 'src', 'pages', 'Register.jsx');
    
    // Baca file
    const fileContent = fs.readFileSync(registerPath, 'utf8');
    
    // Cek apakah implementasi masih melakukan insert ke profiles
    const hasProfilesInsert = fileContent.includes('.from(\'profiles\').insert');
    
    console.log('\n=====================================');
    console.log('Pemeriksaan File Register.jsx:');
    console.log('=====================================');
    console.log(`File ditemukan: ${fs.existsSync(registerPath)}`);
    console.log(`Masih ada insert ke tabel profiles: ${hasProfilesInsert}`);
    
    // Cari bagian yang memanggil signUp
    const signUpCallPattern = /const data = await signUp.*?\);/s;
    const signUpCall = fileContent.match(signUpCallPattern);
    
    if (signUpCall) {
      console.log('\nPemanggilan signUp saat ini:');
      console.log('---------------------------');
      console.log(signUpCall[0]);
    }
    
  } catch (error) {
    console.error('Error checking Register.jsx:', error.message);
  }
}

// Jalankan kedua fungsi
checkAuthContextFile();
checkRegisterFile(); 