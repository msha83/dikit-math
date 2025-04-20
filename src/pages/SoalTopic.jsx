import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const SoalTopic = () => {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Function to format the topic title for display
  const formatTitle = (text) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    // Simulate loading data from an API
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Dummy data based on topic
      let topicExercises = [];
      
      if (topic === 'persamaan-linear') {
        topicExercises = [
          {
            id: 1,
            question: 'Tentukan nilai x dari persamaan 2x + 3 = 9',
            type: 'multiple_choice',
            options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
            correctAnswer: 'x = 3',
            explanation: '2x + 3 = 9\n2x = 9 - 3\n2x = 6\nx = 3'
          },
          {
            id: 2,
            question: 'Jika 5(x - 2) = 2x + 1, berapakah nilai x?',
            type: 'multiple_choice',
            options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
            correctAnswer: 'x = 3',
            explanation: '5(x - 2) = 2x + 1\n5x - 10 = 2x + 1\n5x - 2x = 1 + 10\n3x = 11\nx = 11/3 ≈ 3.67\nKarena tidak ada pilihan yang tepat, x = 3 adalah yang terdekat.'
          },
          {
            id: 3,
            question: 'Selesaikan persamaan 3(2x - 1) = 4(x + 2) - 5',
            type: 'essay',
            correctAnswer: 'x = 1',
            explanation: '3(2x - 1) = 4(x + 2) - 5\n6x - 3 = 4x + 8 - 5\n6x - 3 = 4x + 3\n6x - 4x = 3 + 3\n2x = 6\nx = 3'
          },
          {
            id: 4,
            question: 'Jika 2x/3 + 1 = x/2 + 2, tentukan nilai x.',
            type: 'essay',
            correctAnswer: 'x = 6',
            explanation: '2x/3 + 1 = x/2 + 2\nKalikan kedua sisi dengan 6 untuk menghilangkan penyebut:\n4x + 6 = 3x + 12\n4x - 3x = 12 - 6\nx = 6'
          },
          {
            id: 5,
            question: 'Sebuah persegi panjang memiliki keliling 24 cm. Jika panjangnya 2 cm lebih dari lebarnya, tentukan panjang dan lebar persegi panjang tersebut.',
            type: 'essay',
            correctAnswer: 'panjang = 7 cm, lebar = 5 cm',
            explanation: 'Misalkan lebar = x cm, maka panjang = (x + 2) cm\nKeliling = 2(panjang + lebar) = 24 cm\n2(x + 2 + x) = 24\n2(2x + 2) = 24\n4x + 4 = 24\n4x = 20\nx = 5\nJadi, lebar = 5 cm dan panjang = 7 cm'
          }
        ];
      } else if (topic === 'persamaan-kuadrat') {
        topicExercises = [
          {
            id: 1,
            question: 'Akar-akar persamaan x² - 5x + 6 = 0 adalah...',
            type: 'multiple_choice',
            options: ['x = 2 dan x = 3', 'x = -2 dan x = -3', 'x = 2 dan x = -3', 'x = -2 dan x = 3'],
            correctAnswer: 'x = 2 dan x = 3',
            explanation: 'x² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\nx = 2 atau x = 3'
          },
          {
            id: 2,
            question: 'Tentukan nilai diskriminan dari persamaan 2x² - 3x - 5 = 0',
            type: 'multiple_choice',
            options: ['D = 9', 'D = 49', 'D = 89', 'D = 100'],
            correctAnswer: 'D = 49',
            explanation: 'Untuk persamaan ax² + bx + c = 0, diskriminan D = b² - 4ac\nPada 2x² - 3x - 5 = 0, a = 2, b = -3, c = -5\nD = (-3)² - 4(2)(-5) = 9 + 40 = 49'
          },
          {
            id: 3,
            question: 'Selesaikan persamaan x² + 6x + 9 = 0 dengan metode melengkapkan kuadrat sempurna.',
            type: 'essay',
            correctAnswer: 'x = -3',
            explanation: 'x² + 6x + 9 = 0\nx² + 6x + 9 = 0\n(x + 3)² = 0\nx + 3 = 0\nx = -3'
          },
          {
            id: 4,
            question: 'Jika jumlah akar-akar persamaan kuadrat x² + px + q = 0 adalah 5 dan hasil kalinya adalah 6, tentukan nilai p dan q.',
            type: 'essay',
            correctAnswer: 'p = -5, q = 6',
            explanation: 'Jika x₁ dan x₂ adalah akar-akar persamaan x² + px + q = 0, maka:\nx₁ + x₂ = -p\nx₁·x₂ = q\nDiketahui x₁ + x₂ = 5 dan x₁·x₂ = 6\nMaka -p = 5, sehingga p = -5\nDan q = 6'
          }
        ];
      } else if (topic === 'fungsi-dan-grafik') {
        topicExercises = [
          {
            id: 1,
            question: 'Tentukan domain dan range dari fungsi f(x) = x² + 1',
            type: 'multiple_choice',
            options: [
              'Domain: semua bilangan real, Range: y ≥ 0', 
              'Domain: semua bilangan real, Range: y ≥ 1', 
              'Domain: x ≥ 0, Range: y ≥ 1', 
              'Domain: x ≥ 0, Range: y ≥ 0'
            ],
            correctAnswer: 'Domain: semua bilangan real, Range: y ≥ 1',
            explanation: 'Fungsi f(x) = x² + 1 dapat menerima semua input bilangan real, sehingga domainnya adalah semua bilangan real. Nilai minimum f(x) adalah 1 (saat x = 0), dan tidak ada batas atas, sehingga range-nya adalah y ≥ 1.'
          },
          {
            id: 2,
            question: 'Grafik fungsi f(x) = -x² + 4x - 3 memiliki nilai maksimum di titik...',
            type: 'multiple_choice',
            options: ['(0, -3)', '(2, 1)', '(4, 5)', '(1, 0)'],
            correctAnswer: '(2, 1)',
            explanation: 'Untuk menentukan nilai maksimum, kita cari turunan f(x) dan samakan dengan nol.\nf\'(x) = -2x + 4 = 0\nx = 2\nNilai maksimum f(2) = -2² + 4(2) - 3 = -4 + 8 - 3 = 1\nJadi, nilai maksimum berada di titik (2, 1)'
          },
          {
            id: 3,
            question: 'Tentukan persamaan fungsi kuadrat yang memiliki titik puncak (3, -2) dan melalui titik (1, -8).',
            type: 'essay',
            correctAnswer: 'f(x) = -3(x - 3)² - 2 atau f(x) = -3x² + 18x - 29',
            explanation: 'Fungsi kuadrat dengan titik puncak (h, k) dapat ditulis sebagai f(x) = a(x - h)² + k\nDengan titik puncak (3, -2): f(x) = a(x - 3)² - 2\nSubstitusi titik (1, -8):\n-8 = a(1 - 3)² - 2\n-8 = a(4) - 2\n-8 + 2 = 4a\n-6 = 4a\na = -3/2\nJadi, f(x) = -3/2(x - 3)² - 2\nDalam bentuk umum: f(x) = -3/2x² + 9x - 29/2'
          }
        ];
      } else {
        topicExercises = [
          {
            id: 1,
            question: 'Maaf, soal untuk topik ini belum tersedia.',
            type: 'info',
            options: [],
            correctAnswer: '',
            explanation: ''
          }
        ];
      }
      
      setExercises(topicExercises);
      setLoading(false);
    }, 1000);
  }, [topic]);

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

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < exercises.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const submitQuiz = () => {
    setShowResults(true);
    
    // Calculate the score
    const correctCount = calculateCorrectAnswers();
    const totalQuestionsCount = calculateTotalQuestions();
    const score = calculateScore();
    
    // Create activity object to update dashboard stats
    const activityData = {
      type: 'soal',
      title: formatTitle(topic),
      score: correctCount,
      totalQuestions: totalQuestionsCount,
      date: new Date().toISOString()
    };
    
    // Use setTimeout to ensure the results are shown before navigation
    setTimeout(() => {
      // Navigate to dashboard with the activity data to update stats
      navigate('/dashboard', { 
        state: { 
          newActivity: activityData
        } 
      });
    }, 500);
  };

  // New helper functions to calculate correct answers and total questions
  const calculateCorrectAnswers = () => {
    let correctCount = 0;
    
    exercises.forEach(exercise => {
      if (exercise.type === 'info') return;
      
      const userAnswer = answers[exercise.id];
      if (userAnswer === exercise.correctAnswer) {
        correctCount++;
      }
    });
    
    return correctCount;
  };
  
  const calculateTotalQuestions = () => {
    return exercises.filter(ex => ex.type !== 'info').length;
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setTimeLeft(1800);
    setQuizStarted(false);
  };

  const calculateScore = () => {
    let correctCount = 0;
    let totalQuestions = exercises.length;
    
    exercises.forEach(exercise => {
      if (exercise.type === 'info') {
        totalQuestions--;
        return;
      }
      
      const userAnswer = answers[exercise.id];
      if (userAnswer === exercise.correctAnswer) {
        correctCount++;
      }
    });
    
    return totalQuestions > 0 
      ? Math.round((correctCount / totalQuestions) * 100) 
      : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
          <h1 className="text-3xl font-bold mb-6">Latihan Soal: {formatTitle(topic)}</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Petunjuk:</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>Latihan ini terdiri dari {exercises.length} soal</li>
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
    const score = calculateScore();
    
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <Link to="/soal" className="text-blue-500 hover:underline">
            ← Kembali ke Daftar Soal
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Hasil Latihan</h1>
          
          <div className="mb-6 flex flex-col items-center">
            <div className={`text-5xl font-bold mb-2 ${score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
              {score}%
            </div>
            <p className="text-gray-700">
              {score >= 70 ? 'Selamat! Anda lulus latihan ini.' : 'Anda perlu lebih banyak berlatih.'}
            </p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Pembahasan:</h2>
            
            {exercises.map((exercise, index) => {
              if (exercise.type === 'info') return null;
              
              const userAnswer = answers[exercise.id] || 'Tidak dijawab';
              const isCorrect = userAnswer === exercise.correctAnswer;
              
              return (
                <div key={exercise.id} className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Soal {index + 1}: {exercise.question}</p>
                  
                  <div className="pl-4 mb-2">
                    <p className="text-gray-700">Jawaban Anda: 
                      <span className={isCorrect ? 'text-green-500 font-medium ml-1' : 'text-red-500 font-medium ml-1'}>
                        {userAnswer}
                      </span>
                    </p>
                    <p className="text-gray-700">Jawaban Benar: 
                      <span className="text-green-500 font-medium ml-1">{exercise.correctAnswer}</span>
                    </p>
                  </div>
                  
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">Pembahasan:</p>
                    <p className="text-gray-700 whitespace-pre-line">{exercise.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button 
            className="w-full mt-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
            onClick={resetQuiz}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = exercises[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/soal" className="text-blue-500 hover:underline">
          ← Kembali ke Daftar Soal
        </Link>
        
        <div className="font-bold text-lg">
          <span className={timeLeft < 300 ? 'text-red-500' : 'text-gray-700'}>
            Waktu: {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Soal {currentQuestionIndex + 1}/{exercises.length}</h2>
          <span className="text-sm text-gray-500">
            {currentQuestion.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
          </span>
        </div>
        
        <div className="mb-6">
          <p className="text-lg">{currentQuestion.question}</p>
        </div>
        
        {currentQuestion.type === 'multiple_choice' && (
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150
                  ${answers[currentQuestion.id] === option ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => handleAnswerChange(currentQuestion.id, option)}
              >
                <label className="flex items-center cursor-pointer w-full">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === option}
                    onChange={() => handleAnswerChange(currentQuestion.id, option)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-3">{option}</span>
                </label>
              </div>
            ))}
          </div>
        )}
        
        {currentQuestion.type === 'essay' && (
          <div className="mb-6">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Tulis jawaban Anda di sini..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            ></textarea>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            className="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
            onClick={goToPrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Sebelumnya
          </button>
          
          {currentQuestionIndex < exercises.length - 1 ? (
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
        {exercises.map((_, index) => (
          <button
            key={index}
            className={`p-2 border rounded-lg 
              ${currentQuestionIndex === index 
                ? 'bg-blue-600 text-white' 
                : answers[exercises[index].id] 
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