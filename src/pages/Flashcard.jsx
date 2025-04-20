import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Flashcard = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      title: 'Aljabar',
      topics: [
        { id: 1, name: 'Persamaan Linear', slug: 'persamaan-linear', count: 25 },
        { id: 2, name: 'Persamaan Kuadrat', slug: 'persamaan-kuadrat', count: 18 },
        { id: 3, name: 'Fungsi dan Grafik', slug: 'fungsi-dan-grafik', count: 23 }
      ]
    },
    {
      id: 2,
      title: 'Geometri',
      topics: [
        { id: 4, name: 'Bangun Datar', slug: 'bangun-datar', count: 20 },
        { id: 5, name: 'Bangun Ruang', slug: 'bangun-ruang', count: 15 },
        { id: 6, name: 'Trigonometri', slug: 'trigonometri', count: 22 }
      ]
    }
  ]);

  // Sample flashcard untuk demo
  const [sampleFlashcard, setSampleFlashcard] = useState({
    front: 'Apa itu persamaan linear?',
    back: 'Persamaan linear adalah persamaan yang variabelnya berpangkat satu. Bentuk umumnya adalah ax + b = 0, di mana a ≠ 0.'
  });
  
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // CSS untuk animasi flip
  const flipCardStyles = {
    container: {
      width: '100%',
      height: '200px',
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
      padding: '1.5rem',
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
      padding: '1.5rem',
      transform: 'rotateY(180deg)'
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Flashcard Materi Matematika</h1>
      
      {/* Demo flashcard */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Demo Flashcard</h2>
        <p className="text-gray-600 mb-4">Klik pada kartu untuk membaliknya</p>
        
        <div style={flipCardStyles.container} onClick={handleFlip}>
          <div style={flipCardStyles.flipper}>
            <div style={flipCardStyles.front}>
              <h3 className="text-2xl font-medium text-center">{sampleFlashcard.front}</h3>
              <p className="text-gray-500 mt-4">Klik untuk melihat jawaban</p>
            </div>
            <div style={flipCardStyles.back}>
              <p className="text-lg text-center">{sampleFlashcard.back}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Kategori Flashcard */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Kategori Flashcard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map(category => (
            <div key={category.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{category.title}</h3>
              
              <ul className="space-y-3">
                {category.topics.map(topic => (
                  <li key={topic.id} className="border-b pb-3 last:border-b-0">
                    <Link 
                      to={`/flashcard/${category.title.toLowerCase()}/${topic.slug}`}
                      className="flex justify-between items-center group"
                    >
                      <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                        {topic.name}
                      </span>
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {topic.count} kartu
                        </span>
                        <svg 
                          className="ml-2 w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
