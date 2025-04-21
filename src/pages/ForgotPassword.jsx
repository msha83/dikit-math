import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Silakan masukkan email Anda');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      setMessage('Tautan reset password telah dikirim ke email Anda. Silakan periksa inbox Anda.');
    } catch (error) {
      console.error('Error sending reset password email:', error);
      setIsSuccess(false);
      
      if (error.message.includes('rate limit')) {
        setMessage('Terlalu banyak permintaan. Silakan coba lagi nanti.');
      } else {
        setMessage('Gagal mengirim email reset password. Pastikan email Anda terdaftar.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lupa Password</h1>
          <p className="text-gray-600">
            Masukkan email Anda untuk menerima tautan reset password
          </p>
        </div>
        
        {message && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${
            isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {isLoading ? 'Memproses...' : 'Kirim Tautan Reset'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
            Kembali ke halaman login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 