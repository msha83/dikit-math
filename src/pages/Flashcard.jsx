import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import Loading from '../components/Loading';

const Flashcard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk fitur flashcard langsung
  const [quickFlashcards, setQuickFlashcards] = useState([]);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQuickCards, setShowQuickCards] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Ambil kategori
      const { data: categoryData, error: categoryError } = await supabase
        .from('flashcard_categories')
        .select('id, name')
        .order('name');
      
      if (categoryError) throw categoryError;
      
      // 2. Ambil topik secara terpisah
      const { data: topicsData, error: topicsError } = await supabase
        .from('flashcard_topics')
        .select('id, name, slug, category_id')
        .order('name');
        
      if (topicsError) throw topicsError;
      
      // 3. Format data dengan menggabungkan secara manual
      const formattedCategories = categoryData.map(category => {
        // Filter topik yang termasuk dalam kategori ini
        const categoryTopics = topicsData.filter(topic => 
          topic.category_id === category.id
        );
        
        return {
          id: category.id,
          title: category.name,
          topics: categoryTopics.map(topic => ({
            id: topic.id,
            name: topic.name,
            slug: topic.slug,
            count: 0 // Akan diisi nanti
          }))
        };
      });
      
      // 4. Ambil jumlah flashcard untuk setiap topic
      const { data: flashcardCountsData, error: flashcardCountsError } = await supabase
        .from('flashcards')
        .select('topic_id, count')
        .select();
        
      if (flashcardCountsError) throw flashcardCountsError;
      
      // Update jumlah flashcard untuk setiap topik
      formattedCategories.forEach(category => {
        category.topics.forEach(topic => {
          const count = flashcardCountsData.filter(fc => fc.topic_id === topic.id).length;
          topic.count = count;
        });
      });
      
      setCategories(formattedCategories);
      
      // 5. Ambil beberapa flashcard untuk tampilan quick flashcard
      const { data: quickFlashcardsData, error: quickFlashcardsError } = await supabase
        .from('flashcards')
        .select('id, question, answer, difficulty, topic_id')
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (quickFlashcardsError) throw quickFlashcardsError;
      
      // Format data quick flashcard
      const formattedQuickFlashcards = quickFlashcardsData.map(card => ({
        id: card.id,
        front: card.question,
        back: card.answer
      }));
      
      setQuickFlashcards(formattedQuickFlashcards);
    } catch (error) {
      console.error('Error loading flashcard data:', error);
      setError('Terjadi kesalahan saat memuat data. Silakan coba lagi nanti.');
      
      // No need to set dummy data anymore
      setCategories([]);
      setQuickFlashcards([]);
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
    if (currentCardIndex < quickFlashcards.length - 1) {
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
    const shuffled = [...quickFlashcards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQuickFlashcards(shuffled);
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
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Flashcard Materi Matematika</h1>
      
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
      
      {/* Tombol beralih mode */}
      <div className="mb-8">
        <button 
          onClick={() => setShowQuickCards(!showQuickCards)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          {showQuickCards ? 'Lihat Kategori Flashcard' : 'Kembali ke Quick Flashcard'}
        </button>
      </div>
      
      {showQuickCards ? (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Flashcard</h2>
          
          {quickFlashcards.length === 0 ? (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-6">
              <p>Belum ada flashcard tersedia. Silakan buat flashcard terlebih dahulu.</p>
              <Link 
                to="/admin/flashcards"
                className="mt-2 text-blue-600 underline"
              >
                Buat Flashcard
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Kartu {currentCardIndex + 1} dari {quickFlashcards.length}</span>
                  <div className="space-x-2">
                    <button 
                      onClick={shuffleCards}
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Acak
                    </button>
                  </div>
                </div>
                
                <div style={flipCardStyles.container}>
                  <div style={flipCardStyles.flipper} onClick={handleFlip}>
                    <div style={flipCardStyles.front}>
                      <h3 className="text-xl font-medium text-gray-900 mb-4">Pertanyaan:</h3>
                      <p className="text-gray-700 text-center">{quickFlashcards[currentCardIndex]?.front || 'Tidak ada pertanyaan'}</p>
                      <div className="mt-4 text-sm text-gray-500">
                        Klik untuk melihat jawaban
                      </div>
                    </div>
                    <div style={flipCardStyles.back}>
                      <h3 className="text-xl font-medium text-gray-900 mb-4">Jawaban:</h3>
                      <p className="text-gray-700 text-center">{quickFlashcards[currentCardIndex]?.back || 'Tidak ada jawaban'}</p>
                      <div className="mt-4 text-sm text-gray-500">
                        Klik untuk kembali ke pertanyaan
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <button 
                    onClick={prevCard}
                    disabled={currentCardIndex === 0}
                    className={`px-4 py-2 rounded-md ${currentCardIndex === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    Sebelumnya
                  </button>
                  <button 
                    onClick={nextCard}
                    disabled={currentCardIndex === quickFlashcards.length - 1}
                    className={`px-4 py-2 rounded-md ${currentCardIndex === quickFlashcards.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
              
              <div className="text-center mt-6 mb-10">
                <Link
                  to="/direktflashcard"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Lihat Lebih Banyak Flashcard
                </Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Lihat Kategori Flashcard</h2>
          
          {categories.length === 0 ? (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-6">
              <p>Belum ada kategori flashcard tersedia. Silakan buat kategori terlebih dahulu.</p>
              <Link 
                to="/admin/flashcards"
                className="mt-2 text-blue-600 underline"
              >
                Kelola Flashcard
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-medium text-gray-900 mb-3">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.topics.length === 0 ? (
                      <li className="text-gray-500 italic">Belum ada topik</li>
                    ) : (
                      category.topics.map((topic) => (
                        <li key={topic.id} className="flex justify-between items-center">
                          <Link
                            to={`/flashcard/${category.title.toLowerCase()}/${topic.slug}`}
                            className="text-blue-600 hover:underline"
                          >
                            {topic.name}
                          </Link>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {topic.count} kartu
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Flashcard;
