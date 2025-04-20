import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { supabase } from '../config/supabase';

// Fallback/sample leaderboard data
const sampleLeaderboardData = [
  { id: '1', username: 'SiAhli123', score: 1250, rank: 1 },
  { id: '2', username: 'MathWizard', score: 1100, rank: 2 },
  { id: '3', username: 'BrilliantMind', score: 950, rank: 3 },
  { id: '4', username: 'PecintaAljabar', score: 820, rank: 4 },
  { id: '5', username: 'KalkulusKing', score: 780, rank: 5 },
  { id: '6', username: 'GeometriGuru', score: 740, rank: 6 },
  { id: '7', username: 'TrigonometriPro', score: 690, rank: 7 },
  { id: '8', username: 'AlgoritmaMaster', score: 650, rank: 8 },
  { id: '9', username: 'StatistikStar', score: 620, rank: 9 },
  { id: '10', username: 'ProbabilitasPrima', score: 590, rank: 10 },
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

  // Function to sync local user progress with Supabase
  const syncUserProgressToSupabase = useCallback(async () => {
    try {
      // Get current user
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUserData || !currentUserData.id) return;
      
      // Get user progress from localStorage
      const userProgressData = JSON.parse(localStorage.getItem('userProgress') || '{}');
      
      // Check if user exists in leaderboard
      const { data: existingUser, error: checkError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', currentUserData.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking leaderboard entry:', checkError);
        return;
      }
      
      if (existingUser) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('leaderboard')
          .update({
            username: currentUserData.name || (currentUserData.email && currentUserData.email.split('@')[0]) || 'User',
            score: userProgressData.xpPoints || 0,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', currentUserData.id);
          
        if (updateError) {
          console.error('Error updating leaderboard:', updateError);
        }
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('leaderboard')
          .insert([{
            user_id: currentUserData.id,
            username: currentUserData.name || (currentUserData.email && currentUserData.email.split('@')[0]) || 'User',
            score: userProgressData.xpPoints || 0,
            last_updated: new Date().toISOString()
          }]);
          
        if (insertError) {
          console.error('Error creating leaderboard entry:', insertError);
        }
      }
    } catch (error) {
      console.error('Error syncing user to Supabase:', error);
    }
  }, []);

  // Function to add the current user to sample data if needed
  const addCurrentUserToSampleData = useCallback(() => {
    try {
      // Get current user
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUserData || !currentUserData.id) return sampleLeaderboardData;
      
      // Get user progress from localStorage
      const userProgressData = JSON.parse(localStorage.getItem('userProgress') || '{}');
      
      // Check if user already exists in sample data
      const userExists = sampleLeaderboardData.some(user => user.id === currentUserData.id);
      
      if (userExists) {
        // Just update score
        return sampleLeaderboardData.map(user => {
          if (user.id === currentUserData.id) {
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
            id: currentUserData.id,
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

  // Function to add random XP to current user (for testing)
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
      
      // Update Supabase
      const { error } = await supabase
        .from('leaderboard')
        .update({
          score: newXpPoints,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);
        
      if (error) {
        console.error('Error updating leaderboard score:', error);
      }
      
      // Refresh local data
      syncUserProgressToSupabase();
    } catch (error) {
      console.error('Error adding random XP:', error);
    }
  }, [currentUser, syncUserProgressToSupabase]);

  // Effect to load data with pagination
  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Get current user data
        const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(currentUserData);
        
        try {
          // Sync local user data to Supabase on mount
          await syncUserProgressToSupabase();
          
          // Calculate pagination
          const from = (page - 1) * usersPerPage;
          const to = from + usersPerPage - 1;
          
          // Get total count
          const { count, error: countError } = await supabase
            .from('leaderboard')
            .select('*', { count: 'exact', head: true });
            
          if (countError) {
            throw countError;
          }
          
          setTotalUsers(count || 0);
          
          // Get leaderboard data with pagination
          const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .range(from, to);
            
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Add rank to each user
            const rankedData = data.map((user, index) => ({
              ...user,
              rank: from + index + 1
            }));
            
            setUsers(rankedData);
            setUsingSampleData(false);
          } else {
            // No data or error, use sample data
            const customizedSampleData = addCurrentUserToSampleData();
            setUsers(customizedSampleData);
            setUsingSampleData(true);
          }
        } catch (error) {
          console.error('Error fetching leaderboard data:', error);
          // Fallback to sample data
          const customizedSampleData = addCurrentUserToSampleData();
          setUsers(customizedSampleData);
          setTotalUsers(customizedSampleData.length);
          setUsingSampleData(true);
        }
        
        setLoading(false);
        setInitialLoading(false);
      } catch (err) {
        console.error('Error in loadLeaderboardData:', err);
        setError(err.message);
        setLoading(false);
        setInitialLoading(false);
      }
    };
    
    loadLeaderboardData();
    
    // Set up a real-time subscription to leaderboard updates
    const subscribeToLeaderboard = async () => {
      const subscription = supabase
        .channel('leaderboard-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'leaderboard' 
          }, 
          (payload) => {
            // Refresh data when changes occur
            loadLeaderboardData();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(subscription);
      };
    };
    
    const unsubscribe = subscribeToLeaderboard();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [page, syncUserProgressToSupabase, addCurrentUserToSampleData]);

  const handleStorageChange = (e) => {
    if (e.key === 'userProgress') {
      syncUserProgressToSupabase();
    }
  };

  useEffect(() => {
    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncUserProgressToSupabase]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalUsers / usersPerPage);
  }, [totalUsers]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const pageNumbers = useMemo(() => {
    const numbers = [];
    const maxButtons = 5;
    
    // Add page numbers based on current page position
    if (totalPages <= maxButtons) {
      // Show all pages if total is less than max buttons
      for (let i = 1; i <= totalPages; i++) {
        numbers.push(i);
      }
    } else {
      // Show a subset of pages with current page in middle if possible
      let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);
      
      // Adjust if we're near the end
      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        numbers.push(i);
      }
    }
    
    return numbers;
  }, [page, totalPages]);

  // Check if current user is in the displayed leaderboard
  const isCurrentUserInList = useMemo(() => {
    return currentUser && users.some(user => {
      // Handle both Firebase and Supabase data structures
      const userId = user.user_id || user.id;
      return userId === currentUser.id;
    });
  }, [users, currentUser]);

  // Get current user's rank from full list
  const currentUserData = useMemo(() => {
    if (!currentUser) return null;
    
    return users.find(user => {
      // Handle both Firebase and Supabase data structures
      const userId = user.user_id || user.id;
      return userId === currentUser.id;
    });
  }, [users, currentUser]);

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Papan Peringkat</h1>
          <p className="mt-2 text-gray-600">
            {usingSampleData ? 
              'Menggunakan data contoh karena database tidak tersedia.' : 
              'Peringkat berdasarkan perolehan XP'
            }
          </p>
        </div>
        
        {/* Current user card */}
        {currentUser && currentUserData && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  currentUserData.rank === 1 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : currentUserData.rank === 2 
                    ? 'bg-gray-100 text-gray-800' 
                    : currentUserData.rank === 3 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentUserData.rank || '?'}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">{currentUser.name || 'User'}</h2>
                  <p className="text-gray-500">Peringkat Saat Ini</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{currentUserData.score || 0}</div>
                <p className="text-gray-500">XP</p>
              </div>
              {!usingSampleData && (
                <button 
                  onClick={addRandomXp} 
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  +XP (Test)
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Leaderboard table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {usingSampleData ? 'Contoh Papan Peringkat' : 'Peringkat Global'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peringkat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  // Skeleton loading
                  Array(8).fill().map((_, i) => <SkeletonRow key={i} />)
                ) : error ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      Belum ada data untuk ditampilkan
                    </td>
                  </tr>
                ) : (
                  // Display users
                  users.map(user => {
                    const userId = user.user_id || user.id;
                    const isCurrentUserRow = currentUser && userId === currentUser.id;
                    
                    return (
                      <UserRow 
                        key={userId} 
                        user={user} 
                        isCurrentUser={isCurrentUserRow} 
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{(page - 1) * usersPerPage + 1}</span> hingga <span className="font-medium">{Math.min(page * usersPerPage, totalUsers)}</span> dari <span className="font-medium">{totalUsers}</span> pengguna
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={handlePreviousPage}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {pageNumbers.map(number => (
                      <button
                        key={number}
                        onClick={() => setPage(number)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          page === number 
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
