// Script untuk memeriksa folder build (dist)
// Untuk memastikan tidak ada lagi kode yang melakukan insert ke tabel profiles

const fs = require('fs');
const path = require('path');

// Fungsi untuk mencari string dalam file
function searchInFile(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return false;
  }
}

// Fungsi untuk mengumpulkan semua file JS di folder
function collectJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      collectJsFiles(filePath, fileList);
    } else if (path.extname(file) === '.js') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Mencari di folder dist
async function checkBuildFolder() {
  console.log('Memeriksa folder build (dist)...');
  
  const distPath = path.join(__dirname, 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.log('Folder dist tidak ditemukan. Pastikan sudah menjalankan build.');
    return;
  }
  
  // Kumpulkan semua file JS di dist
  const jsFiles = collectJsFiles(distPath);
  console.log(`Ditemukan ${jsFiles.length} file JS di folder dist.`);
  
  // Mencari string .from('profiles').insert di setiap file
  const badPattern = ".from('profiles').insert";
  let foundProblematicFiles = false;
  
  for (const file of jsFiles) {
    const hasProblematicCode = searchInFile(file, badPattern);
    if (hasProblematicCode) {
      console.log(`File bermasalah: ${file}`);
      foundProblematicFiles = true;
    }
  }
  
  if (!foundProblematicFiles) {
    console.log('Tidak ditemukan kode yang melakukan insert ke tabel profiles!');
    console.log('Build sudah bersih! 🎉');
  } else {
    console.log('⚠️ Masih ada file yang melakukan insert ke tabel profiles! ⚠️');
    console.log('Hapus file build dan build ulang setelah memperbaiki semua file.');
  }
}

// Jalankan
checkBuildFolder(); 