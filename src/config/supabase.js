import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ttyoqmcuoqjmtnadgypc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW9xbWN1b3FqbXRuYWRneXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU0MTUsImV4cCI6MjA2MDczMTQxNX0.bgSnqmIfAvS_hwKbnjTLUYzhHlnlOfaLHU72HqPQ6v4';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

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

export default supabase; 