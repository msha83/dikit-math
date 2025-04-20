import React, { useEffect, useRef, memo } from 'react';
import { Link } from 'react-router-dom';

// Skeleton loading component for activity items
const SkeletonActivityItem = () => (
  <div className="py-3 animate-pulse">
    <div className="flex items-start">
      <div className="mt-1 mr-4 p-2 rounded-full bg-gray-200 h-9 w-9"></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mt-2"></div>
        <div className="mt-2 flex items-center">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
);

// Skeleton loading component for empty state
const SkeletonEmptyState = () => (
  <div className="text-center py-8 flex-grow animate-pulse">
    <div className="h-12 w-12 mx-auto bg-gray-200 rounded-full mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mt-2"></div>
  </div>
);

// Memoized activity item to prevent unnecessary re-renders
const ActivityItem = memo(({ activity, index, getActivityIcon, formatRelativeTime }) => (
  <div 
    key={activity.id} 
    className="py-3 activity-item"
    style={{ transitionDelay: `${index * 0.05}s` }}
  >
    <div className="flex items-start">
      <div className={`mt-1 mr-4 p-2 rounded-full ${
        activity.type === 'material' 
          ? 'bg-blue-100' 
          : activity.type === 'quiz' 
          ? 'bg-purple-100' 
          : 'bg-green-100'
      }`}>
        {getActivityIcon(activity.type)}
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
          {activity.type === 'test' && (
            <>{activity.description}</>
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
));

const ActivityFeed = ({ activities = [], isLoading = false }) => {
  const scrollContainerRef = useRef(null);

  // Effect to animate items when they appear
  useEffect(() => {
    if (!scrollContainerRef.current || activities.length === 0 || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { 
        root: scrollContainerRef.current,
        threshold: 0.1
      }
    );

    const activityElements = scrollContainerRef.current.querySelectorAll('.activity-item');
    activityElements.forEach((el) => observer.observe(el));

    return () => {
      activityElements.forEach((el) => observer.unobserve(el));
    };
  }, [activities, isLoading]);

  // Function to format date to relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Baru saja';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit yang lalu`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'material':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'quiz':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'flashcard':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Render skeleton loaders when loading
  const renderSkeletonLoaders = () => {
    return (
      <div className="divide-y">
        {[...Array(4)].map((_, index) => (
          <SkeletonActivityItem key={index} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Aktivitas Terbaru</h2>
      
      {isLoading ? (
        <div className="overflow-y-auto max-h-[400px] flex-grow">
          {renderSkeletonLoaders()}
        </div>
      ) : activities && activities.length > 0 ? (
        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2 flex-grow"
        >
          <div className="divide-y">
            {activities.map((activity, index) => (
              <ActivityItem 
                key={activity.id}
                activity={activity}
                index={index}
                getActivityIcon={getActivityIcon}
                formatRelativeTime={formatRelativeTime}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 flex-grow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">Belum ada aktivitas yang tercatat</p>
          <p className="text-gray-500 text-sm mt-1">Mulai belajar untuk menampilkan aktivitas terbaru</p>
        </div>
      )}
      
      <div className="mt-4 text-center pt-2 border-t">
        <Link to="/aktivitas" className="text-blue-600 hover:underline font-medium">
          Lihat Semua Aktivitas
        </Link>
      </div>
    </div>
  );
};

export default memo(ActivityFeed); 