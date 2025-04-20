import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

// Import Auth Context hook
import { useAuth } from '../context/AuthContext';

// Import Supabase client for profiles table operations
import { supabase } from '../config/supabase';

// Using absolute path for logo
const logoPath = '/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading, isRateLimited, rateLimitRemainingTime } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      // Get user profile from localStorage or fetch it
      const userProfile = JSON.parse(localStorage.getItem('user')) || {};
      
      // Redirect based on onboarding status
      if (userProfile.onboarded) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
    
    setInitialChecking(false);

    // Cleanup timer on unmount
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [user, navigate]);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      setIsInCooldown(true);
      cooldownTimerRef.current = setInterval(() => {
        setCooldownSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            clearInterval(cooldownTimerRef.current);
            setIsInCooldown(false);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [cooldownSeconds]);

  // Handle global rate limiting from AuthContext
  useEffect(() => {
    if (isRateLimited) {
      setCooldownSeconds(rateLimitRemainingTime);
      setError(`Terlalu banyak percobaan. Silakan tunggu ${rateLimitRemainingTime} detik sebelum mencoba lagi.`);
    }
  }, [isRateLimited, rateLimitRemainingTime]);

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
    
    // Prevent submission during cooldown
    if (isInCooldown || isRateLimited) {
      return;
    }
    
    setError('');
    setLoading(true);
    
    const { email, password } = formData;
    
    // Validate input fields
    if (!email || !password) {
      setError('Semua field harus diisi');
      setLoading(false);
      return;
    }

    try {
      console.log("Mencoba login dengan email:", email);
      // Attempt to sign in with AuthContext
      const data = await signIn(email, password);
      
      if (data?.user) {
        console.log("Login berhasil, mengambil data user");
        
        // Check if we already have profile data in the session
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          throw new Error('Gagal mengambil data profil');
        }
        
        // Store user data in localStorage
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('userId', data.user.id);
        
        const userData = {
          id: data.user.id,
          name: profileData?.name || data.user.user_metadata?.full_name || '',
          email: data.user.email,
          onboarded: profileData?.onboarded || false
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Check if user has completed onboarding
        if (userData.onboarded) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Supabase auth errors
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Silakan periksa email Anda.');
      } else if (errorMessage.includes('Too many requests')) {
        setError('Terlalu banyak percobaan login. Silakan coba lagi nanti.');
        setCooldownSeconds(30); // Default cooldown if specific time not provided
      } else if (errorMessage.includes('you can only request this after')) {
        // Extract the number of seconds from the error message
        const waitTimeMatch = errorMessage.match(/after (\d+) seconds/);
        if (waitTimeMatch && waitTimeMatch[1]) {
          const waitTime = parseInt(waitTimeMatch[1], 10);
          setCooldownSeconds(waitTime);
          setError(`Terlalu banyak percobaan. Silakan tunggu ${waitTime} detik sebelum mencoba lagi.`);
        } else {
          setError('Terlalu banyak percobaan. Silakan tunggu beberapa saat sebelum mencoba lagi.');
          setCooldownSeconds(30);
        }
      } else if (errorMessage.includes('network')) {
        setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(`Terjadi kesalahan. Silakan coba lagi nanti.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render skeleton loading during initial auth check
  if (initialChecking || authLoading) {
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
          
          {error && (
            <div className="error-message">
              {error}
              {isInCooldown && (
                <div className="mt-2 text-sm">
                  Silakan coba lagi dalam: {cooldownSeconds} detik
                </div>
              )}
            </div>
          )}
          
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
            disabled={loading || isInCooldown}
          >
            {loading ? 'Memproses...' : isInCooldown ? `Tunggu ${cooldownSeconds}s` : 'Masuk'}
          </button>

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
