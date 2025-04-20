import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SoalDetail = () => {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit dalam detik
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format judul untuk tampilan
  const formatTitle = (text) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    // Dalam aplikasi sebenarnya, data soal akan diambil dari API
    // Untuk sekarang, kita gunakan data dummy berdasarkan topik
    
    let questionsData = [];
    
    if (topic === 'persamaan-linear') {
      questionsData = [
        {
          id: 1,
          question: 'Tentukan nilai x pada persamaan 2x + 3 = 7',
          options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
          correctAnswer: 'x = 2',
          explanation: 'Kita kurangi kedua sisi dengan 3: 2x = 4, kemudian bagi dengan 2: x = 2'
        },
        {
          id: 2,
          question: 'Tentukan solusi dari persamaan 3x - 5 = 10',
          options: ['x = 3', 'x = 5', 'x = 15/3', 'x = 5/3'],
          correctAnswer: 'x = 5',
          explanation: 'Kita tambahkan kedua sisi dengan 5: 3x = 15, kemudian bagi dengan 3: x = 5'
        },
        {
          id: 3,
          question: 'Jika 2(x - 3) = 10, berapakah nilai x?',
          options: ['x = 8', 'x = 7', 'x = 6', 'x = 5'],
          correctAnswer: 'x = 8',
          explanation: 'Kita selesaikan: 2(x - 3) = 10 → 2x - 6 = 10 → 2x = 16 → x = 8'
        },
        {
          id: 4,
          question: 'Tentukan nilai y pada persamaan 4y - 7 = 5',
          options: ['y = 3', 'y = 3.5', 'y = 3', 'y = 4'],
          correctAnswer: 'y = 3',
          explanation: 'Kita tambahkan kedua sisi dengan 7: 4y = 12, kemudian bagi dengan 4: y = 3'
        },
        {
          id: 5,
          question: 'Jika 5x + 2 = 3x - 6, berapakah nilai x?',
          options: ['x = -4', 'x = 4', 'x = -8', 'x = 8'],
          correctAnswer: 'x = -4',
          explanation: 'Kita selesaikan: 5x + 2 = 3x - 6 → 5x - 3x = -6 - 2 → 2x = -8 → x = -4'
        }
      ];
    } else if (topic === 'persamaan-kuadrat') {
      questionsData = [
        {
          id: 1,
          question: 'Tentukan akar-akar dari persamaan x² - 5x + 6 = 0',
          options: ['x = 2 dan x = 3', 'x = 1 dan x = 4', 'x = -2 dan x = -3', 'x = -1 dan x = -4'],
          correctAnswer: 'x = 2 dan x = 3',
          explanation: 'Dengan pemfaktoran: x² - 5x + 6 = (x - 2)(x - 3) = 0, sehingga x = 2 atau x = 3'
        },
        {
          id: 2,
          question: 'Tentukan diskriminan dari persamaan 2x² - 4x + 1 = 0',
          options: ['D = 8', 'D = 16', 'D = 0', 'D = 4'],
          correctAnswer: 'D = 8',
          explanation: 'Diskriminan D = b² - 4ac = (-4)² - 4(2)(1) = 16 - 8 = 8'
        },
        {
          id: 3,
          question: 'Jika salah satu akar dari persamaan kuadrat x² + px + 15 = 0 adalah x = -3, berapakah nilai p?',
          options: ['p = 8', 'p = -8', 'p = 10', 'p = -10'],
          correctAnswer: 'p = -8',
          explanation: 'Jika x = -3 adalah akar, maka (x + 3) adalah faktor: x² + px + 15 = (x + 3)(x + 5) = x² + 8x + 15, sehingga p = 8'
        },
        {
          id: 4,
          question: 'Tentukan jumlah akar-akar persamaan 3x² - 6x + 2 = 0',
          options: ['Jumlah = 2', 'Jumlah = 1', 'Jumlah = 3', 'Jumlah = 4'],
          correctAnswer: 'Jumlah = 2',
          explanation: 'Dalam persamaan ax² + bx + c = 0, jumlah akar-akar = -b/a = -(-6)/3 = 2'
        },
        {
          id: 5,
          question: 'Persamaan kuadrat x² - 4x + 4 = 0 memiliki akar-akar:',
          options: ['Akar kembar x = 2', 'Akar kembar x = -2', 'x = 2 dan x = -2', 'Tidak memiliki akar real'],
          correctAnswer: 'Akar kembar x = 2',
          explanation: 'x² - 4x + 4 = (x - 2)² = 0, sehingga x = 2 (akar kembar)'
        }
      ];
    } else if (topic === 'fungsi-dan-grafik') {
      questionsData = [
        {
          id: 1,
          question: 'Jika f(x) = 2x - 3, berapakah nilai f(5)?',
          options: ['f(5) = 5', 'f(5) = 7', 'f(5) = 8', 'f(5) = 10'],
          correctAnswer: 'f(5) = 7',
          explanation: 'f(5) = 2(5) - 3 = 10 - 3 = 7'
        },
        {
          id: 2,
          question: 'Tentukan titik potong dengan sumbu-y dari fungsi f(x) = 3x + 4',
          options: ['(0, 4)', '(0, 3)', '(4, 0)', '(3, 0)'],
          correctAnswer: '(0, 4)',
          explanation: 'Titik potong dengan sumbu-y adalah saat x = 0, sehingga f(0) = 3(0) + 4 = 4, jadi titiknya (0, 4)'
        },
        {
          id: 3,
          question: 'Fungsi kuadrat f(x) = x² - 2x - 3 memiliki nilai minimum pada titik:',
          options: ['(1, -4)', '(1, 4)', '(-1, -4)', '(-1, 4)'],
          correctAnswer: '(1, -4)',
          explanation: 'Untuk f(x) = x² - 2x - 3, titik minimum berada di x = -b/2a = -(-2)/2 = 1, dan f(1) = 1 - 2 - 3 = -4'
        },
        {
          id: 4,
          question: 'Diberikan fungsi f(x) = x² + 6x + 9, tentukan bentuk sempurnanya (bentuk kuadrat sempurna)',
          options: ['f(x) = (x + 3)²', 'f(x) = (x - 3)²', 'f(x) = (x + 3)² - 9', 'f(x) = (x - 3)² + 9'],
          correctAnswer: 'f(x) = (x + 3)²',
          explanation: 'f(x) = x² + 6x + 9 = x² + 2(3)x + 3² = (x + 3)²'
        },
        {
          id: 5,
          question: 'Grafik fungsi f(x) = -2x² + 4x - 1 memiliki bentuk:',
          options: ['Parabola terbuka ke atas', 'Parabola terbuka ke bawah', 'Garis lurus', 'Hiperbola'],
          correctAnswer: 'Parabola terbuka ke bawah',
          explanation: 'Koefisien x² adalah -2 (negatif), sehingga parabola terbuka ke bawah'
        }
      ];
    } else {
      questionsData = [
        {
          id: 1,
          question: 'Maaf, tidak ada soal untuk topik ini saat ini.',
          options: ['Kembali ke halaman soal'],
          correctAnswer: 'Kembali ke halaman soal',
          explanation: 'Silakan pilih topik lain untuk latihan soal'
        }
      ];
    }
    
    setQuestions(questionsData);
    setLoading(false);
  }, [topic]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || showResult) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, showResult]);

  // Format waktu ke menit:detik
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleAnswerSelect = (answer) => {
    if (isSubmitted) return;
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      setShowResult(true);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setTimeLeft(300);
    setIsSubmitted(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Hasil Latihan</h1>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">{score}/{questions.length}</div>
            <p className="text-gray-600">Nilai: {Math.round((score / questions.length) * 100)}%</p>
          </div>
          
          <div className="flex justify-between items-center border-t pt-6 mt-6">
            <button 
              onClick={() => navigate('/soal')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors duration-300"
            >
              Kembali ke Daftar Soal
            </button>
            <button 
              onClick={resetQuiz}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              {formatTitle(category)}: {formatTitle(topic)}
            </h1>
            <div className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              Waktu: {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500 text-right">
            Soal {currentQuestionIndex + 1} dari {questions.length}
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">{currentQuestion.question}</h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`p-3 border rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedAnswer === option 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'hover:bg-gray-50 border-gray-300'
                  } ${
                    isSubmitted && option === currentQuestion.correctAnswer
                      ? 'bg-green-50 border-green-500'
                      : isSubmitted && selectedAnswer === option && selectedAnswer !== currentQuestion.correctAnswer
                      ? 'bg-red-50 border-red-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {isSubmitted && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Penjelasan:</h3>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className={`px-4 py-2 rounded-md ${
                  !selectedAnswer 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors duration-300`}
              >
                Periksa Jawaban
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoalDetail; 