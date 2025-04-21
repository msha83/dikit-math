import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ActivityFeed from '../components/ActivityFeed';
import CompletedTopics from '../components/CompletedTopics';
import StatsCard from '../components/StatsCard';

// Define dashboard component
const Dashboard = () => {
  // All hooks first - PENTING: Hooks harus selalu dipanggil dalam urutan yang sama setiap kali render
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState({
    completedTopics: [],
    totalTopics: 15,
    dailyStreak: 0,
    xpPoints: 0,
    rank: 'Pemula',
    nextMilestone: 100,
    activities: []
  });
  
  // Content data
  const recommendedContent = [
    {
      id: 1,
      type: 'materi',
      title: 'Fungsi dan Grafik',
      description: 'Pelajari konsep fungsi matematika dan cara menggambar grafiknya',
      category: 'aljabar',
      slug: 'fungsi-dan-grafik',
      difficulty: 'Menengah',
      estimatedTime: '20 menit'
    },
    {
      id: 2,
      type: 'soal',
      title: 'Persamaan Linear',
      description: 'Latihan soal tentang persamaan linear satu variabel',
      category: 'aljabar',
      slug: 'persamaan-linear',
      difficulty: 'Dasar',
      questionCount: 10
    },
    {
      id: 3,
      type: 'flashcard',
      title: 'Persamaan Kuadrat',
      description: 'Kartu pengingat tentang rumus dan konsep persamaan kuadrat',
      category: 'aljabar',
      slug: 'persamaan-kuadrat',
      cardCount: 20
    }
  ];
  
  // Helper function - defined before useEffect
  const getUserDisplayName = () => {
    if (!user) return 'Siswa';
    return user.name || (user.email && user.email.split('@')[0]) || 'Siswa';
  };
  
  // Hooks untuk autentikasi
  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Get user
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }
    
    // Get user from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.id === userId);
    setUser(foundUser);
    
    // Load progress
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
    
    // End loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [navigate]);
  
  // Hook tambahan untuk analitik dan data tambahan
  useEffect(() => {
    // Efek tambahan yang selalu dijalankan
    const logPageView = () => {
      console.log('Dashboard viewed');
    };
    
    logPageView();
    
    return () => {
      // Cleanup jika diperlukan
    };
  }, []);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Main UI
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {getUserDisplayName()}!
        </h1>
        <p className="text-gray-600 mt-1">
          Lanjutkan belajar Matematika dan tingkatkan kemampuanmu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Materi Selesai" 
          value={userProgress.completedTopics.length}
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard 
          title="Streak Harian" 
          value={userProgress.dailyStreak}
          color="yellow"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatsCard 
          title="XP Points" 
          value={userProgress.xpPoints}
          color="purple"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard 
          title="Ranking" 
          value={userProgress.rank}
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Content */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Direkomendasikan untuk Anda</h2>
            <div className="space-y-4">
              {recommendedContent.map((content) => (
                <div key={content.id} className="border-l-4 border-blue-500 pl-6 py-2">
                  <h3 className="text-lg font-bold text-gray-800">{content.title}</h3>
                  <p className="text-gray-600 mb-2">{content.description}</p>
                  <Link 
                    to={`/${content.type}/${content.category}/${content.slug}`} 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mulai Belajar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Activity Feed */}
        <div className="h-[600px]">
          <ActivityFeed activities={userProgress.activities} />
        </div>
      </div>
      
      {/* Completed Topics */}
      <div className="mt-8">
        <CompletedTopics completedTopics={userProgress.completedTopics} />
      </div>
    </div>
  );
};

export default Dashboard;
