// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Hardcoded Firebase configuration to ensure it works
const firebaseConfig = {
  apiKey: "AIzaSyAuZqFvaul-SfdZEnceu5DCqfA_zERu340",
  authDomain: "dikit-math.firebaseapp.com",
  projectId: "dikit-math",
  storageBucket: "dikit-math.firebasestorage.app",
  messagingSenderId: "601886976432",
  appId: "1:601886976432:web:5c9cba685e137746d64e75",
  measurementId: "G-RF5FCB6YZZ",
  databaseURL: "https://dikit-math-default-rtdb.asia-southeast1.firebasedatabase.app"
};

console.log("=== KONFIGURASI FIREBASE ===");
console.log("API Key yang digunakan:", firebaseConfig.apiKey);
console.log("Auth Domain:", firebaseConfig.authDomain);
console.log("Project ID:", firebaseConfig.projectId);
console.log("Database URL:", firebaseConfig.databaseURL);
console.log("===========================");

// Initialize Firebase
let firebaseApp = null;
try {
  if (!firebaseApp) {
    if (!firebaseConfig.apiKey) {
      throw new Error("API Key tidak ditemukan. Pastikan konfigurasi benar.");
    }
    console.log("Mencoba inisialisasi Firebase");
    firebaseApp = initializeApp(firebaseConfig);
    console.log("Firebase berhasil diinisialisasi");
  }
} catch (error) {
  console.error("Kesalahan saat menginisialisasi Firebase:", error);
  
  // Add visible error message to UI when DOM is loaded
  if (typeof window !== 'undefined' && document) {
    window.addEventListener('DOMContentLoaded', () => {
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '0';
      errorDiv.style.left = '0';
      errorDiv.style.right = '0';
      errorDiv.style.backgroundColor = '#f8d7da';
      errorDiv.style.color = '#721c24';
      errorDiv.style.padding = '10px';
      errorDiv.style.textAlign = 'center';
      errorDiv.style.zIndex = '9999';
      errorDiv.innerHTML = `
        <strong>Error Konfigurasi Firebase:</strong> ${error.message} <br>
        <small>Cek browser console untuk detail lebih lanjut.</small>
      `;
      document.body.appendChild(errorDiv);
    });
  }
}

// Export Firebase services
let auth = null;
let database = null;

try {
  // Get Auth and Database instances
  auth = getAuth(firebaseApp);
  database = getDatabase(firebaseApp);
  console.log("Auth dan Database Firebase siap digunakan");
} catch (error) {
  console.error("Kesalahan saat mendapatkan Auth/Database:", error);
}

export { auth, database, firebaseApp };
export default firebaseApp;
