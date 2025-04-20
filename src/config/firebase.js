// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuZqFvauH-SfdZEnceu5DCqfA_zERu340",
  authDomain: "dikit-math.firebaseapp.com",
  projectId: "dikit-math",
  storageBucket: "dikit-math.firebasestorage.app",
  messagingSenderId: "601886976432",
  appId: "1:601886976432:web:5c9cba685e137746d64e75",
  measurementId: "G-RF5FCB6YZZ",
  // Tambahkan database URL untuk Realtime Database
  databaseURL: "https://dikit-math-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Debugging logs
console.log("=== KONFIGURASI FIREBASE ===");
console.log("API Key:", firebaseConfig.apiKey);
console.log("Auth Domain:", firebaseConfig.authDomain);
console.log("Project ID:", firebaseConfig.projectId);
console.log("Database URL:", firebaseConfig.databaseURL);
console.log("===========================");

// Initialize Firebase
let firebaseApp = null;
let auth = null;
let database = null;
let analytics = null;

try {
  firebaseApp = initializeApp(firebaseConfig);
  console.log("Firebase berhasil diinisialisasi");
  
  // Initialize services
  auth = getAuth(firebaseApp);
  database = getDatabase(firebaseApp);
  
  // Initialize analytics only in browser environment
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(firebaseApp);
  }
  
  console.log("Auth dan Database Firebase siap digunakan");
} catch (error) {
  console.error("Kesalahan saat menginisialisasi Firebase:", error);
  console.error("Detail Error:", error.message);
  
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

export { auth, database, firebaseApp, analytics };
export default firebaseApp;
