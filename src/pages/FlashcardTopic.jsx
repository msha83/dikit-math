import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const FlashcardTopic = () => {
  const { category, topic } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sesuaikan judul untuk tampilan yang lebih baik
  const formatTitle = (text) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    // Simulasi loading data dari API
    setLoading(true);
    
    // Data dummy untuk flashcard
    let dummyData = [];
    
    if (topic === 'persamaan-linear') {
      dummyData = [
        {
          id: 1,
          front: "Apa yang dimaksud dengan persamaan linear?",
          back: "Persamaan linear adalah persamaan yang variabelnya berpangkat satu. Bentuk umumnya adalah ax + b = 0, di mana a ≠ 0."
        },
        {
          id: 2,
          front: "Bagaimana ciri-ciri persamaan linear?",
          back: "Ciri-ciri persamaan linear: (1) Variabel berpangkat satu, (2) Tidak ada perkalian antar variabel, (3) Grafiknya berupa garis lurus."
        },
        {
          id: 3,
          front: "Apa yang dimaksud dengan koefisien pada persamaan linear?",
          back: "Koefisien adalah bilangan yang menyertai variabel. Pada persamaan ax + b = 0, a adalah koefisien dari x."
        },
        {
          id: 4,
          front: "Bagaimana langkah-langkah umum untuk menyelesaikan persamaan linear?",
          back: "1. Sederhanakan kedua ruas persamaan\n2. Pisahkan suku yang mengandung variabel ke satu ruas\n3. Pisahkan konstanta ke ruas lainnya\n4. Bagi kedua ruas dengan koefisien variabel\n5. Verifikasi jawaban"
        },
        {
          id: 5,
          front: "Bagaimana cara menyelesaikan persamaan linear 3x + 5 = 2x - 1?",
          back: "3x + 5 = 2x - 1\n3x - 2x = -1 - 5\nx = -6"
        }
      ];
    } else if (topic === 'persamaan-kuadrat') {
      dummyData = [
        {
          id: 1,
          front: "Apa itu persamaan kuadrat?",
          back: "Persamaan kuadrat adalah persamaan polinomial orde dua dalam bentuk ax² + bx + c = 0, di mana a ≠ 0 dan a, b, c adalah konstanta."
        },
        {
          id: 2,
          front: "Apa itu diskriminan dalam persamaan kuadrat?",
          back: "Diskriminan adalah nilai b² - 4ac yang menentukan jenis akar-akar persamaan kuadrat."
        },
        {
          id: 3,
          front: "Apa rumus akar-akar persamaan kuadrat?",
          back: "Rumus akar-akar persamaan kuadrat ax² + bx + c = 0 adalah x = (-b ± √(b² - 4ac)) / 2a"
        }
      ];
    } else if (topic === 'fungsi-dan-grafik') {
      dummyData = [
        {
          id: 1,
          front: "Apa yang dimaksud dengan fungsi?",
          back: "Fungsi adalah aturan yang menghubungkan setiap elemen dari satu himpunan (domain) dengan tepat satu elemen dari himpunan lain (kodomain)."
        },
        {
          id: 2,
          front: "Apa yang dimaksud dengan domain fungsi?",
          back: "Domain adalah himpunan semua nilai input yang mungkin dari sebuah fungsi."
        },
        {
          id: 3,
          front: "Bagaimana bentuk umum fungsi linear?",
          back: "Bentuk umum fungsi linear adalah f(x) = mx + c, di mana m adalah gradien dan c adalah titik potong dengan sumbu y."
        }
      ];
    } else {
      dummyData = [
        {
          id: 1,
          front: "Tidak ada flashcard untuk topik ini",
          back: "Silakan pilih topik lainnya"
        }
      ];
    }
    
    setFlashcards(dummyData);
    setLoading(false);
  }, [topic]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };
  
  // CSS untuk animasi flip
  const flipCardStyles = {
    container: {
      width: '100%',
      height: '300px',
      perspective: '1000px',
      marginBottom: '2rem'
    },
    flipper: {
      position: 'relative',
      width: '100%',
      height: '100%',
      transition: 'transform 0.6s',
      transformStyle: 'preserve-3d',
      transform: isFlipped ? 'rotateY(180deg)' : ''
    },
    front: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      zIndex: 2
    },
    back: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      transform: 'rotateY(180deg)'
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/flashcard" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Kembali ke Daftar Flashcard
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Flashcard: {formatTitle(topic)}
      </h1>
      <p className="text-gray-600 mb-6">Kategori: {category}</p>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="text-gray-600 text-center mb-4">
        Kartu {currentIndex + 1} dari {flashcards.length}
      </div>
      
      {/* Flashcard */}
      <div style={flipCardStyles.container} onClick={handleFlip}>
        <div style={flipCardStyles.flipper}>
          <div style={flipCardStyles.front}>
            <h3 className="text-2xl font-medium text-center">{currentCard.front}</h3>
            <p className="text-gray-500 mt-6">Klik untuk melihat jawaban</p>
          </div>
          <div style={flipCardStyles.back}>
            <p className="text-lg text-center whitespace-pre-line">{currentCard.back}</p>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-center space-x-4 mt-6">
        <button 
          onClick={prevCard}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-md flex items-center ${
            currentIndex === 0 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Sebelumnya
        </button>
        
        <button 
          onClick={shuffleCards}
          className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Acak
        </button>
        
        <button 
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
          className={`px-4 py-2 rounded-md flex items-center ${
            currentIndex === flashcards.length - 1 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          Selanjutnya
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FlashcardTopic; 