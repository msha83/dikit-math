import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';

const LoadingSkeleton = () => (
  <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
      
      {/* Status cards skeleton */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Topics skeleton */}
      {[1, 2].map((category) => (
        <div key={category} className="mb-10">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((topic) => (
              <div key={topic} className="bg-white rounded-lg shadow-md p-6">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Soal = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    completed: 0,
    inProgress: 0,
    total: 0
  });

  useEffect(() => {
    fetchQuizCategories();
    fetchUserProgress();
  }, []);

  const fetchQuizCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and their quizzes
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('quiz_categories')
        .select(`
          id,
          name,
          quizzes (
            id,
            title,
            question_count,
            is_published,
            questions
          )
        `)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Transform the data to match the component's structure
      const transformedCategories = categoriesData
        .map(category => ({
          id: category.id,
          title: category.name,
          topics: category.quizzes
            .filter(quiz => quiz.is_published && quiz.questions && quiz.questions.length > 0)
            .map(quiz => ({
              id: quiz.id,
              name: quiz.title,
              slug: quiz.title.toLowerCase().replace(/ /g, '-'),
              questionCount: quiz.questions.length,
              difficulty: 'Sedang' // You might want to add a difficulty field to your quiz table
            }))
        }))
        .filter(category => category.topics.length > 0); // Only include categories that have quizzes with questions

      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching quiz categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all quizzes to get total count
      const { data: allQuizzes } = await supabase
        .from('quizzes')
        .select('id')
        .eq('is_published', true);

      // Fetch user's completed quizzes
      const { data: completedQuizzes } = await supabase
        .from('user_quiz_progress')
        .select('quiz_id, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Fetch user's in-progress quizzes
      const { data: inProgressQuizzes } = await supabase
        .from('user_quiz_progress')
        .select('quiz_id, status')
        .eq('user_id', user.id)
        .eq('status', 'in_progress');

      setProgress({
        total: allQuizzes?.length || 0,
        completed: completedQuizzes?.length || 0,
        inProgress: inProgressQuizzes?.length || 0
      });

    } catch (error) {
      console.error('Error fetching user progress:', error);
      // Set default values if there's an error
      setProgress({
        total: 0,
        completed: 0,
        inProgress: 0
      });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Mudah': return 'bg-green-100 text-green-800';
      case 'Sedang': return 'bg-yellow-100 text-yellow-800';
      case 'Sulit': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (categories.length === 0) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Belum Ada Latihan Soal</h3>
          <p className="mt-1 text-sm text-gray-500">Latihan soal sedang dalam proses pembuatan. Silakan cek kembali nanti.</p>
          <div className="mt-6">
            <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Latihan Soal Matematika</h1>
      
      {/* Status progress belajar */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Status Belajar Anda</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-500 font-medium">Total Topik</p>
            <p className="text-2xl font-bold text-blue-700">{progress.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-500 font-medium">Sudah Selesai</p>
            <p className="text-2xl font-bold text-green-700">{progress.completed}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-500 font-medium">Sedang Dipelajari</p>
            <p className="text-2xl font-bold text-yellow-700">{progress.inProgress}</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-gray-700">
              {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ 
                width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Topik Latihan Soal */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Topik Latihan Soal</h2>
        
        {categories.map(category => (
          <div key={category.id} className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{category.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.topics.map(topic => (
                <div 
                  key={topic.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{topic.name}</h4>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                        {topic.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        {topic.questionCount} soal
                      </span>
                    </div>
                    <Link 
                      to={`/soal/${category.title.toLowerCase()}/${topic.slug}`}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 inline-block text-center"
                    >
                      Mulai Latihan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Rekomendasi */}
      <div className="mt-10 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Rekomendasi untuk Anda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Persamaan Kuadrat</h3>
              <p className="text-sm text-gray-600 mt-1">Lanjutkan latihan dari kemarin</p>
              <Link to="/soal/aljabar/persamaan-kuadrat" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
                Lanjutkan →
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Trigonometri</h3>
              <p className="text-sm text-gray-600 mt-1">Topik populer minggu ini</p>
              <Link to="/soal/geometri/trigonometri" className="text-sm text-green-600 hover:text-green-800 mt-2 inline-block">
                Mulai Latihan →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Soal;
