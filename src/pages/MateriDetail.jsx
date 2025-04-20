import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MateriDetail = () => {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format judul untuk tampilan
  const formatTitle = (text) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    // Data materi sesuai topik
    let materiData = [];
    
    if (topic === 'persamaan-linear') {
      materiData = [
        {
          title: 'Pengertian Persamaan Linear',
          content: (
            <div>
              <p className="mb-4">Persamaan linear satu variabel adalah persamaan yang memiliki satu variabel dengan pangkat tertinggi 1.</p>
              <p className="mb-4">Bentuk umum: ax + b = 0, dimana a ≠ 0, dan a, b adalah konstanta.</p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">Contoh:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>2x + 3 = 7</li>
                  <li>x - 5 = 10</li>
                  <li>3x = 15</li>
                </ul>
              </div>
            </div>
          )
        },
        {
          title: 'Prinsip Kesetaraan',
          content: (
            <div>
              <p className="mb-4">Untuk menyelesaikan persamaan linear, kita menggunakan prinsip kesetaraan:</p>
              <ol className="list-decimal pl-5 mb-4">
                <li className="mb-2">Jika kedua ruas ditambah atau dikurangi dengan bilangan yang sama, maka kesetaraan tetap terjaga.</li>
                <li className="mb-2">Jika kedua ruas dikalikan atau dibagi dengan bilangan yang sama (bukan nol), maka kesetaraan tetap terjaga.</li>
              </ol>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">Contoh:</p>
                <p>Pada persamaan x + 3 = 8, kedua ruas dikurangi 3:</p>
                <p>x + 3 - 3 = 8 - 3</p>
                <p>x = 5</p>
              </div>
            </div>
          )
        },
        {
          title: 'Langkah Penyelesaian',
          content: (
            <div>
              <p className="mb-4">Langkah-langkah menyelesaikan persamaan linear:</p>
              <ol className="list-decimal pl-5 mb-4">
                <li className="mb-2">Sederhanakan kedua ruas persamaan jika diperlukan.</li>
                <li className="mb-2">Pisahkan semua suku yang mengandung variabel ke satu ruas dan konstanta ke ruas lainnya.</li>
                <li className="mb-2">Operasikan suku-suku sejenis.</li>
                <li className="mb-2">Selesaikan persamaan dengan membagi koefisien variabel.</li>
              </ol>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">Contoh:</p>
                <p>Selesaikan 2x + 3 = 7</p>
                <p>2x = 7 - 3</p>
                <p>2x = 4</p>
                <p>x = 4 ÷ 2 = 2</p>
              </div>
            </div>
          )
        }
      ];
    } else if (topic === 'persamaan-kuadrat') {
      materiData = [
        {
          title: 'Pengertian Persamaan Kuadrat',
          content: (
            <div>
              <p className="mb-4">Persamaan kuadrat adalah persamaan polinomial berderajat dua. Bentuk umumnya:</p>
              <p className="mb-4 font-medium">ax² + bx + c = 0, dimana a ≠ 0</p>
              <p className="mb-4">Persamaan kuadrat memiliki paling banyak dua akar (solusi).</p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">Contoh:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>x² - 5x + 6 = 0</li>
                  <li>2x² - x - 3 = 0</li>
                  <li>x² + 4x + 4 = 0</li>
                </ul>
              </div>
            </div>
          )
        },
        {
          title: 'Metode Penyelesaian',
          content: (
            <div>
              <p className="mb-4">Ada beberapa metode untuk menyelesaikan persamaan kuadrat:</p>
              <ol className="list-decimal pl-5 mb-4">
                <li className="mb-2"><span className="font-medium">Faktorisasi</span>: Mengurai persamaan menjadi perkalian dua faktor linear.</li>
                <li className="mb-2"><span className="font-medium">Rumus Kuadrat</span>: Menggunakan rumus x = (-b ± √(b² - 4ac))/2a</li>
                <li className="mb-2"><span className="font-medium">Melengkapkan Kuadrat Sempurna</span>: Mengubah bentuk persamaan menjadi bentuk kuadrat sempurna.</li>
              </ol>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">Contoh Faktorisasi:</p>
                <p>x² - 5x + 6 = 0</p>
                <p>(x - 2)(x - 3) = 0</p>
                <p>x = 2 atau x = 3</p>
              </div>
            </div>
          )
        },
        {
          title: 'Diskriminan',
          content: (
            <div>
              <p className="mb-4">Diskriminan adalah nilai yang menentukan jenis dan jumlah akar persamaan kuadrat.</p>
              <p className="mb-4 font-medium">Diskriminan D = b² - 4ac</p>
              <ul className="list-disc pl-5 mb-4">
                <li className="mb-2">Jika D {'>'} 0, persamaan memiliki dua akar real berbeda.</li>
                <li className="mb-2">Jika D = 0, persamaan memiliki satu akar real (akar kembar).</li>
                <li className="mb-2">Jika D {'<'} 0, persamaan tidak memiliki akar real (memiliki akar kompleks).</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">Contoh:</p>
                <p>Untuk x² - 4x + 4 = 0</p>
                <p>D = (-4)² - 4(1)(4) = 16 - 16 = 0</p>
                <p>D = 0, artinya persamaan memiliki akar kembar.</p>
              </div>
            </div>
          )
        }
      ];
    } else if (topic === 'fungsi-dan-grafik') {
      materiData = [
        {
          title: 'Pengertian Fungsi',
          content: (
            <div>
              <p className="mb-4">Fungsi adalah relasi khusus yang memetakan setiap elemen dari domain ke tepat satu elemen pada kodomain.</p>
              <p className="mb-4">Notasi fungsi: f(x) = y, dimana x adalah variabel bebas (input) dan y adalah variabel terikat (output).</p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">Contoh:</p>
                <p>f(x) = 2x + 3</p>
                <p>f(2) = 2(2) + 3 = 7</p>
              </div>
            </div>
          )
        },
        {
          title: 'Jenis-jenis Fungsi',
          content: (
            <div>
              <p className="mb-4">Beberapa jenis fungsi penting:</p>
              <ol className="list-decimal pl-5 mb-4">
                <li className="mb-2"><span className="font-medium">Fungsi Linear</span>: f(x) = ax + b, grafiknya berupa garis lurus.</li>
                <li className="mb-2"><span className="font-medium">Fungsi Kuadrat</span>: f(x) = ax² + bx + c, grafiknya berupa parabola.</li>
                <li className="mb-2"><span className="font-medium">Fungsi Eksponensial</span>: f(x) = a^x, grafiknya menunjukkan pertumbuhan/peluruhan.</li>
                <li className="mb-2"><span className="font-medium">Fungsi Logaritma</span>: f(x) = log_a(x), invers dari fungsi eksponensial.</li>
              </ol>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">Contoh fungsi kuadrat:</p>
                <p>f(x) = x² - 2x + 1</p>
              </div>
            </div>
          )
        },
        {
          title: 'Grafik Fungsi',
          content: (
            <div>
              <p className="mb-4">Grafik fungsi adalah representasi visual dari semua titik (x, f(x)).</p>
              <p className="mb-4">Untuk menggambar grafik fungsi:</p>
              <ol className="list-decimal pl-5 mb-4">
                <li className="mb-2">Buat tabel nilai x dan f(x) untuk beberapa nilai x.</li>
                <li className="mb-2">Plot titik-titik (x, f(x)) pada bidang koordinat.</li>
                <li className="mb-2">Hubungkan titik-titik dengan kurva halus.</li>
              </ol>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">Karakteristik grafik fungsi kuadrat f(x) = ax² + bx + c:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Berbentuk parabola</li>
                  <li>Terbuka ke atas jika a {'>'} 0</li>
                  <li>Terbuka ke bawah jika a {'<'} 0</li>
                  <li>Titik puncak: (-b/2a, f(-b/2a))</li>
                </ul>
              </div>
            </div>
          )
        }
      ];
    } else {
      materiData = [
        {
          title: 'Materi Tidak Tersedia',
          content: (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p>Maaf, materi untuk topik ini belum tersedia.</p>
              <button 
                onClick={() => navigate('/materi')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Kembali ke Daftar Materi
              </button>
            </div>
          )
        }
      ];
    }
    
    setContent(materiData);
    setLoading(false);
  }, [topic, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {formatTitle(topic)}
          </h1>
          <p className="text-gray-600">
            Kategori: {formatTitle(category)}
          </p>
        </div>
        
        {/* Navigasi bagian */}
        <div className="bg-gray-50 p-4 border-b overflow-x-auto">
          <div className="flex space-x-2">
            {content.map((section, index) => (
              <button
                key={index}
                onClick={() => setActiveSection(index)}
                className={`px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors ${
                  activeSection === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
        
        {/* Konten materi */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{content[activeSection]?.title}</h2>
          <div className="prose max-w-none">
            {content[activeSection]?.content}
          </div>
          
          {/* Navigasi halaman */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeSection === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sebelumnya
            </button>
            
            <button
              onClick={() => navigate('/materi')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700"
            >
              Daftar Materi
            </button>
            
            <button
              onClick={() => setActiveSection(Math.min(content.length - 1, activeSection + 1))}
              disabled={activeSection === content.length - 1}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeSection === content.length - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MateriDetail; 