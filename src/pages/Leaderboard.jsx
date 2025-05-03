import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { supabase, getLeaderboard, updateUserScore, subscribeToLeaderboardUpdates } from '../config/supabase';

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
        {user.username || user.name || 'Pengguna'}
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
      
      // Update user score in leaderboard
      const { error } = await updateUserScore(
        currentUserData.id,
        currentUserData.name || (currentUserData.email && currentUserData.email.split('@')[0]) || 'User',
        userProgressData.xpPoints || 0,
        false // not incrementing, setting absolute value
      );
      
      if (error) {
        console.error('Error syncing user progress:', error);
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
          
          // Create leaderboard table if it doesn't exist
          const createLeaderboardTable = async () => {
            try {
              // Check if the table exists first
              const { error: checkError } = await supabase
                .from('leaderboard')
                .select('count', { count: 'exact', head: true });
              
              if (checkError && checkError.code === '42P01') {
                console.log('Creating leaderboard table...');
                // In a real app, you would use migrations for this
                // This is just a demo/test approach
                const { error } = await supabase.rpc('create_leaderboard_table');
                if (error) {
                  console.error('Error creating leaderboard table:', error);
                  return false;
                }
                return true;
              }
              return true;
            } catch (error) {
              console.error('Error checking/creating leaderboard table:', error);
              return false;
            }
          };
          
          // Try to ensure the leaderboard table exists
          await createLeaderboardTable();
          
          // Get leaderboard data with pagination
          const { data, count, error, usingSampleData: isSampleData } = await getLeaderboard(page, usersPerPage);
          
          if (error) {
            throw new Error(error);
          }
          
          if (data && data.length > 0) {
            // Make sure each user has a username property for consistency
            const processedData = data.map(user => ({
              ...user,
              username: user.name || user.username || 'Pengguna'
            }));
            setUsers(processedData);
            setTotalUsers(count || 0);
            setUsingSampleData(isSampleData);
          } else if (isSampleData) {
            // No data or error, use sample data
            const customizedSampleData = addCurrentUserToSampleData();
            setUsers(customizedSampleData);
            setTotalUsers(customizedSampleData.length);
            setUsingSampleData(true);
          } else {
            // Empty but valid leaderboard
            setUsers([]);
            setTotalUsers(0);
            setUsingSampleData(false);
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
    
    /* Real-time subscription disabled to fix refresh issues
    // Store subscription reference to properly clean up
    let subscriptionRef = null;
    
    // Only set up subscription if not using sample data
    if (!usingSampleData) {
      subscriptionRef = subscribeToLeaderboardUpdates(() => {
        // Only reload data if component is still mounted and not already loading
        if (!loading) {
          loadLeaderboardData();
        }
      });
    }
    
    // Clean up subscription when unmounting or dependencies change
    return () => {
      if (subscriptionRef) {
        supabase.removeChannel(subscriptionRef);
      }
    };
    */
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Papan Peringkat</h1>
        <p className="text-lg text-gray-600">
          {usingSampleData 
            ? 'Menggunakan data sampel (Server belum tersedia)'
            : 'Peringkat berdasarkan perolehan XP'
          }
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peringkat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <p className="text-gray-500">XP</p>
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
                    key={`user-${userId}`} // Add a prefix to ensure uniqueness
                    user={user} 
                    isCurrentUser={isCurrentUserRow}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
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
  );
};

export default Leaderboard;
