import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ttyoqmcuoqjmtnadgypc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW9xbWN1b3FqbXRuYWRneXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU0MTUsImV4cCI6MjA2MDczMTQxNX0.bgSnqmIfAvS_hwKbnjTLUYzhHlnlOfaLHU72HqPQ6v4';

// Initialize Supabase client with options to prevent refresh loops
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    // Disable real-time subscriptions by default
    params: {
      eventsPerSecond: 2
    }
  }
});

// Request throttling implementation
const authRequestsTimestamps = [];
const AUTH_REQUEST_LIMIT = 3; // Maximum number of auth requests
const AUTH_TIMEFRAME_MS = 60000; // Timeframe in milliseconds (1 minute)

// Function to check if we should throttle requests
const shouldThrottleAuthRequest = () => {
  const now = Date.now();
  // Remove timestamps older than the timeframe
  while (
    authRequestsTimestamps.length > 0 && 
    now - authRequestsTimestamps[0] > AUTH_TIMEFRAME_MS
  ) {
    authRequestsTimestamps.shift();
  }
  
  // Check if we've exceeded the limit
  return authRequestsTimestamps.length >= AUTH_REQUEST_LIMIT;
};

// Function to track auth requests
const trackAuthRequest = () => {
  const now = Date.now();
  authRequestsTimestamps.push(now);
  return now;
};

// Get the current user session
export const getUserSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

// Get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

// Sign in with email and password
export const signIn = async (email, password) => {
  // Check if we should throttle
  if (shouldThrottleAuthRequest()) {
    const waitTime = Math.ceil((AUTH_TIMEFRAME_MS - (Date.now() - authRequestsTimestamps[0])) / 1000);
    throw new Error(`Too many login attempts. Please try again after ${waitTime} seconds.`);
  }
  
  // Track this request
  trackAuthRequest();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return { data };
};

// Sign up with email and password
export const signUp = async (email, password, metadata = {}) => {
  // Check if we should throttle
  if (shouldThrottleAuthRequest()) {
    const waitTime = Math.ceil((AUTH_TIMEFRAME_MS - (Date.now() - authRequestsTimestamps[0])) / 1000);
    throw new Error(`Too many signup attempts. Please try again after ${waitTime} seconds.`);
  }
  
  // Track this request
  trackAuthRequest();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  if (error) throw error;
  return { data };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
  
  return true;
};

// Update user profile
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return { data };
};

// Get user profile
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return { data, error };
};

// ----- Leaderboard Functions -----

// Get leaderboard data with pagination
export const getLeaderboard = async (page = 1, limit = 10) => {
  try {
    // First, check if the leaderboard table exists
    const { error: tableCheckError } = await supabase
      .from('leaderboard')
      .select('count', { count: 'exact', head: true });
    
    // If table doesn't exist yet, return empty data
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.warn('Leaderboard table does not exist yet');
      return { data: [], count: 0, error: null, usingSampleData: true };
    }
    
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Get leaderboard with total count for pagination
    const { data, error, count } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact' })
      .order('score', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    // Add rank to each user based on their position
    const rankedData = data.map((user, index) => ({
      ...user,
      rank: from + index + 1
    }));
    
    return { data: rankedData, count, error: null, usingSampleData: false };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return { data: [], count: 0, error: error.message, usingSampleData: true };
  }
};

// Get a user's leaderboard position
export const getUserLeaderboardPosition = async (userId) => {
  try {
    // First check if the user exists in the leaderboard
    const { data: userData, error: userError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        // User not found in leaderboard
        return { data: null, rank: null, error: null };
      }
      throw userError;
    }
    
    // Get count of users with higher scores to determine rank
    const { count, error: rankError } = await supabase
      .from('leaderboard')
      .select('count', { count: 'exact', head: true })
      .gt('score', userData.score);
    
    if (rankError) throw rankError;
    
    // Rank is count + 1 (because ranks start at 1, not 0)
    const rank = count + 1;
    
    return { data: userData, rank, error: null };
  } catch (error) {
    console.error('Error getting user leaderboard position:', error);
    return { data: null, rank: null, error: error.message };
  }
};

// Update a user's score in the leaderboard
export const updateUserScore = async (userId, name, score, increment = false) => {
  try {
    // Check if user exists in leaderboard
    const { data: existingUser, error: checkError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    let result;
    
    if (!existingUser) {
      // User doesn't exist in leaderboard, create new entry
      result = await supabase
        .from('leaderboard')
        .insert([
          { user_id: userId, name, score }
        ])
        .select()
        .single();
    } else if (increment) {
      // Increment existing score
      result = await supabase
        .from('leaderboard')
        .update({ 
          score: existingUser.score + score,
          name: name || existingUser.name,
          updated_at: new Date()
        })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Set absolute score value
      result = await supabase
        .from('leaderboard')
        .update({ 
          score,
          name: name || existingUser.name, 
          updated_at: new Date()
        })
        .eq('user_id', userId)
        .select()
        .single();
    }
    
    const { data, error } = result;
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user score:', error);
    return { data: null, error: error.message };
  }
};

// Subscribe to real-time leaderboard updates
export const subscribeToLeaderboardUpdates = (callback) => {
  // Disabled to fix refresh issues
  console.warn('Real-time subscriptions temporarily disabled');
  return { unsubscribe: () => {} }; // Return dummy object with unsubscribe method
  
  /* 
  // Add a debounce to prevent excessive refreshes
  let lastCallTime = 0;
  const minInterval = 5000; // minimum 5 seconds between refreshes
  
  const debouncedCallback = (payload) => {
    const currentTime = Date.now();
    if (currentTime - lastCallTime >= minInterval) {
      lastCallTime = currentTime;
      callback(payload);
    }
  };
  
  return supabase
    .channel('leaderboard-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'leaderboard' },
      (payload) => {
        debouncedCallback(payload);
      }
    )
    .subscribe();
  */
};

export default supabase; 