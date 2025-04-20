import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitRemainingTime, setRateLimitRemainingTime] = useState(0);

  useEffect(() => {
    // Check for active session on component mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Handle rate limit countdown
  useEffect(() => {
    let timer;
    if (isRateLimited && rateLimitRemainingTime > 0) {
      timer = setInterval(() => {
        setRateLimitRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRateLimited, rateLimitRemainingTime]);

  // Function to handle rate limit errors
  const handleRateLimitError = (error) => {
    if (error.message.includes('you can only request this after')) {
      const waitTimeMatch = error.message.match(/after (\d+) seconds/);
      if (waitTimeMatch && waitTimeMatch[1]) {
        const waitTime = parseInt(waitTimeMatch[1], 10);
        setRateLimitRemainingTime(waitTime);
        setIsRateLimited(true);
      }
    } else if (error.message.includes('Too Many Requests')) {
      setRateLimitRemainingTime(30); // Default 30 seconds if specific time is not provided
      setIsRateLimited(true);
    }
  };

  const signUp = async (email, password, name) => {
    setLoading(true);
    setError(null);
    
    // Check if currently rate limited
    if (isRateLimited) {
      setError(`Terlalu banyak percobaan. Silakan tunggu ${rateLimitRemainingTime} detik.`);
      setLoading(false);
      throw new Error(`Rate limited. Please try again in ${rateLimitRemainingTime} seconds.`);
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      
      // Check for rate limiting errors
      handleRateLimitError(error);
      
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    
    // Check if currently rate limited
    if (isRateLimited) {
      setError(`Terlalu banyak percobaan. Silakan tunggu ${rateLimitRemainingTime} detik.`);
      setLoading(false);
      throw new Error(`Rate limited. Please try again in ${rateLimitRemainingTime} seconds.`);
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      
      // Check for rate limiting errors
      handleRateLimitError(error);
      
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isRateLimited,
    rateLimitRemainingTime
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 