import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import MaterialContent from '../components/MaterialContent';
import { ExampleProblem } from '../components/MaterialContent';
import { renderMixedContent } from '../utils/mathUtils.jsx';

const MaterialDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);
        
        if (!slug) {
          throw new Error('Parameter slug diperlukan');
        }
        
        // Fetch material by slug
        const { data, error } = await supabase
          .from('materials')
          .select(`
            *,
            material_categories:category_id(name)
          `)
          .eq('slug', slug)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          throw new Error('Materi tidak ditemukan');
        }
        
        setMaterial(data);
      } catch (error) {
        console.error('Error saat mengambil materi:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterial();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full shadow-lg">
          <h2 className="text-red-700 text-xl font-medium mb-2">Terjadi Kesalahan</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/materials')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Kembali ke Daftar Materi
          </button>
        </div>
      </div>
    );
  }
  
  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-lg w-full shadow-lg">
          <h2 className="text-yellow-700 text-xl font-medium mb-2">Materi Tidak Ditemukan</h2>
          <p className="text-yellow-600 mb-4">Kami tidak dapat menemukan materi yang Anda cari.</p>
          <button
            onClick={() => navigate('/materials')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Jelajahi Materi Lainnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header dengan latar belakang gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-white hover:text-blue-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Kembali
          </button>
          
          <div className="pt-2">
            <div className="mb-2 inline-block px-3 py-1 bg-blue-500 bg-opacity-30 rounded-full text-sm font-medium">
              {material.material_categories?.name || material.category}
            </div>
            <h1 className="text-4xl font-bold mb-4">{material.title}</h1>
            <p className="text-blue-100 text-lg max-w-3xl">{material.description}</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Section video */}
          {material.video_embed && (
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                </svg>
                Video Pembelajaran
              </h2>
              <div className="rounded-xl overflow-hidden shadow-md w-full h-auto" style={{ minHeight: "450px" }}>
                <iframe
                  src={material.video_embed}
                  title={material.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full min-h-[450px]"
                ></iframe>
              </div>
            </div>
          )}
          
          {/* Section konten */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
              </svg>
              Materi Pembelajaran
            </h2>
            <div className="prose prose-lg max-w-none bg-white p-4 rounded-lg">
              <MaterialContent content={material.content} />
            </div>
          </div>
          
          {/* Section contoh soal */}
          {material.example_problems && material.example_problems.length > 0 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                </svg>
                Contoh Soal
              </h2>
              <div className="space-y-6">
                {material.example_problems.map((problem, index) => (
                  <ExampleProblem 
                    key={index} 
                    problem={problem} 
                    index={index} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailPage; 