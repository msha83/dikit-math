import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const SoalTopic = () => {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    fetchQuiz();
    checkUserProgress();
  }, [topic]);

  useEffect(() => {
    if (quiz && !showResults) {
      // Calculate progress percentage
      const answeredCount = Object.keys(answers).length;
      const progressPercent = (answeredCount / quiz.questions.length) * 100;
      setProgress(progressPercent);
    }
  }, [answers, quiz, showResults]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert topic slug to title format for comparison
      const quizTitle = topic.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      // Fetch quiz data
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*, quiz_categories!inner(*)')
        .eq('title', quizTitle)
        .single();

      if (quizError) {
        setError('Terjadi kesalahan saat memuat latihan soal');
        throw quizError;
      }
      if (!quizData) {
        setError('Latihan soal tidak ditemukan');
        throw new Error('Quiz not found');
      }
      
      // Validate quiz data
      if (!quizData.questions || quizData.questions.length === 0) {
        setError('Belum ada soal tersedia untuk latihan ini');
        throw new Error('No questions available');
      }

      // Validate each question
      const validQuestions = quizData.questions.filter(question => 
        question.question && 
        question.options && 
        Array.isArray(question.options) && 
        question.options.length === 4 &&
        typeof question.correct_answer === 'number' &&
        question.correct_answer >= 0 &&
        question.correct_answer < 4
      );

      if (validQuestions.length === 0) {
        setError('Format soal tidak valid');
        throw new Error('No valid questions available');
      }

      // Update quiz with only valid questions
      setQuiz({
        ...quizData,
        questions: validQuestions
      });
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const checkUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progress } = await supabase
        .from('user_quiz_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_id', quiz?.id)
        .single();

      if (progress) {
        // If there's existing progress and it's not completed, restore answers
        if (progress.status === 'in_progress' && progress.answers) {
          setAnswers(progress.answers);
        }
      }
    } catch (error) {
      console.error('Error checking user progress:', error);
    }
  };

  const updateUserProgress = async (status, finalAnswers = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const progressData = {
        user_id: user.id,
        quiz_id: quiz.id,
        status: status,
        answers: finalAnswers || answers,
        score: status === 'completed' ? calculateScore() : null,
        last_attempted_at: new Date().toISOString()
      };

      const { data: existingProgress } = await supabase
        .from('user_quiz_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('quiz_id', quiz.id)
        .single();

      if (existingProgress) {
        // Update existing progress
        await supabase
          .from('user_quiz_progress')
          .update(progressData)
          .eq('id', existingProgress.id);
      } else {
        // Create new progress entry
        await supabase
          .from('user_quiz_progress')
          .insert([progressData]);
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  };

  // Function to format the topic title for display
  const formatTitle = (text) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    // Timer effect
    if (!quizStarted || timeLeft <= 0 || showResults) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, showResults]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = async (questionId, answer) => {
    const newAnswers = {
      ...answers,
      [questionId]: answer
    };
    setAnswers(newAnswers);
    
    // Save progress when user answers a question
    await updateUserProgress('in_progress', newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const submitQuiz = async () => {
    setShowResults(true);
    
    // Calculate the score and mark as completed
    const score = calculateScore();
    await updateUserProgress('completed');
    
    // Create activity record
    const activityData = {
      type: 'soal',
      title: quiz.title,
      score: score,
      totalQuestions: quiz.questions.length,
      date: new Date().toISOString()
    };
    
    // Use setTimeout to ensure the results are shown before navigation
    setTimeout(() => {
      navigate('/dashboard', { 
        state: { 
          newActivity: activityData
        } 
      });
    }, 500);
  };

  const calculateCorrectAnswers = () => {
    let correctCount = 0;
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer === question.correct_answer) {
        correctCount++;
      }
    });
    
    return correctCount;
  };

  const calculateScore = () => {
    const correctCount = calculateCorrectAnswers();
    return Math.round((correctCount / quiz.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold mb-4">Maaf, latihan soal tidak tersedia</h1>
          <p className="text-gray-600 mb-6">{error || 'Latihan soal yang Anda cari sedang dalam proses pembuatan atau belum tersedia.'}</p>
          <Link 
            to="/soal" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Kembali ke Daftar Soal
          </Link>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <Link to="/soal" className="text-blue-500 hover:underline">
            ← Kembali ke Daftar Soal
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Latihan Soal: {quiz.title}</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Petunjuk:</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>Latihan ini terdiri dari {quiz.questions.length} soal</li>
              <li>Waktu pengerjaan 30 menit</li>
              <li>Kerjakan dengan teliti dan jujur</li>
              <li>Klik "Mulai" untuk memulai latihan</li>
            </ul>
          </div>
          
          <button 
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
            onClick={startQuiz}
          >
            Mulai Latihan
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Hasil Latihan</h1>
          
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {calculateCorrectAnswers()}/{quiz.questions.length}
            </div>
            <p className="text-gray-600">
              Nilai: {calculateScore()}%
            </p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Pembahasan:</h2>
            
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correct_answer;
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Soal {index + 1}: {question.question}</p>
                  
                  <div className="pl-4 mb-2">
                    <p className="text-gray-700">
                      Jawaban Anda: 
                      <span className={isCorrect ? 'text-green-500 font-medium ml-1' : 'text-red-500 font-medium ml-1'}>
                        {userAnswer || 'Tidak dijawab'}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      Jawaban Benar: 
                      <span className="text-green-500 font-medium ml-1">
                        {question.options[question.correct_answer]}
                      </span>
                    </p>
                  </div>
                  
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">Pembahasan:</p>
                    <p className="text-gray-700 whitespace-pre-line">{question.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between mt-6">
            <Link
              to="/soal"
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-300"
            >
              Kembali ke Daftar Soal
            </Link>
            
            <button
              onClick={() => {
                setCurrentQuestionIndex(0);
                setAnswers({});
                setShowResults(false);
                setTimeLeft(1800);
                setQuizStarted(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Link to="/soal" className="text-blue-500 hover:underline">
            ← Kembali ke Daftar Soal
          </Link>
          <div className="font-bold text-lg">
            <span className={timeLeft < 300 ? 'text-red-500' : 'text-gray-700'}>
              Waktu: {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{Math.round(progress)}% selesai</span>
          <span>{Object.keys(answers).length} dari {quiz.questions.length} soal</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Soal {currentQuestionIndex + 1}/{quiz.questions.length}
          </h2>
        </div>
        
        <div className="mb-6">
          <p className="text-lg">{currentQuestion.question}</p>
        </div>
        
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index}
              className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150
                ${answers[currentQuestionIndex] === index ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onClick={() => handleAnswerChange(currentQuestionIndex, index)}
            >
              <label className="flex items-center cursor-pointer w-full">
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  checked={answers[currentQuestionIndex] === index}
                  onChange={() => handleAnswerChange(currentQuestionIndex, index)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-3">{option}</span>
              </label>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <button
            className="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
            onClick={goToPrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Sebelumnya
          </button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              className="py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
              onClick={goToNextQuestion}
            >
              Selanjutnya
            </button>
          ) : (
            <button
              className="py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200"
              onClick={submitQuiz}
            >
              Selesai
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-5 gap-2">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            className={`p-2 border rounded-lg 
              ${currentQuestionIndex === index 
                ? 'bg-blue-600 text-white' 
                : answers[index] !== undefined
                  ? 'bg-green-100 border-green-300' 
                  : 'bg-gray-100'}`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SoalTopic; 