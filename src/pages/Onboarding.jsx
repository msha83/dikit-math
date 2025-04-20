import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Firebase configuration - matches the one in Login and Register
const firebaseConfig = {
  apiKey: "AIzaSyA_w7oAXXQVCfWuWXSiG9j2wI6o0GGmwjM",
  authDomain: "mathedu-leaderboard.firebaseapp.com",
  projectId: "mathedu-leaderboard",
  storageBucket: "mathedu-leaderboard.appspot.com",
  messagingSenderId: "485273185384",
  appId: "1:485273185384:web:ebc257b3adb7b7a70fd5c2",
  databaseURL: "https://mathedu-leaderboard-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase if not already initialized
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Firebase already initialized
  app = initializeApp(firebaseConfig, "secondary");
}
const database = getDatabase(app);

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [learningTime, setLearningTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id) {
      navigate('/login');
    }
  }, [navigate]);

  const mathTopics = [
    { id: 'algebra', name: 'Aljabar', icon: '📊' },
    { id: 'geometry', name: 'Geometri', icon: '📐' },
    { id: 'statistics', name: 'Statistika', icon: '📈' },
    { id: 'calculus', name: 'Kalkulus', icon: '∫' },
    { id: 'trigonometry', name: 'Trigonometri', icon: '🔺' },
    { id: 'linear-programming', name: 'Program Linier', icon: '📝' },
    { id: 'probability', name: 'Probabilitas', icon: '🎲' },
    { id: 'vectors', name: 'Vektor', icon: '➡️' }
  ];

  const difficultyLevels = [
    { id: 'beginner', name: 'Pemula', description: 'Baru memulai belajar matematika SMA' },
    { id: 'intermediate', name: 'Menengah', description: 'Sudah memahami konsep dasar' },
    { id: 'advanced', name: 'Lanjutan', description: 'Siap untuk tantangan level tinggi' }
  ];

  const goals = [
    { id: 'improve-grades', name: 'Meningkatkan Nilai', icon: '📝' },
    { id: 'prepare-exams', name: 'Persiapan Ujian', icon: '📚' },
    { id: 'competition', name: 'Olimpiade/Kompetisi', icon: '🏆' },
    { id: 'personal', name: 'Pengembangan Pribadi', icon: '🌱' }
  ];

  const timeOptions = [
    { id: '15min', name: '15 menit/hari', description: 'Untuk jadwal yang padat' },
    { id: '30min', name: '30 menit/hari', description: 'Seimbang antara belajar dan kegiatan lain' },
    { id: '60min', name: '60 menit/hari', description: 'Untuk hasil yang optimal' },
    { id: 'custom', name: 'Kustom', description: 'Saya akan mengatur sendiri' }
  ];

  const handleTopicSelect = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter(id => id !== topicId));
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinishOnboarding();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedTopics.length > 0;
      case 2:
        return selectedLevel !== '';
      case 3:
        return learningGoal !== '';
      case 4:
        return learningTime !== '';
      default:
        return false;
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        throw new Error('User not found');
      }

      // Save onboarding preferences to localStorage
      const onboardingData = {
        topics: selectedTopics,
        level: selectedLevel,
        goal: learningGoal,
        studyTime: learningTime,
        completed: true,
        completedAt: new Date().toISOString()
      };
      
      localStorage.setItem('onboarding', JSON.stringify(onboardingData));
      
      // Update user preferences in Firebase
      const userRef = ref(database, `users/${user.id}`);
      await update(userRef, {
        preferences: onboardingData,
        onboardingCompleted: true,
        lastUpdated: new Date().toISOString()
      });

      // Update user progress based on selected level
      const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
      let updatedProgress = { ...userProgress };
      
      // Adjust XP and rank based on selected level
      switch (selectedLevel) {
        case 'beginner':
          updatedProgress.xpPoints = 50;
          updatedProgress.rank = 'Pemula';
          updatedProgress.nextMilestone = 200;
          break;
        case 'intermediate':
          updatedProgress.xpPoints = 200;
          updatedProgress.rank = 'Menengah';
          updatedProgress.nextMilestone = 500;
          break;
        case 'advanced':
          updatedProgress.xpPoints = 500;
          updatedProgress.rank = 'Mahir';
          updatedProgress.nextMilestone = 1000;
          break;
        default:
          break;
      }
      
      localStorage.setItem('userProgress', JSON.stringify(updatedProgress));
      
      // Navigate to dashboard after successful onboarding
      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setLoading(false);
      // Continue to dashboard even if there's an error
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span className={currentStep >= 1 ? "text-blue-600 font-medium" : ""}>Topik</span>
            <span className={currentStep >= 2 ? "text-blue-600 font-medium" : ""}>Level</span>
            <span className={currentStep >= 3 ? "text-blue-600 font-medium" : ""}>Tujuan</span>
            <span className={currentStep >= 4 ? "text-blue-600 font-medium" : ""}>Waktu</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Topic Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Pilih Topik yang Ingin Dipelajari</h2>
                <p className="mt-2 text-gray-600">Pilih minimal satu topik yang ingin kamu pelajari</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mathTopics.map((topic) => (
                  <div 
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedTopics.includes(topic.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{topic.icon}</div>
                    <div className="font-medium">{topic.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Level Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Pilih Level Kemampuan</h2>
                <p className="mt-2 text-gray-600">Kami akan menyesuaikan materi berdasarkan levelmu</p>
              </div>
              
              <div className="space-y-4">
                {difficultyLevels.map((level) => (
                  <div 
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedLevel === level.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium text-lg">{level.name}</div>
                    <div className="text-gray-600 text-sm">{level.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Goal Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Apa Tujuan Belajarmu?</h2>
                <p className="mt-2 text-gray-600">Kami akan membantu mencapai tujuanmu</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <div 
                    key={goal.id}
                    onClick={() => setLearningGoal(goal.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      learningGoal === goal.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className="font-medium">{goal.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Time Commitment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Berapa Lama Waktu Belajarmu?</h2>
                <p className="mt-2 text-gray-600">Jadwal belajar yang konsisten adalah kunci keberhasilan</p>
              </div>
              
              <div className="space-y-4">
                {timeOptions.map((option) => (
                  <div 
                    key={option.id}
                    onClick={() => setLearningTime(option.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      learningTime === option.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium text-lg">{option.name}</div>
                    <div className="text-gray-600 text-sm">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-md font-medium ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Kembali
            </button>
            
            <button
              onClick={handleNextStep}
              disabled={!isStepValid() || loading}
              className={`px-4 py-2 rounded-md font-medium ${
                !isStepValid() || loading
                  ? 'bg-blue-300 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : currentStep === 4 ? 'Selesai' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
