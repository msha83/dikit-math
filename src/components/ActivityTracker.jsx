import { useState, useEffect } from 'react';

// This component doesn't render anything, it just provides functions for tracking activities
const useActivityTracker = () => {
  const [userProgress, setUserProgress] = useState({
    completedTopics: [],
    streak: 0,
    xpPoints: 0,
    activities: []
  });

  useEffect(() => {
    // Load user progress from localStorage on initial mount
    const storedProgress = localStorage.getItem('userProgress');
    if (storedProgress) {
      setUserProgress(JSON.parse(storedProgress));
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Function to record a completed topic
  const completeTopicActivity = (topicId, category, title) => {
    // Check if already completed
    const isAlreadyCompleted = userProgress.completedTopics.some(
      topic => topic.id === topicId
    );

    if (isAlreadyCompleted) {
      return; // Don't record duplicate completions
    }

    const newCompletedTopic = {
      id: topicId,
      category,
      title,
      completedAt: Date.now()
    };

    // Add new activity
    const newActivity = {
      id: Date.now(),
      type: 'material',
      title,
      category,
      timestamp: Date.now(),
      xpGained: 50,
      progress: 100
    };

    setUserProgress(prev => ({
      ...prev,
      completedTopics: [...prev.completedTopics, newCompletedTopic],
      activities: [newActivity, ...prev.activities].slice(0, 15), // Keep only 15 most recent
      xpPoints: prev.xpPoints + 50,
      streak: updateStreak(prev.streak)
    }));

    return newActivity;
  };

  // Function to record quiz activity
  const completeQuizActivity = (quizId, category, title, score, totalQuestions) => {
    const newActivity = {
      id: Date.now(),
      type: 'soal',
      title,
      category,
      timestamp: Date.now(),
      score,
      totalQuestions,
      xpGained: calculateXpForQuiz(score, totalQuestions)
    };

    setUserProgress(prev => ({
      ...prev,
      activities: [newActivity, ...prev.activities].slice(0, 15),
      xpPoints: prev.xpPoints + newActivity.xpGained,
      streak: updateStreak(prev.streak)
    }));

    return newActivity;
  };

  // Function to record flashcard activity
  const completeFlashcardActivity = (deckId, category, title, cardsReviewed) => {
    const newActivity = {
      id: Date.now(),
      type: 'flashcard',
      title,
      category,
      timestamp: Date.now(),
      cardsReviewed,
      xpGained: cardsReviewed * 5
    };

    setUserProgress(prev => ({
      ...prev,
      activities: [newActivity, ...prev.activities].slice(0, 15),
      xpPoints: prev.xpPoints + newActivity.xpGained,
      streak: updateStreak(prev.streak)
    }));

    return newActivity;
  };

  // Helper function to update streak based on last activity date
  const updateStreak = (currentStreak) => {
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Get the most recent activity date
    const lastActivity = userProgress.activities[0]?.timestamp;
    if (!lastActivity) {
      return 1; // First activity, streak starts at 1
    }
    
    const lastActivityDate = new Date(lastActivity).setHours(0, 0, 0, 0);
    const yesterday = today - 86400000; // 24 hours in milliseconds
    
    if (lastActivityDate === today) {
      // Already logged an activity today, don't increment
      return currentStreak;
    } else if (lastActivityDate === yesterday) {
      // Activity was yesterday, increment streak
      return currentStreak + 1;
    } else {
      // Activity was before yesterday, reset streak
      return 1;
    }
  };

  // Helper function to calculate XP for quiz based on score
  const calculateXpForQuiz = (score, totalQuestions) => {
    const percentScore = (score / totalQuestions) * 100;
    
    if (percentScore >= 90) {
      return 100; // Excellent performance
    } else if (percentScore >= 70) {
      return 70; // Good performance
    } else if (percentScore >= 50) {
      return 50; // Average performance
    } else {
      return 30; // At least they tried
    }
  };

  // Function to get rank based on XP
  const getUserRank = () => {
    const xp = userProgress.xpPoints;
    
    if (xp >= 1000) {
      return 'Master';
    } else if (xp >= 500) {
      return 'Ahli';
    } else if (xp >= 200) {
      return 'Menengah';
    } else {
      return 'Pemula';
    }
  };

  // Function to get next XP milestone
  const getNextMilestone = () => {
    const xp = userProgress.xpPoints;
    
    if (xp < 200) {
      return 200; // Next milestone is "Menengah"
    } else if (xp < 500) {
      return 500; // Next milestone is "Ahli"
    } else if (xp < 1000) {
      return 1000; // Next milestone is "Master"
    } else {
      return xp + 500; // Set a new milestone 500 XP away
    }
  };

  return {
    userProgress,
    completeTopicActivity,
    completeQuizActivity,
    completeFlashcardActivity,
    getUserRank,
    getNextMilestone
  };
};

export default useActivityTracker; 