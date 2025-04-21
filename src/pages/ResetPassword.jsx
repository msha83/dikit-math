import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidHash, setIsValidHash] = useState(false);

  // Verify hash parameter in URL on component mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsValidHash(true);
    } else {
      setMessage('Tautan reset password tidak valid. Silakan minta tautan baru.');
      setIsSuccess(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setMessage('Semua kolom harus diisi');
      setIsSuccess(false);
      return;
    }
    
    if (password.length < 6) {
      setMessage('Password harus minimal 6 karakter');
      setIsSuccess(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage('Password dan konfirmasi password tidak sama');
      setIsSuccess(false);
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      setMessage('Password berhasil diubah! Anda akan diarahkan ke halaman login.');
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setIsSuccess(false);
      
      if (error.message.includes('rate limit')) {
        setMessage('Terlalu banyak permintaan. Silakan coba lagi nanti.');
      } else if (error.message.includes('invalid token')) {
        setMessage('Sesi reset password tidak valid atau kedaluwarsa. Silakan minta tautan baru.');
      } else {
        setMessage('Gagal mengubah password. Silakan coba lagi nanti.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            Masukkan password baru untuk akun Anda
          </p>
        </div>
        
        {message && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${
            isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        {isValidHash ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Masukkan kembali password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Memproses...' : 'Reset Password'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <a 
              href="/forgot-password" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Kirim Tautan Reset Password Baru
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 