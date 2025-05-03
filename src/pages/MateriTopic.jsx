import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import GraphVisualizer from '../components/GraphVisualizer';
import { supabase } from '../config/supabase';

const MateriTopic = () => {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [error, setError] = useState(null);
  
  // Function to format the topic title for display
  const formatTitle = (text) => {
    if (!text) return '';
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    console.log("Loading topic:", topic, "category:", category);
    
    // Coba cari materi dengan slug yang sesuai dan redirect
    const findAndRedirectToNewURL = async () => {
      try {
        // Find material with matching slug
        const { data, error } = await supabase
          .from('materials')
          .select('id, slug')
          .eq('slug', topic)
          .single();
          
        if (data && data.slug) {
          // Redirect to the new URL format
          navigate(`/material/${data.slug}`, { replace: true });
          return true;
        }
        
        // If not found by exact slug, try to find similar materials
        const { data: similarData, error: similarError } = await supabase
          .from('materials')
          .select('id, slug, title')
          .ilike('slug', `%${topic}%`)
          .limit(1);
          
        if (similarData && similarData.length > 0) {
          // Redirect to similar material
          navigate(`/material/${similarData[0].slug}`, { replace: true });
          return true;
        }
        
        return false;
      } catch (err) {
        console.error("Error finding material:", err);
        return false;
      }
    };
    
    const loadContent = async () => {
      // Reset states when changing topics
      setLoading(true);
      setError(null);
      setActiveVideo(null);
      
      // First try to redirect to new URL format
      const redirected = await findAndRedirectToNewURL();
      if (redirected) return;
      
      // If redirect failed, load the old static content
      try {
        // Simulate loading data from an API
        setTimeout(() => {
          // Dummy data based on topic
          let topicContent = {};
          
          if (topic === 'persamaan-linear') {
            topicContent = {
              title: 'Persamaan Linear',
              sections: [
                {
                  title: 'Pengertian Persamaan Linear',
                  content: 'Persamaan linear adalah persamaan aljabar di mana setiap suku mengandung variabel dengan pangkat tertinggi satu. Bentuk umum persamaan linear satu variabel adalah ax + b = 0, di mana a dan b adalah konstanta dan a ≠ 0.'
                },
                {
                  title: 'Prinsip Kesetaraan',
                  content: 'Persamaan linear mengikuti prinsip kesetaraan, di mana operasi yang sama pada kedua sisi persamaan akan menghasilkan persamaan yang setara. Operasi yang diperbolehkan meliputi penjumlahan, pengurangan, perkalian, dan pembagian (kecuali dengan nol).'
                },
                {
                  title: 'Langkah-langkah Penyelesaian',
                  content: 'Untuk menyelesaikan persamaan linear satu variabel: 1) Sederhanakan kedua sisi persamaan, 2) Kumpulkan suku dengan variabel di satu sisi, 3) Kumpulkan suku konstanta di sisi lain, 4) Bagi kedua sisi dengan koefisien variabel.'
                },
                {
                  title: 'Contoh Soal',
                  examples: [
                    {
                      problem: '2x + 3 = 7',
                      solution: [
                        '2x + 3 = 7',
                        '2x = 7 - 3',
                        '2x = 4',
                        'x = 2'
                      ]
                    },
                    {
                      problem: '3(x - 1) = 2x + 4',
                      solution: [
                        '3(x - 1) = 2x + 4',
                        '3x - 3 = 2x + 4',
                        '3x - 2x = 4 + 3',
                        'x = 7'
                      ]
                    }
                  ]
                }
              ],
              videos: [
                { 
                  id: 'video-linear-1',
                  title: 'Cara Menyelesaikan Persamaan Linear',
                  thumbnail: 'https://img.youtube.com/vi/placeholder1/mqdefault.jpg',
                  videoId: 'placeholder1',
                  duration: '10:25',
                  tags: ['Penyelesaian', 'Dasar']
                },
                { 
                  id: 'video-linear-2',
                  title: 'Persamaan Linear dalam Kehidupan Sehari-hari',
                  thumbnail: 'https://img.youtube.com/vi/placeholder2/mqdefault.jpg',
                  videoId: 'placeholder2',
                  duration: '8:15',
                  tags: ['Aplikasi', 'Contoh Soal']
                },
                { 
                  id: 'video-linear-3',
                  title: 'Konsep Persamaan Linear',
                  thumbnail: 'https://img.youtube.com/vi/placeholder3/mqdefault.jpg',
                  videoId: 'placeholder3',
                  duration: '12:40',
                  tags: ['Konsep', 'Teori']
                }
              ]
            };
          } else if (topic === 'persamaan-kuadrat') {
            topicContent = {
              title: 'Persamaan Kuadrat',
              sections: [
                {
                  title: 'Pengertian Persamaan Kuadrat',
                  content: 'Persamaan kuadrat adalah persamaan polinomial berderajat dua. Bentuk umum persamaan kuadrat adalah ax² + bx + c = 0, di mana a, b, dan c adalah konstanta dan a ≠ 0.'
                },
                {
                  title: 'Metode Penyelesaian',
                  content: 'Persamaan kuadrat dapat diselesaikan dengan beberapa metode: 1) Faktorisasi, 2) Rumus kuadratik, 3) Melengkapkan kuadrat sempurna.'
                },
                {
                  title: 'Rumus Kuadratik',
                  content: 'Untuk persamaan ax² + bx + c = 0, rumus kuadratik menyatakan bahwa x = (-b ± √(b² - 4ac)) / 2a. Diskriminan, b² - 4ac, menentukan tipe akar persamaan.'
                },
                {
                  title: 'Contoh Soal',
                  examples: [
                    {
                      problem: 'x² - 5x + 6 = 0',
                      solution: [
                        'x² - 5x + 6 = 0',
                        '(x - 2)(x - 3) = 0',
                        'x = 2 atau x = 3'
                      ]
                    },
                    {
                      problem: '2x² + x - 3 = 0',
                      solution: [
                        '2x² + x - 3 = 0',
                        'a = 2, b = 1, c = -3',
                        'x = (-1 ± √(1 + 24)) / 4',
                        'x = (-1 ± 5) / 4',
                        'x = 1 atau x = -3/2'
                      ]
                    }
                  ]
                }
              ],
              videos: [
                { 
                  id: 'video-kuadrat-1',
                  title: 'Rumus Persamaan Kuadrat',
                  thumbnail: 'https://img.youtube.com/vi/placeholder4/mqdefault.jpg',
                  videoId: 'placeholder4',
                  duration: '9:30',
                  tags: ['Rumus', 'Penyelesaian']
                },
                { 
                  id: 'video-kuadrat-2',
                  title: 'Menyelesaikan Persamaan Kuadrat dengan Faktorisasi',
                  thumbnail: 'https://img.youtube.com/vi/placeholder5/mqdefault.jpg',
                  videoId: 'placeholder5',
                  duration: '11:20',
                  tags: ['Faktorisasi', 'Contoh Soal']
                },
                { 
                  id: 'video-kuadrat-3',
                  title: 'Aplikasi Persamaan Kuadrat',
                  thumbnail: 'https://img.youtube.com/vi/placeholder6/mqdefault.jpg',
                  videoId: 'placeholder6',
                  duration: '7:45',
                  tags: ['Aplikasi', 'Praktik']
                }
              ]
            };
          } else if (topic === 'fungsi-dan-grafik') {
            topicContent = {
              title: 'Fungsi dan Grafik',
              sections: [
                {
                  title: 'Pengertian Fungsi',
                  content: 'Fungsi adalah hubungan khusus antara dua himpunan di mana setiap elemen dalam domain dipetakan ke tepat satu elemen dalam kodomain. Fungsi dapat dinyatakan sebagai f(x) = y, di mana x adalah elemen domain dan y adalah elemen kodomain.'
                },
                {
                  title: 'Komponen Fungsi',
                  content: 'Fungsi memiliki tiga komponen utama: 1) Domain (daerah asal): himpunan nilai x yang dimasukkan ke dalam fungsi, 2) Kodomain: himpunan semua nilai y yang mungkin, 3) Range (daerah hasil): himpunan nilai y yang benar-benar dihasilkan dari fungsi.'
                },
                {
                  title: 'Jenis-jenis Fungsi',
                  content: 'Beberapa jenis fungsi yang umum adalah: 1) Fungsi linear: f(x) = ax + b, 2) Fungsi kuadrat: f(x) = ax² + bx + c, 3) Fungsi eksponensial: f(x) = aˣ, 4) Fungsi logaritma: f(x) = log_a(x).'
                },
                {
                  title: 'Grafik Fungsi',
                  content: 'Grafik fungsi adalah representasi visual dari fungsi pada bidang koordinat. Setiap titik (x, y) pada grafik memenuhi persamaan y = f(x).'
                },
                {
                  title: 'Contoh Soal Fungsi Linear',
                  examples: [
                    {
                      problem: 'Tentukan persamaan garis yang melalui titik (2, 5) dan memiliki gradien 3.',
                      solution: [
                        'Fungsi linear berbentuk f(x) = mx + c',
                        'Diketahui m = 3 dan titik (2, 5)',
                        'Substitusi titik ke persamaan: 5 = 3(2) + c',
                        '5 = 6 + c',
                        'c = -1',
                        'Jadi, persamaan garis adalah f(x) = 3x - 1'
                      ]
                    }
                  ]
                }
              ],
              videos: [
                { 
                  id: 'video-fungsi-1',
                  title: 'Pengenalan Fungsi dan Grafik',
                  thumbnail: 'https://img.youtube.com/vi/placeholder7/mqdefault.jpg',
                  videoId: 'placeholder7',
                  duration: '14:30',
                  tags: ['Konsep', 'Dasar']
                },
                { 
                  id: 'video-fungsi-2',
                  title: 'Cara Menggambar Grafik Fungsi',
                  thumbnail: 'https://img.youtube.com/vi/placeholder8/mqdefault.jpg',
                  videoId: 'placeholder8',
                  duration: '10:15',
                  tags: ['Praktik', 'Menggambar Grafik']
                }
              ]
            };
          } else {
            // Default content for unknown topics
            setError(`Materi untuk topik "${formatTitle(topic)}" belum tersedia. Silakan pilih topik lain.`);
            setLoading(false);
            return;
          }
          
          // Set the active video to the first video if available
          if (topicContent.videos && topicContent.videos.length > 0) {
            setActiveVideo(topicContent.videos[0]);
          }
          
          setContent(topicContent);
          setLoading(false);
          
          // Show notice about new format
          setError(`Materi ini akan segera tersedia dalam format baru. Silakan kunjungi halaman "Konten Matematika" untuk melihat materi terbaru.`);
        }, 800);
      } catch (err) {
        console.error("Error loading topic content:", err);
        setError("Terjadi kesalahan saat memuat materi. Silakan coba lagi nanti.");
        setLoading(false);
      }
    };
    
    loadContent();
    
    // Scroll to top when changing topics
    window.scrollTo(0, 0);
  }, [topic, category, navigate]);

  const handleVideoSelect = (video) => {
    setActiveVideo(video);
    // Scroll to video section
    const videoSection = document.getElementById('video-section');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Tampilan loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat materi {formatTitle(topic)}...</p>
        </div>
      </div>
    );
  }

  // Tampilan error
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Materi Tidak Tersedia</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/materi" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Kembali ke Daftar Materi
          </Link>
        </div>
      </div>
    );
  }

  // Pengecekan content
  if (!content || !content.sections || content.sections.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Tidak Lengkap</h2>
          <p className="text-gray-600 mb-6">
            Konten untuk topik "{formatTitle(topic)}" tidak lengkap atau terjadi kesalahan saat memuat.
          </p>
          <Link 
            to="/materi" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Kembali ke Daftar Materi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/materi" className="text-blue-600 hover:underline flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Kembali ke Materi
        </Link>
      </div>
      
      {/* Notice about new format */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Kami telah memperbarui format materi. Silakan kunjungi{' '}
              <Link to="/materials" className="font-medium underline">
                Konten Matematika
              </Link>{' '}
              untuk melihat materi terbaru.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb dan Navigasi */}
        <div className="mb-6">
          <nav className="text-sm text-gray-500 mb-4">
            <Link to="/materi" className="hover:text-blue-600 transition-colors">
              Materi
            </Link>
            <span className="mx-2">&gt;</span>
            <Link to={`/materi/${category}`} className="hover:text-blue-600 transition-colors capitalize">
              {formatTitle(category)}
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900 font-medium">{content.title}</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
          <p className="text-gray-600">Kategori: {formatTitle(category)}</p>
        </div>
        
        {/* Video Section */}
        {content.videos && content.videos.length > 0 && (
          <div id="video-section" className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-5 bg-blue-600 text-white">
              <h2 className="text-xl font-bold">Video Pembelajaran</h2>
              <p className="text-blue-100">Pelajari materi melalui penjelasan video</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Featured Video */}
                <div className="lg:col-span-2 bg-gray-100 rounded-lg overflow-hidden">
                  {activeVideo ? (
                    <div>
                      <div className="aspect-w-16 aspect-h-9 bg-black">
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={activeVideo.thumbnail} 
                            alt={activeVideo.title}
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold">{activeVideo.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <span className="mr-4">{activeVideo.duration}</span>
                          <div className="flex flex-wrap gap-2">
                            {activeVideo.tags && activeVideo.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-gray-500">Pilih video untuk ditampilkan</p>
                    </div>
                  )}
                </div>
                
                {/* Video List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Daftar Video</h3>
                  
                  {content.videos.map((video) => (
                    <div 
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className={`cursor-pointer p-3 rounded-lg transition-colors ${
                        activeVideo && activeVideo.id === video.id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-24 h-16 bg-gray-200 rounded overflow-hidden">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{video.title}</h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>{video.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Content Sections */}
        <div className="space-y-8">
          {content.sections && content.sections.map((section, index) => {
            // Get background color based on index
            const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-blue-50';
            const borderClass = index % 3 === 0 ? 'border-blue-200' : index % 3 === 1 ? 'border-purple-200' : 'border-green-200';
            
            return (
              <div key={index} className={`rounded-lg shadow-md overflow-hidden ${bgClass} border-l-4 ${borderClass}`}>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    {index % 3 === 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : index % 3 === 1 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                    {section.title}
                  </h2>
                  
                  {section.content && (
                    <div className="prose max-w-none text-gray-700 mb-6">
                      <p>{section.content}</p>
                    </div>
                  )}
                  
                  {section.examples && section.examples.length > 0 && (
                    <div className={`${section.examples.length > 1 ? 'grid md:grid-cols-2 gap-6' : ''} mt-4`}>
                      {section.examples.map((example, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Contoh {idx + 1}</h3>
                          <div className="bg-blue-50 p-3 rounded-md mb-3">
                            <p className="font-medium text-blue-800">{example.problem}</p>
                          </div>
                          
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Penyelesaian:</h4>
                          <div className="space-y-2">
                            {example.solution.map((step, stepIdx) => (
                              <div key={stepIdx} className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                                  {stepIdx + 1}
                                </div>
                                <p className="text-gray-700">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* GraphVisualizer for topic 'fungsi-dan-grafik' */}
        {topic === 'fungsi-dan-grafik' && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5 bg-green-600 text-white">
                <h2 className="text-xl font-bold">Visualisasi Grafik Fungsi</h2>
                <p className="text-green-100">Coba visualisasikan berbagai fungsi</p>
              </div>
              <div className="p-6">
                <GraphVisualizer />
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Link 
            to="/materi"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            &larr; Kembali ke Daftar Materi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MateriTopic; 