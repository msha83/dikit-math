import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import Loading from '../components/Loading';

const DirectFlashcard = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => {
    fetchFlashcards();
  }, []);
  
  const fetchFlashcards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ambil beberapa flashcard untuk tampilan langsung
      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('id, question, answer, difficulty, topic_id')
        .order('difficulty', { ascending: true }) // Ambil dari yang paling mudah
        .limit(10); // Batasi hanya 10 flashcard
        
      if (flashcardsError) throw flashcardsError;
      
      // Format data flashcard
      const formattedFlashcards = flashcardsData.map(card => ({
        id: card.id,
        front: card.question,
        back: card.answer
      }));
      
      setFlashcards(formattedFlashcards);
    } catch (error) {
      console.error('Error loading direct flashcards:', error);
      setError('Terjadi kesalahan saat memuat data flashcard. Silakan coba lagi nanti.');
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle kartu flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Beralih ke kartu berikutnya
  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };
  
  // Beralih ke kartu sebelumnya
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };
  
  // Acak kartu
  const shuffleCards = () => {
    const shuffled = [...flashcards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
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
    return <Loading />;
  }

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/flashcard" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Kembali ke Semua Flashcard
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Flashcard Matematika Dasar</h1>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md mb-6">
          <p>{error}</p>
          <button 
            onClick={fetchFlashcards}
            className="mt-2 text-blue-600 underline"
          >
            Coba Lagi
          </button>
        </div>
      )}
      
      {flashcards.length === 0 ? (
        <div className="p-4 bg-yellow-100 rounded-md text-center">
          <p className="text-yellow-800 font-medium">Materi flashcard belum tersedia.</p>
          <p className="text-yellow-700 mt-2">Mohon coba lagi nanti.</p>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="text-gray-600 text-center mb-4">
            Kartu {currentCardIndex + 1} dari {flashcards.length}
          </div>
          
          {/* Flashcard */}
          <div style={flipCardStyles.container} onClick={handleFlip}>
            <div style={flipCardStyles.flipper}>
              <div style={flipCardStyles.front}>
                <h3 className="text-2xl font-medium text-center">{flashcards[currentCardIndex].front}</h3>
                <p className="text-gray-500 mt-6">Klik untuk melihat jawaban</p>
              </div>
              <div style={flipCardStyles.back}>
                <p className="text-lg text-center whitespace-pre-line">{flashcards[currentCardIndex].back}</p>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex justify-center space-x-4 mt-6">
            <button 
              onClick={prevCard}
              disabled={currentCardIndex === 0}
              className={`px-4 py-2 rounded-md flex items-center ${
                currentCardIndex === 0 
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
              className="px-4 py-2 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Acak
            </button>
            
            <button 
              onClick={nextCard}
              disabled={currentCardIndex === flashcards.length - 1}
              className={`px-4 py-2 rounded-md flex items-center ${
                currentCardIndex === flashcards.length - 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Berikutnya
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
          {/* Topic info */}
          <div className="mt-12 p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Tentang Flashcard Ini</h3>
            <p className="text-blue-700">
              Flashcard ini berisi konsep-konsep dasar matematika yang perlu dikuasai. 
              Klik pada kartu untuk membalik dan melihat jawabannya.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DirectFlashcard; 