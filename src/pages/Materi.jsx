import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';

const Materi = () => {
  const [categories, setCategories] = useState([]);
  const [recommendedTopics, setRecommendedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch categories dari Supabase
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('material_categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        
        // 2. Untuk setiap kategori, ambil materi yang terkait
        const enrichedCategories = await Promise.all(
          (categoriesData || []).map(async (category) => {
            // Ambil materi berdasarkan category_id
            const { data: materials, error: materialsError } = await supabase
              .from('materials')
              .select('id, title, slug, description')
              .eq('category_id', category.id)
              .limit(10); // Batasi jumlah materi yang diambil
              
            if (materialsError) throw materialsError;
            
            // Format data untuk UI
            return {
              id: category.id,
              title: category.name,
              description: category.description || 'Mempelajari konsep dasar dan aplikasi dalam matematika',
              image: category.image_url || 'https://img.freepik.com/free-vector/hand-drawn-mathematics-concept_23-2148163417.jpg',
              topics: (materials || []).map(material => ({
                id: material.id,
                title: material.title,
                slug: material.slug,
                description: material.description,
                completionPercentage: 0 // Default progress
              }))
            };
          })
        );
        
        // Filter kategori yang memiliki topik/materi
        const categoriesWithTopics = enrichedCategories.filter(
          category => category.topics && category.topics.length > 0
        );
        
        setCategories(categoriesWithTopics);
        
        // 3. Ambil rekomendasi materi (misalnya 2 materi terbaru)
        const { data: recentMaterials, error: recentError } = await supabase
          .from('materials')
          .select(`
            id, 
            title, 
            slug, 
            category_id,
            material_categories(name)
          `)
          .order('created_at', { ascending: false })
          .limit(2);
          
        if (recentError) throw recentError;
        
        // Format data rekomendasi
        const formattedRecommendations = (recentMaterials || []).map(material => ({
          id: material.id,
          title: material.title,
          category: material.material_categories?.name || 'Kategori',
          slug: material.slug
        }));
        
        setRecommendedTopics(formattedRecommendations);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fungsi untuk menentukan warna latar berdasarkan persentase
  const getProgressBgColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 30) return 'bg-red-200';
    if (percentage < 70) return 'bg-yellow-200';
    return 'bg-green-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Materi Belajar</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Materi Belajar</h1>
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-medium text-red-700 mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-600 mb-4">Gagal memuat data materi. Silakan coba lagi nanti.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 pt-4">Materi Belajar</h1>
      
      {/* Rekomendasi Materi */}
      {recommendedTopics.length > 0 && (
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedTopics.map((topic) => (
              <Link 
                key={topic.id} 
                to={`/material/${topic.slug}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-blue-500"
              >
                <span className="text-sm text-blue-600">{topic.category}</span>
                <h3 className="text-lg font-medium text-gray-800">{topic.title}</h3>
                <p className="text-sm text-gray-600 mt-1">Lanjutkan belajar</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Kategori Materi */}
      {categories.length > 0 ? (
        categories.map((category) => (
          <section key={category.id} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">{category.title}</h2>
            </div>
            
            <div className="flex flex-col md:flex-row mb-6">
              <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-40 bg-gray-200 relative">
                    <img 
                      src={category.image} 
                      alt={category.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-medium text-gray-800 mb-2">{category.title}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.topics.map((topic) => (
                  <Link 
                    key={topic.id} 
                    to={`/material/${topic.slug}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-1">{topic.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                      
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">
                          Progres: {topic.completionPercentage}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${getProgressBgColor(topic.completionPercentage)} h-2 rounded-full`} 
                            style={{ width: `${topic.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-medium text-yellow-700 mb-2">Belum Ada Materi</h3>
          <p className="text-yellow-600 mb-4">
            Materi belum tersedia saat ini. Silakan cek kembali nanti.
          </p>
          <Link 
            to="/materials"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Lihat Konten Matematika
          </Link>
        </div>
      )}
    </div>
  );
};

export default Materi;
