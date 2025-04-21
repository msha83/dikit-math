import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Supabase client
import { supabase } from '../config/supabase';

// Import Auth context
import { useAuth } from '../context/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [learningTime, setLearningTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !userData.id) {
      navigate('/login');
    }
  }, [navigate]);

  // Daftar topik yang tersedia
  const topics = [
    { id: 'aljabar', name: 'Aljabar', icon: '📊' },
    { id: 'geometri', name: 'Geometri', icon: '📐' },
    { id: 'statistika', name: 'Statistika', icon: '📈' },
    { id: 'kalkulus', name: 'Kalkulus', icon: '∫' },
    { id: 'trigonometri', name: 'Trigonometri', icon: '△' },
    { id: 'program-linier', name: 'Program Linier', icon: '✏️' },
    { id: 'probabilitas', name: 'Probabilitas', icon: '🎲' },
    { id: 'vektor', name: 'Vektor', icon: '➡️' }
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

  // Efek untuk mengecek apakah pengguna sudah memiliki preferensi
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userPreferences = localStorage.getItem(`userPreferences_${userId}`);
    
    if (userPreferences) {
      // Pengguna sudah pernah memilih preferensi, langsung ke dashboard
      navigate('/dashboard');
    }
  }, [navigate]);

  // Handle klik pada topik
  const handleTopicClick = (topicId) => {
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
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!userData.id) {
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
      
      // Update user preferences in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: onboardingData,
          onboarded: true,
          last_updated: new Date().toISOString()
        })
        .eq('id', userData.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

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
      
      // Update the user data in localStorage to reflect onboarding completion
      const updatedUserData = { ...userData, onboarded: true };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // Tambahkan penanda onboarding selesai
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(user => {
        if (user.id === userData.id) {
          return { ...user, onboardingCompleted: true };
        }
        return user;
      });
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Pilih Topik yang Ingin Dipelajari</h1>
        <p className="text-gray-600 text-center mb-8">Pilih minimal satu topik yang ingin kamu pelajari</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {topics.map(topic => (
            <div 
              key={topic.id}
              onClick={() => handleTopicClick(topic.id)}
              className={`border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTopics.includes(topic.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="text-4xl mb-2">{topic.icon}</div>
              <div className="font-medium">{topic.name}</div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleFinishOnboarding}
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Memproses...' : 'Selanjutnya'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;