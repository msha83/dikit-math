import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Activity = () => {
  const [userProgress, setUserProgress] = useState({
    completedTopics: [],
    dailyStreak: 0,
    xpPoints: 0,
    rank: 'Pemula',
    activities: []
  });

  useEffect(() => {
    // Load progress from localStorage
    const storedProgress = localStorage.getItem('userProgress');
    if (storedProgress) {
      setUserProgress(JSON.parse(storedProgress));
    }
  }, []);

  // Function to format date to readable format
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Function to format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hari ini';
    } else if (diffDays === 1) {
      return 'Kemarin';
    } else if (diffDays < 7) {
      return `${diffDays} hari yang lalu`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} minggu yang lalu`;
    } else {
      return formatDate(timestamp);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold">Aktivitas dan Pencapaian</h1>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Topik Diselesaikan</h3>
          <p className="text-3xl font-bold">{userProgress.completedTopics.length}</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Streak Harian</h3>
          <p className="text-3xl font-bold">{userProgress.dailyStreak}</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">XP Points</h3>
          <p className="text-3xl font-bold">{userProgress.xpPoints}</p>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Ranking</h3>
          <p className="text-3xl font-bold">{userProgress.rank}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Topics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Topik yang Diselesaikan</h2>
          
          {userProgress.completedTopics.length > 0 ? (
            <div className="divide-y">
              {userProgress.completedTopics.map(topic => (
                <div key={topic.id} className="py-3">
                  <div className="flex items-center">
                    <div className="mr-4 p-2 bg-green-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">{topic.title}</h3>
                      <p className="text-sm text-gray-500">Diselesaikan pada {formatDate(topic.completedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Belum ada topik yang diselesaikan.
            </p>
          )}
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Aktivitas Terbaru</h2>
          
          {userProgress.activities.length > 0 ? (
            <div className="divide-y">
              {userProgress.activities.map(activity => (
                <div key={activity.id} className="py-3">
                  <div className="flex items-start">
                    <div className={`mt-1 mr-4 p-2 rounded-full ${
                      activity.type === 'material' 
                        ? 'bg-blue-100' 
                        : activity.type === 'quiz' 
                        ? 'bg-purple-100' 
                        : 'bg-green-100'
                    }`}>
                      {activity.type === 'material' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {activity.type === 'quiz' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      )}
                      {activity.type === 'flashcard' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{activity.title}</h3>
                        <span className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.type === 'material' && (
                          <>Menyelesaikan materi <span className="font-medium">{activity.title}</span></>
                        )}
                        {activity.type === 'quiz' && (
                          <>Mengerjakan latihan soal dengan skor <span className="font-medium">{activity.score}</span></>
                        )}
                        {activity.type === 'flashcard' && (
                          <>Menyelesaikan sesi kartu <span className="font-medium">{activity.title}</span></>
                        )}
                      </p>
                      <div className="mt-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-yellow-700">+{activity.xpGained} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Belum ada aktivitas yang tercatat.
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Activity; 