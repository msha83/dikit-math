import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, query, limitToLast, orderByChild } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_w7oAXXQVCfWuWXSiG9j2wI6o0GGmwjM",
  authDomain: "mathedu-leaderboard.firebaseapp.com",
  projectId: "mathedu-leaderboard",
  storageBucket: "mathedu-leaderboard.appspot.com",
  messagingSenderId: "485273185384",
  appId: "1:485273185384:web:ebc257b3adb7b7a70fd5c2",
  databaseURL: "https://mathedu-leaderboard-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase - with error handling (only once)
let app;
let database;
try {
  if (!app) {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
}

// Fallback/sample leaderboard data
const sampleLeaderboardData = [
  { _id: '1', username: 'SiAhli123', score: 1250, rank: 1 },
  { _id: '2', username: 'MathWizard', score: 1100, rank: 2 },
  { _id: '3', username: 'BrilliantMind', score: 950, rank: 3 },
  { _id: '4', username: 'PecintaAljabar', score: 820, rank: 4 },
  { _id: '5', username: 'KalkulusKing', score: 780, rank: 5 },
  { _id: '6', username: 'GeometriGuru', score: 740, rank: 6 },
  { _id: '7', username: 'TrigonometriPro', score: 690, rank: 7 },
  { _id: '8', username: 'AlgoritmaMaster', score: 650, rank: 8 },
  { _id: '9', username: 'StatistikStar', score: 620, rank: 9 },
  { _id: '10', username: 'ProbabilitasPrima', score: 590, rank: 10 },
];

// User row component to optimize rendering
const UserRow = React.memo(({ user, isCurrentUser }) => (
  <tr 
    className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}
  >
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          user.rank === 1 
            ? 'bg-yellow-100 text-yellow-800' 
            : user.rank === 2 
            ? 'bg-gray-100 text-gray-800' 
            : user.rank === 3 
            ? 'bg-yellow-600 text-white' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {user.rank}
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900 flex items-center">
        {user.username}
        {isCurrentUser && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Anda
          </span>
        )}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900 font-semibold">{user.score}</div>
    </td>
  </tr>
));

