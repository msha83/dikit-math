import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Materi = () => {
  const [categories] = useState([
    {
      id: 1,
      title: 'Aljabar',
      description: 'Mempelajari dasar-dasar aljabar dan aplikasinya dalam pemecahan masalah matematika',
      image: 'https://img.freepik.com/free-vector/hand-drawn-mathematics-concept_23-2148163417.jpg',
      topics: [
        {
          id: 101,
          title: 'Persamaan Linear',
          slug: 'persamaan-linear',
          description: 'Menyelesaikan persamaan linear satu variabel',
          completionPercentage: 75,
        },
        {
          id: 102,
          title: 'Persamaan Kuadrat',
          slug: 'persamaan-kuadrat',
          description: 'Mencari solusi dari persamaan kuadrat',
          completionPercentage: 40,
        },
        {
          id: 103,
          title: 'Fungsi dan Grafik',
          slug: 'fungsi-dan-grafik',
          description: 'Memahami konsep fungsi dan menggambar grafiknya',
          completionPercentage: 10,
        },
      ],
    },
    {
      id: 2,
      title: 'Geometri',
      description: 'Mempelajari sifat-sifat dan pengukuran ruang dan bentuk geometris',
      image: 'https://img.freepik.com/free-vector/hand-drawn-geometry-concept_23-2148167396.jpg',
      topics: [
        {
          id: 201,
          title: 'Segitiga',
          slug: 'segitiga',
          description: 'Menghitung luas dan keliling segitiga',
          completionPercentage: 60,
        },
        {
          id: 202,
          title: 'Lingkaran',
          slug: 'lingkaran',
          description: 'Memahami unsur-unsur lingkaran',
          completionPercentage: 30,
        },
      ],
    },
    {
      id: 3,
      title: 'Statistika',
      description: 'Mempelajari cara mengumpulkan, menganalisis, dan menginterpretasikan data',
      image: 'https://img.freepik.com/free-vector/hand-drawn-statistics-concept_23-2148163151.jpg',
      topics: [
        {
          id: 301,
          title: 'Ukuran Pemusatan Data',
          slug: 'ukuran-pemusatan-data',
          description: 'Menghitung mean, median, dan modus',
          completionPercentage: 20,
        },
        {
          id: 302,
          title: 'Penyajian Data',
          slug: 'penyajian-data',
          description: 'Membuat berbagai bentuk diagram',
          completionPercentage: 0,
        },
      ],
    },
  ]);

  const [recommendedTopics] = useState([
    { id: 102, title: 'Persamaan Kuadrat', category: 'Aljabar', slug: 'persamaan-kuadrat' },
    { id: 202, title: 'Lingkaran', category: 'Geometri', slug: 'lingkaran' },
  ]);

  // Fungsi untuk menentukan warna latar berdasarkan persentase
  const getProgressBgColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 30) return 'bg-red-200';
    if (percentage < 70) return 'bg-yellow-200';
    return 'bg-green-200';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Materi Belajar</h1>
      
      {/* Rekomendasi Materi */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Rekomendasi untuk Anda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedTopics.map((topic) => (
            <Link 
              key={topic.id} 
              to={`/materi/${topic.category.toLowerCase()}/${topic.slug}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-blue-500"
            >
              <span className="text-sm text-blue-600">{topic.category}</span>
              <h3 className="text-lg font-medium text-gray-800">{topic.title}</h3>
              <p className="text-sm text-gray-600 mt-1">Lanjutkan belajar</p>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Kategori Materi */}
      {categories.map((category) => (
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
                  to={`/materi/${category.title.toLowerCase()}/${topic.slug}`}
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
      ))}
    </div>
  );
};

export default Materi;
