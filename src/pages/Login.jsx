import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import '../styles/Login.css';

// Import Firebase from centralized configuration
import firebaseApp, { auth, database } from '../config/firebase';

// Using absolute path for logo
const logoPath = '/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  useEffect(() => {
    // Check if Firebase is properly initialized
    if (firebaseApp) {
      setFirebaseInitialized(true);
      
      // Check if user is already logged in
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is already signed in, redirect to dashboard
          navigate('/dashboard');
        }
        setInitialChecking(false);
      });
      
      return () => unsubscribe();
    } else {
      setError('Firebase tidak terinitialisasi dengan benar. Harap refresh halaman atau hubungi administrator.');
      setInitialChecking(false);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value.trim()
    }));
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { email, password } = formData;
    
    // Validate input fields
    if (!email || !password) {
      setError('Semua field harus diisi');
      setLoading(false);
      return;
    }

    if (!firebaseInitialized) {
      setError('Firebase tidak terinitialisasi dengan benar. Harap refresh halaman atau hubungi administrator.');
      setLoading(false);
      return;
    }

    try {
      console.log("Mencoba login dengan email:", email);
      // Attempt to sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Login berhasil, mendapatkan data user dari database");
      // Get user data from Firebase
      const userRef = ref(database, `users/${user.uid}`);
      
      try {
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          
          // Store user data and generate token in localStorage
          localStorage.setItem('token', user.accessToken);
          localStorage.setItem('userId', user.uid);
          localStorage.setItem('user', JSON.stringify({
            id: user.uid,
            name: userData.name || '',
            email: user.email,
            onboarded: userData.onboarded || false
          }));
          
          // Check if user has completed onboarding
          if (userData.onboarded) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        } else {
          // User exists in authentication but not in database
          localStorage.setItem('token', user.accessToken);
          localStorage.setItem('userId', user.uid);
          localStorage.setItem('user', JSON.stringify({
            id: user.uid,
            name: '',
            email: user.email,
            onboarded: false
          }));
          navigate('/onboarding');
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        setError('Gagal mengambil data pengguna. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Email tidak terdaftar. Silakan daftar terlebih dahulu.');
          break;
        case 'auth/wrong-password':
          setError('Password salah. Silakan coba lagi.');
          break;
        case 'auth/invalid-email':
          setError('Format email tidak valid.');
          break;
        case 'auth/invalid-credential':
          setError('Email atau password salah. Silakan coba lagi.');
          break;
        case 'auth/too-many-requests':
          setError('Terlalu banyak percobaan login. Silakan coba lagi nanti.');
          break;
        case 'auth/network-request-failed':
          setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
          break;
        case 'auth/api-key-not-valid':
          setError('Konfigurasi API tidak valid. Silakan hubungi administrator.');
          break;
        default:
          setError(`Terjadi kesalahan (${error.code}). Silakan coba lagi nanti.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render skeleton loading during initial auth check
  if (initialChecking) {
    return (
      <div className="login-container">
        <div className="login-form-container skeleton-container">
          <div className="login-header">
            <div className="skeleton-logo"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
          </div>
          <div className="login-form skeleton-form">
            <div className="skeleton-heading"></div>
            <div className="skeleton-input"></div>
            <div className="skeleton-input"></div>
            <div className="skeleton-button"></div>
            <div className="skeleton-links"></div>
          </div>
        </div>
        <div className="login-info skeleton-info">
          <div className="skeleton-info-content"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-header">
          <img src={logoPath} alt="DiKit Logo" className="login-logo" />
          <h1>DiKit</h1>
          <p>Platform Pembelajaran Matematika Interaktif</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Masuk ke Akun</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukkan email Anda"
              className={error && !formData.email ? 'input-error' : ''}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password Anda"
              className={error && !formData.password ? 'input-error' : ''}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading || !firebaseInitialized}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
          
          {!firebaseInitialized && (
            <div className="firebase-error-message">
              Firebase tidak terinitialisasi dengan benar. Silakan refresh halaman atau periksa koneksi internet Anda.
            </div>
          )}

          <div className="login-links">
            <p>
              Belum punya akun? <Link to="/register">Daftar sekarang</Link>
            </p>
            <p>
              <Link to="/forgot-password">Lupa password?</Link>
            </p>
          </div>
        </form>
      </div>
      
      <div className="login-info">
        <div className="login-info-content">
          <h2>Selamat Datang di DiKit</h2>
          <p>
            Platform pembelajaran matematika yang dirancang untuk membantu siswa
            memahami konsep matematika dengan cara yang menyenangkan dan interaktif.
          </p>
          <div className="login-features">
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <div className="feature-text">
                <h3>Pembelajaran Terarah</h3>
                <p>Materi dan latihan soal sesuai dengan kurikulum</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🏆</div>
              <div className="feature-text">
                <h3>Sistem Gamifikasi</h3>
                <p>Belajar lebih menyenangkan dengan poin dan pencapaian</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h3>Pantau Perkembangan</h3>
                <p>Lacak kemajuan belajar Anda secara real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
