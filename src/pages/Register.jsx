import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Import Auth Context hook
import { useAuth } from '../context/AuthContext';

// Import Supabase client for profiles table operations
import { supabase } from '../config/supabase';

// Add import for CSS if needed
import '../styles/Login.css';

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      navigate('/dashboard');
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission during cooldown
    if (isInCooldown) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    console.log("Proses registrasi dimulai...");

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
      console.log("Mencoba membuat akun dengan AuthContext...");
      
      // Create user with AuthContext
      const data = await signUp(formData.email, formData.password, formData.name);
      
      console.log("Akun berhasil dibuat:", data);
      
      if (data?.user) {
        // Store initial user progress
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

        // Insert user profile into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name: formData.name,
              email: formData.email,
              score: 0,
              created_at: new Date().toISOString(),
              last_updated: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('Gagal membuat profil pengguna');
        }

        // Store user data in localStorage
        console.log("Menyimpan data pengguna di localStorage...");
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          email: formData.email,
          name: formData.name
        }));
        
        // Store token and userId in localStorage
        if (data.session) {
          localStorage.setItem('token', data.session.access_token);
          localStorage.setItem('userId', data.user.id);
        }

        console.log("Registrasi berhasil, mengarahkan ke onboarding...");
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setIsLoading(false);
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Auth Error:', error);
      
      let errorMessage = 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.';
      
      // Handle rate limiting errors
      if (error.message.includes('you can only request this after')) {
        // Extract the number of seconds from the error message
        const waitTimeMatch = error.message.match(/after (\d+) seconds/);
        if (waitTimeMatch && waitTimeMatch[1]) {
          const waitTime = parseInt(waitTimeMatch[1], 10);
          setCooldownSeconds(waitTime);
          errorMessage = `Terlalu banyak percobaan. Silakan tunggu ${waitTime} detik sebelum mencoba lagi.`;
        } else {
          errorMessage = 'Terlalu banyak percobaan. Silakan tunggu beberapa saat sebelum mencoba lagi.';
        }
      } else if (error.message.includes('Too Many Requests')) {
        setCooldownSeconds(30); // Default cooldown if specific time not provided
        errorMessage = 'Terlalu banyak percobaan. Silakan tunggu 30 detik sebelum mencoba lagi.';
      } else if (error.message.includes('email already in use') || error.message.includes('already registered')) {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain.';
      } else if (error.message.includes('invalid email')) {
        errorMessage = 'Format email tidak valid.';
      } else if (error.message.includes('weak password')) {
        errorMessage = 'Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Koneksi internet bermasalah. Periksa koneksi internet Anda.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Render skeleton loading during initial auth check
  if (initialChecking || authLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="skeleton-logo"></div>
            <div className="skeleton-text"></div>
            <div className="mt-8">
              <div className="skeleton-form">
                <div className="skeleton-input"></div>
                <div className="skeleton-input"></div>
                <div className="skeleton-input"></div>
                <div className="skeleton-input"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                        {isInCooldown && (
                          <div className="mt-2 text-sm text-red-700">
                            Silakan coba lagi dalam: {cooldownSeconds} detik
                          </div>
                        )}
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
                    disabled={isLoading || isInCooldown}
                    className={`flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${(isLoading || isInCooldown) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Memproses...' : isInCooldown ? `Tunggu ${cooldownSeconds}s` : 'Daftar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-indigo-700">
          <div className="flex flex-col justify-center items-center h-full text-white px-12">
            <h1 className="text-4xl font-bold mb-6">Mulai Perjalanan Belajar Matematika Anda</h1>
            <p className="text-xl mb-8">
              Platform pembelajaran interaktif yang membantu Anda memahami konsep matematika dengan lebih mudah dan menyenangkan
            </p>
            
            <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Pembelajaran Adaptif</h3>
                <p>Materi dan latihan yang disesuaikan dengan kemampuan Anda</p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-xl font-semibold mb-2">Gamifikasi</h3>
                <p>Dapatkan poin, lencana, dan naik level dengan menyelesaikan tantangan</p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="text-xl font-semibold mb-2">Analisis Performa</h3>
                <p>Pantau kemajuan dan identifikasi area yang perlu ditingkatkan</p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Pemahaman Mendalam</h3>
                <p>Visualisasi dan penjelasan interaktif untuk konsep-konsep kompleks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
