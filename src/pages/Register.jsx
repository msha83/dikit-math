import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, set } from 'firebase/database';
import { 
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';

// Import Firebase configuration
import { auth, database, firebaseApp } from '../config/firebase';

// Add import for CSS if needed
import '../styles/Login.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    // Check if Firebase is properly initialized
    if (firebaseApp) {
      setFirebaseInitialized(true);
      
      // Check if user is already logged in
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          navigate('/dashboard');
        }
      });
      
      return () => unsubscribe();
    } else {
      setError('Firebase tidak terinitialisasi dengan benar. Harap refresh halaman atau hubungi administrator.');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log("Proses registrasi dimulai...");
    
    // Check if Firebase is initialized
    if (!firebaseInitialized) {
      setError('Firebase tidak terinitialisasi dengan benar. Harap refresh halaman atau hubungi administrator.');
      setIsLoading(false);
      return;
    }

    // Validasi input
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Semua kolom harus diisi');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    try {
      console.log("Mencoba membuat akun dengan Firebase...");
      console.log("Auth objek tersedia:", !!auth);
      
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      console.log("Akun berhasil dibuat:", userCredential);
      const user = userCredential.user;
      
      // Update the user profile with the provided name
      console.log("Memperbarui profil dengan nama...");
      await updateProfile(user, {
        displayName: formData.name
      });
      
      // Save user to Firebase database
      console.log("Menyimpan data pengguna ke database...");
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        id: user.uid,
        username: formData.name,
        email: formData.email,
        score: 0,
        createdAt: user.metadata.creationTime || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      // Store default user progress
      console.log("Menyimpan progres awal pengguna...");
      const initialUserProgress = {
        completedTopics: 0,
        totalTopics: 12,
        dailyStreak: 1,
        xpPoints: 50, // Starting XP
        rank: 'Pemula',
        nextMilestone: 200
      };
      localStorage.setItem('userProgress', JSON.stringify(initialUserProgress));

      // Store user data in localStorage
      console.log("Menyimpan data pengguna di localStorage...");
      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        email: formData.email,
        name: formData.name
      }));
      
      // Store token and userId in localStorage (important for authentication)
      localStorage.setItem('token', user.accessToken);
      localStorage.setItem('userId', user.uid);

      console.log("Registrasi berhasil, mengarahkan ke dashboard...");
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setIsLoading(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Firebase Auth Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.';
      
      // Map Firebase auth errors to user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Operasi tidak diperbolehkan.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Koneksi internet bermasalah. Periksa koneksi internet Anda.';
          break;
        case 'auth/invalid-api-key':
        case 'auth/api-key-not-valid':
          errorMessage = 'Konfigurasi API tidak valid. Silakan hubungi administrator.';
          break;
        case 'auth/app-deleted':
          errorMessage = 'Aplikasi Firebase tidak tersedia. Silakan hubungi administrator.';
          break;
        case 'auth/argument-error':
          errorMessage = 'Terjadi kesalahan validasi input. Periksa kembali data yang dimasukkan.';
          break;
        default:
          errorMessage = `Terjadi kesalahan saat pendaftaran (${error.code}): ${error.message}`;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Daftar Akun Baru</h2>
            <p className="mt-2 text-sm text-gray-600">
              Atau{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                masuk jika sudah memiliki akun
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nama
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Konfirmasi Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading || !firebaseInitialized}
                    className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75"
                  >
                    {isLoading ? 'Memproses...' : 'Daftar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-800 to-blue-600 flex items-center justify-center">
          <div className="px-8 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Bergabunglah dengan Komunitas Belajar Kami</h2>
            <p className="text-xl">Tingkatkan kemampuan matematika Anda melalui metode belajar yang menyenangkan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
