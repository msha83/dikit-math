import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import Loading from '../components/Loading';

const FlashcardTopic = () => {
  const { category, topic } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [topicInfo, setTopicInfo] = useState(null);

  // Sesuaikan judul untuk tampilan yang lebih baik
  const formatTitle = (text) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchData();
  }, [category, topic]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Dapatkan info kategori berdasarkan nama
      const { data: categoryData, error: categoryError } = await supabase
        .from('flashcard_categories')
        .select('*')
        .ilike('name', category)
        .single();
      
      if (categoryError) {
        if (categoryError.code === 'PGRST116') {
          throw new Error(`Kategori '${category}' tidak ditemukan.`);
        }
        throw categoryError;
      }
      
      setCategoryInfo(categoryData);
      
      // 2. Dapatkan info topik berdasarkan slug dan category_id
      const { data: topicData, error: topicError } = await supabase
        .from('flashcard_topics')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('slug', topic)
        .single();
      
      if (topicError) {
        if (topicError.code === 'PGRST116') {
          throw new Error(`Topik '${topic}' tidak ditemukan.`);
        }
        throw topicError;
      }
      
      setTopicInfo(topicData);
      
      // 3. Dapatkan flashcard
      const { data: flashcardData, error: flashcardError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('topic_id', topicData.id)
        .order('difficulty', { ascending: true })
        .order('created_at');
      
      if (flashcardError) throw flashcardError;
      
      // Format data untuk komponen
      const formattedFlashcards = flashcardData.map(card => ({
        id: card.id,
        front: card.question,
        back: card.answer
      }));
      
      if (formattedFlashcards.length === 0) {
        // Tidak perlu data dummy
        setFlashcards([]);
      } else {
        setFlashcards(formattedFlashcards);
      }
      
    } catch (error) {
      console.error('Error loading flashcard topic data:', error);
      setError(error.message || 'Terjadi kesalahan saat memuat data.');
      
      // Tidak perlu data dummy sebagai fallback
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };

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
    return <Loading />;
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
      
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md mb-6">
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 text-blue-600 underline"
          >
            Coba Lagi
          </button>
        </div>
      )}
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Flashcard: {topicInfo?.name || formatTitle(topic)}
      </h1>
      <p className="text-gray-600 mb-6">Kategori: {categoryInfo?.name || category}</p>
      
      {/* Flashcard */}
      {flashcards.length === 0 ? (
        <div className="p-4 bg-yellow-100 rounded-md text-center">
          <p className="text-yellow-800 font-medium">Materi flashcard untuk topik ini belum tersedia.</p>
          <p className="text-yellow-700 mt-2">Mohon coba lagi nanti atau pilih topik lainnya.</p>
        </div>
      ) : (
        <>
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
              className="px-4 py-2 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center"
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
              Berikutnya
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FlashcardTopic; 