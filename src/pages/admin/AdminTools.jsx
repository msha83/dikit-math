import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDatabase, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { createFlashcardTables } from '../../scripts/createFlashcardTables';

const AdminTools = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreateTables = async () => {
    if (window.confirm('Apakah Anda yakin ingin membuat tabel flashcard? Operasi ini sebaiknya hanya dilakukan sekali.')) {
      setIsCreating(true);
      setResult(null);
      
      try {
        await createFlashcardTables();
        setResult({
          success: true,
          message: 'Tabel flashcard berhasil dibuat di Supabase!'
        });
      } catch (error) {
        console.error('Error creating flashcard tables:', error);
        setResult({
          success: false,
          message: `Gagal membuat tabel: ${error.message}`
        });
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Tools</h1>
      
      <div className="mb-6">
        <Link to="/admin" className="btn btn-secondary">
          <FaArrowLeft className="mr-2" /> Kembali ke Dashboard
        </Link>
      </div>
      
      {result && (
        <div className={`p-4 rounded-md mb-6 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="flex items-center">
            {result.success ? (
              <FaCheckCircle className="mr-2" />
            ) : (
              <FaExclamationTriangle className="mr-2" />
            )}
            <p className="font-medium">{result.success ? 'Sukses!' : 'Error!'}</p>
          </div>
          <p className="mt-1">{result.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manajemen Database</h2>
          
          <div className="mt-4">
            <button 
              className="flex items-center btn btn-primary w-full justify-center"
              onClick={handleCreateTables}
              disabled={isCreating}
            >
              <FaDatabase className="mr-2" />
              {isCreating ? 'Sedang Membuat Tabel...' : 'Buat Tabel Flashcard di Supabase'}
            </button>
            
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Catatan Penting:</p>
              <ul className="list-disc ml-5 mt-2">
                <li>Pastikan Anda telah membuat fungsi SQL yang diperlukan di Supabase (lihat kode di src/scripts/createFlashcardTables.js)</li>
                <li>Atau gunakan SQL langsung dari file src/scripts/createTables.sql</li>
                <li>Operasi ini sebaiknya hanya dilakukan satu kali saat setup awal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Cara Manual Setup Database Supabase</h2>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
          <p className="text-yellow-800 font-medium">Penting! Buat Tabel Melalui SQL Editor Supabase</p>
          <p className="text-yellow-700 mt-2">
            Jika mengalami kesalahan "connection string missing" ketika mencoba membuat tabel,
            gunakan cara alternatif berikut:
          </p>
          <ol className="list-decimal ml-5 mt-2 text-yellow-700 space-y-1">
            <li>Buka dashboard Supabase Anda</li>
            <li>Pilih project yang sesuai</li>
            <li>Klik menu "SQL Editor" di sidebar</li>
            <li>Klik "New Query"</li>
            <li>Copy-paste SQL dari file <strong>src/scripts/supabase-sql.sql</strong></li>
            <li>Jalankan SQL tersebut dengan klik tombol "Run"</li>
          </ol>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md overflow-auto mb-4">
          <p className="text-gray-700 font-medium mb-2">File SQL Sudah Ada di:</p>
          <code className="text-sm font-mono bg-gray-200 p-1 rounded">src/scripts/supabase-sql.sql</code>
        </div>
        
        <p className="text-gray-700">
          SQL tersebut akan:
        </p>
        <ul className="list-disc ml-5 mt-2 text-sm text-gray-600">
          <li>Membuat seluruh tabel flashcard yang diperlukan</li>
          <li>Membuat relasi dan indeks</li>
          <li>Mengatur hak akses dan keamanan</li>
          <li>Menambahkan beberapa data contoh (opsional)</li>
        </ul>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Informasi Teknis</h2>
        
        <div className="bg-gray-100 p-4 rounded-md overflow-auto">
          <pre className="text-sm font-mono">
            {`
-- Struktur tabel flashcard_categories
CREATE TABLE IF NOT EXISTS public.flashcard_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Struktur tabel flashcard_topics
CREATE TABLE IF NOT EXISTS public.flashcard_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category_id UUID REFERENCES public.flashcard_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Struktur tabel flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  topic_id UUID REFERENCES public.flashcard_topics(id) ON DELETE CASCADE,
  difficulty INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
            `}
          </pre>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-700">
            Untuk informasi lebih lanjut, silakan lihat file berikut:
          </p>
          <ul className="list-disc ml-5 mt-2 text-sm">
            <li><code>src/scripts/createFlashcardTables.js</code> - Skrip untuk membuat tabel</li>
            <li><code>src/scripts/createTables.sql</code> - SQL untuk membuat tabel secara manual</li>
            <li><code>src/scripts/supabase-sql.sql</code> - SQL lengkap dengan data contoh</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminTools; 