// Skeleton loader component for table rows
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 w-32 bg-gray-200 rounded"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 w-16 bg-gray-200 rounded"></div>
    </td>
  </tr>
);

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 20;

  // Function to sync local user progress with Firebase - optimized with useCallback
  const syncUserProgressToFirebase = useCallback(async () => {
    if (!database) {
      console.warn('Firebase database not available. Using sample data.');
      return;
    }
    
    try {
      // Get current user
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUserData || !currentUserData.id) return;
      
      // Get user progress from localStorage
      const userProgressData = JSON.parse(localStorage.getItem('userProgress') || '{}');
      
      // Create or update user in Firebase
      const userRef = ref(database, `users/${currentUserData.id}`);
      const userSnapshot = await get(userRef);
      
      // Update user data
      set(userRef, {
        id: currentUserData.id,
        username: currentUserData.name || (currentUserData.email && currentUserData.email.split('@')[0]) || 'User',
        email: currentUserData.email || '',
        score: userProgressData.xpPoints || 0,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing user to Firebase:', error);
      // Continue without Firebase sync
    }
  }, []);

  // Function to add the current user to sample data if needed - optimized with useCallback
  const addCurrentUserToSampleData = useCallback(() => {
    try {
      // Get current user
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUserData || !currentUserData.id) return sampleLeaderboardData;
      
      // Get user progress from localStorage
      const userProgressData = JSON.parse(localStorage.getItem('userProgress') || '{}');
      
      // Check if user already exists in sample data
      const userExists = sampleLeaderboardData.some(user => user._id === currentUserData.id);
      
      if (userExists) {
        // Just update score
        return sampleLeaderboardData.map(user => {
          if (user._id === currentUserData.id) {
            return {
              ...user,
              username: currentUserData.name || (currentUserData.email && currentUserData.email.split('@')[0]) || 'User',
              score: userProgressData.xpPoints || 0
            };
          }
          return user;
        }).sort((a, b) => b.score - a.score)
        .map((user, index) => ({...user, rank: index + 1}));
      } else {
        // Add user to sample data
        const updatedData = [
          ...sampleLeaderboardData,
          {
            _id: currentUserData.id,
            username: currentUserData.name || (currentUserData.email && currentUserData.email.split('@')[0]) || 'User',
            score: userProgressData.xpPoints || 0
          }
        ].sort((a, b) => b.score - a.score)
        .map((user, index) => ({...user, rank: index + 1}));
        
        return updatedData;
      }
    } catch (error) {
      console.error('Error processing user data:', error);
      return sampleLeaderboardData;
    }
  }, []);

  // Function to add random XP to current user (for testing) - optimized with useCallback
  const addRandomXp = useCallback(async () => {
    if (!currentUser || !currentUser.id) return;
    
    try {
      // Get user progress from localStorage
      const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
      
      // Add random XP between 10-50
      const randomXp = Math.floor(Math.random() * 41) + 10;
      const newXpPoints = (userProgress.xpPoints || 0) + randomXp;
      
      // Update localStorage
      userProgress.xpPoints = newXpPoints;
      localStorage.setItem('userProgress', JSON.stringify(userProgress));
      
      // Update Firebase
      if (database) {
        const userRef = ref(database, `users/${currentUser.id}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          set(userRef, {
            ...userData,
            score: newXpPoints,
            lastUpdated: new Date().toISOString()
          });
        }
      }
      
      // Refresh local data
      syncUserProgressToFirebase();
    } catch (error) {
      console.error('Error adding random XP:', error);
    }
  }, [currentUser, syncUserProgressToFirebase]);

  // Effect to load data with pagination
  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Get current user data
        const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(currentUserData);
        
        // Check if Firebase is available
        if (!database) {
          console.warn('Firebase not available, using sample data');
          const customizedSampleData = addCurrentUserToSampleData();
          setUsers(customizedSampleData);
          setTotalUsers(customizedSampleData.length);
          setUsingSampleData(true);
          setLoading(false);
          setInitialLoading(false);
          return;
        }
        
        // Sync local user data to Firebase on mount
        syncUserProgressToFirebase();
        
        // Set up Firebase listener with pagination
        const usersRef = ref(database, 'users');
        const usersQuery = query(usersRef, orderByChild('score'));
        
        // Set a timeout for Firebase loading
        const timeoutId = setTimeout(() => {
          if (loading) {
            console.warn('Firebase taking too long, using sample data');
            const customizedSampleData = addCurrentUserToSampleData();
            setUsers(customizedSampleData);
            setTotalUsers(customizedSampleData.length);
            setUsingSampleData(true);
            setLoading(false);
            setInitialLoading(false);
          }
        }, 3000); // Reduced from 5s to 3s
        
        const unsubscribe = onValue(usersQuery, (snapshot) => {
          clearTimeout(timeoutId);
          
          if (snapshot.exists()) {
            const usersData = snapshot.val();
            
            // Convert Firebase object to array
            const usersArray = Object.keys(usersData).map(key => ({
              _id: key,
              ...usersData[key]
            }));
            
            // Sort by score (descending)
            const sortedUsers = usersArray.sort((a, b) => b.score - a.score);
            
            // Add rank
            const rankedUsers = sortedUsers.map((user, index) => ({
              ...user,
              rank: index + 1
            }));
            
            setTotalUsers(rankedUsers.length);
            
            // Get the paginated subset of users
            const startIndex = 0;
            const endIndex = Math.min(usersPerPage * page, rankedUsers.length);
            const paginatedUsers = rankedUsers.slice(startIndex, endIndex);
            
            setUsers(paginatedUsers);
            setUsingSampleData(false);
          } else {
            // If no data is found, use sample data
            const customizedSampleData = addCurrentUserToSampleData();
            setUsers(customizedSampleData);
            setTotalUsers(customizedSampleData.length);
            setUsingSampleData(true);
          }
          
          setLoading(false);
          setInitialLoading(false);
          setError(null);
        }, (error) => {
          console.error('Error fetching leaderboard data:', error);
          setError('Terjadi kesalahan saat memuat data leaderboard');
          
          // Use sample data in case of error
          const customizedSampleData = addCurrentUserToSampleData();
          setUsers(customizedSampleData);
          setTotalUsers(customizedSampleData.length);
          setUsingSampleData(true);
          setLoading(false);
          setInitialLoading(false);
          
          // Clear timeout
          clearTimeout(timeoutId);
        });
        
        // Clean up the listener on unmount
        return () => {
          unsubscribe && unsubscribe();
          clearTimeout(timeoutId);
        };
      } catch (err) {
        console.error('Error setting up Firebase:', err);
        setError('Terjadi kesalahan saat menghubungkan ke database');
        
        // Use sample data in case of error
        const customizedSampleData = addCurrentUserToSampleData();
        setUsers(customizedSampleData);
        setTotalUsers(customizedSampleData.length);
        setUsingSampleData(true);
        setLoading(false);
        setInitialLoading(false);
      }
    };
    
    loadLeaderboardData();
  }, [page, addCurrentUserToSampleData, syncUserProgressToFirebase]);

  // Effect to sync local changes to Firebase
  useEffect(() => {
    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'userProgress') {
        syncUserProgressToFirebase();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncUserProgressToFirebase]);

  // Load more data when scrolling to bottom
  const loadMoreData = useCallback(() => {
    if (!loading && users.length < totalUsers) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, users.length, totalUsers]);

  // Find current user position
  const currentUserPosition = useMemo(() => {
    if (!currentUser || !users.length) return null;
    return users.findIndex(user => user._id === currentUser.id) + 1;
  }, [currentUser, users]);

  // Render skeleton loading state
  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Leaderboard Pengguna</h1>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peringkat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skor (XP)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array(10).fill(0).map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Leaderboard Pengguna</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peringkat
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skor (XP)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <UserRow 
                  key={user._id} 
                  user={user} 
                  isCurrentUser={currentUser && user._id === currentUser.id}
                />
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  Belum ada data pengguna
                </td>
              </tr>
            )}
            {loading && Array(3).fill(0).map((_, index) => (
              <SkeletonRow key={`loading-${index}`} />
            ))}
          </tbody>
        </table>
      </div>

      {users.length < totalUsers && (
        <div className="mt-4 text-center">
          <button 
            onClick={loadMoreData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
          </button>
        </div>
      )}

      {/* Information about realtime syncing */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Data peringkat disinkronkan secara realtime untuk semua pengguna.</p>
        {usingSampleData && (
          <p className="text-yellow-600 mt-1">Menggunakan data contoh karena tidak terhubung ke database.</p>
        )}
      </div>

      {/* Test button to add random XP (only visible in development) */}
      {import.meta.env.DEV && currentUser && (
        <div className="mt-6 text-center">
          <button
            onClick={addRandomXp}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Tambah XP Acak (Testing)
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
