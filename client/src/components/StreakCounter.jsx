import React, { useState, useEffect } from 'react';

const StreakCounter = ({ habitId, habitName }) => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    streakBroken: false
  });
  const [loading, setLoading] = useState(true);

  // Fetch completion data and calculate streaks
  const calculateStreaks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/completions/${habitId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const completions = await response.json();
        
        // Filter only completed habits and sort by date (newest first)
        const completedDates = completions
          .filter(completion => completion.completed === true)
          .map(completion => new Date(completion.completed_date).toISOString().split('T')[0])
          .sort((a, b) => new Date(b) - new Date(a)); // Sort descending (newest first)

        if (completedDates.length === 0) {
          setStreakData({
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedDate: null,
            streakBroken: false
          });
          return;
        }

        // Calculate current streak
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]; // 24 hours ago
        
        let currentStreak = 0;
        let streakBroken = false;
        let checkDate = today;

        // Check if today is completed, if not check yesterday
        if (completedDates.includes(today)) {
          currentStreak = 1;
          checkDate = yesterday;
        } else if (completedDates.includes(yesterday)) {
          currentStreak = 1;
          checkDate = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]; // Day before yesterday
        } else {
          // No completion today or yesterday - streak is broken
          streakBroken = true;
          currentStreak = 0;
        }

        // Continue counting backwards for current streak
        if (currentStreak > 0) {
          while (completedDates.includes(checkDate)) {
            currentStreak++;
            // Go back one day
            const previousDay = new Date(checkDate);
            previousDay.setDate(previousDay.getDate() - 1);
            checkDate = previousDay.toISOString().split('T')[0];
          }
        }

        // Calculate longest streak ever
        let longestStreak = 0;
        let tempStreak = 0;
        
        // Sort dates ascending for longest streak calculation
        const sortedDates = [...completedDates].sort((a, b) => new Date(a) - new Date(b));
        
        for (let i = 0; i < sortedDates.length; i++) {
          if (i === 0) {
            tempStreak = 1;
          } else {
            const currentDate = new Date(sortedDates[i]);
            const previousDate = new Date(sortedDates[i - 1]);
            const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
            
            if (dayDifference === 1) {
              // Consecutive day
              tempStreak++;
            } else {
              // Streak broken, check if this was the longest
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1; // Start new streak
            }
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak); // Check final streak

        setStreakData({
          currentStreak,
          longestStreak,
          lastCompletedDate: completedDates[0] || null,
          streakBroken
        });

      }
    } catch (error) {
      console.error('Error calculating streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (habitId) {
      calculateStreaks();
    }
  }, [habitId]);

  // Helper function to get streak emoji based on current streak
  const getStreakEmoji = (streak) => {
    if (streak === 0) return '😴';
    if (streak <= 3) return '🔥';
    if (streak <= 7) return '🚀';
    if (streak <= 14) return '⭐';
    if (streak <= 30) return '💎';
    return '👑'; // 30+ days
  };

  // Helper function to get encouraging message
  const getStreakMessage = (currentStreak, streakBroken) => {
    if (currentStreak === 0 && streakBroken) {
      return "Don't give up! Start your streak today! 💪";
    }
    if (currentStreak === 0) {
      return "Ready to start your first streak? 🌟";
    }
    if (currentStreak === 1) {
      return "Great start! Keep it going! 🎯";
    }
    if (currentStreak <= 7) {
      return "You're building momentum! 🔥";
    }
    if (currentStreak <= 14) {
      return "Fantastic streak! You're on fire! 🚀";
    }
    if (currentStreak <= 30) {
      return "Incredible dedication! ⭐";
    }
    return "You're a habit master! 👑";
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '15px', 
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
        margin: '10px 0'
      }}>
        Calculating streaks...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      border: '2px solid #e9ecef',
      borderRadius: '10px',
      padding: '15px',
      margin: '10px 0',
      textAlign: 'center'
    }}>
      {/* Header */}
      <h4 style={{ 
        margin: '0 0 15px 0', 
        color: '#495057',
        fontSize: '16px'
      }}>
        🔥 Streak Tracker
      </h4>

      {/* Main Streak Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        {/* Current Streak */}
        <div style={{
          backgroundColor: streakData.currentStreak > 0 ? '#d4edda' : '#f8d7da',
          border: `2px solid ${streakData.currentStreak > 0 ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px',
          padding: '10px',
          minWidth: '80px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>
            {getStreakEmoji(streakData.currentStreak)}
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: streakData.currentStreak > 0 ? '#155724' : '#721c24'
          }}>
            {streakData.currentStreak}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            Current Streak
          </div>
        </div>

        {/* Best Streak */}
        <div style={{
          backgroundColor: '#fff3cd',
          border: '2px solid #ffeaa7',
          borderRadius: '8px',
          padding: '10px',
          minWidth: '80px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>
            🏆
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: '#856404'
          }}>
            {streakData.longestStreak}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            Best Streak
          </div>
        </div>
      </div>

      {/* Encouraging Message */}
      <div style={{
        backgroundColor: '#e2e3e5',
        borderRadius: '6px',
        padding: '8px',
        fontSize: '14px',
        color: '#495057',
        fontStyle: 'italic',
        marginBottom: '10px'
      }}>
        {getStreakMessage(streakData.currentStreak, streakData.streakBroken)}
      </div>

      {/* Last Completed Info */}
      {streakData.lastCompletedDate && (
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          Last completed: {new Date(streakData.lastCompletedDate + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )}

      {/* Streak Status Indicator */}
      <div style={{
        marginTop: '10px',
        fontSize: '12px',
        padding: '4px 8px',
        borderRadius: '4px',
        display: 'inline-block',
        backgroundColor: streakData.currentStreak > 0 ? '#d1ecf1' : '#f8d7da',
        color: streakData.currentStreak > 0 ? '#0c5460' : '#721c24'
      }}>
        {streakData.currentStreak > 0 ? 
          `🔥 ${streakData.currentStreak} day${streakData.currentStreak !== 1 ? 's' : ''} strong!` : 
          '💤 No active streak'
        }
      </div>
    </div>
  );
};

export default StreakCounter;