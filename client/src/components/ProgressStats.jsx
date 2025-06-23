import { useState, useEffect } from 'react';
import '../styles/progressStats.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProgressStats({ habitId, habitName, refreshTrigger }) {
  const [stats, setStats] = useState({
    totalCompletions: 0,
    currentStreak: 0,
    bestStreak: 0,
    completionPercentage: 0,
    weeklyStats: {
      thisWeek: 0,
      lastWeek: 0
    },
    monthlyStats: {
      thisMonth: 0,
      lastMonth: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    if (habitId) {
      calculateProgressStats();
    }
  }, [habitId, timeRange]);

  // Add this new useEffect to listen for refreshTrigger changes
  useEffect(() => {
    if (habitId && refreshTrigger) {
      calculateProgressStats();
    }
  }, [refreshTrigger]);

  const calculateProgressStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/completions/${habitId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const completions = await response.json();
        const calculatedStats = processCompletionData(completions);
        setStats(calculatedStats);
      } else {
        setError('Failed to fetch completion data');
      }
    } catch (error) {
      setError('Error calculating progress stats');
      console.error('Stats calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processCompletionData = (completions) => {
    const now = new Date();
    const timeRangeMs = parseInt(timeRange) * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(now.getTime() - timeRangeMs);
    
    // Filter completions within time range and only completed ones
    const filteredCompletions = completions.filter(completion => {
      const completionDate = new Date(completion.completed_date);
      return completionDate >= cutoffDate && completion.completed === true;
    });

    // Calculate total completions
    const totalCompletions = filteredCompletions.length;
    
    // Calculate completion percentage
    const totalDaysInRange = Math.min(parseInt(timeRange), Math.ceil((now - cutoffDate) / (24 * 60 * 60 * 1000)));
    const completionPercentage = totalDaysInRange > 0 ? Math.round((totalCompletions / totalDaysInRange) * 100) : 0;
    
    // Calculate streaks
    const { currentStreak, bestStreak } = calculateStreaks(completions);
    
    // Calculate weekly stats
    const weeklyStats = calculateWeeklyStats(completions, now);
    
    // Calculate monthly stats
    const monthlyStats = calculateMonthlyStats(completions, now);

    return {
      totalCompletions,
      completionPercentage,
      currentStreak,
      bestStreak,
      weeklyStats,
      monthlyStats
    };
  };

  const calculateStreaks = (completions) => {
    const sortedCompletions = completions
      .filter(c => c.completed === true)
      .sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date));

    if (sortedCompletions.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check current streak
    const latestCompletion = new Date(sortedCompletions[0].completed_date);
    latestCompletion.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - latestCompletion) / (24 * 60 * 60 * 1000));
    
    if (daysDiff <= 1) {
      let streakDate = new Date(latestCompletion);
      
      for (let completion of sortedCompletions) {
        const compDate = new Date(completion.completed_date);
        compDate.setHours(0, 0, 0, 0);
        
        if (compDate.getTime() === streakDate.getTime()) {
          currentStreak++;
          streakDate.setDate(streakDate.getDate() - 1);
        } else if (compDate < streakDate) {
          break;
        }
      }
    }

    // Calculate best streak
    const completionDates = sortedCompletions.map(c => {
      const date = new Date(c.completed_date);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }).sort((a, b) => a - b);

    for (let i = 0; i < completionDates.length; i++) {
      tempStreak = 1;
      
      for (let j = i + 1; j < completionDates.length; j++) {
        const dayDiff = (completionDates[j] - completionDates[j-1]) / (24 * 60 * 60 * 1000);
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          break;
        }
      }
      
      bestStreak = Math.max(bestStreak, tempStreak);
    }

    return { currentStreak, bestStreak };
  };

  const calculateWeeklyStats = (completions, now) => {
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setTime(endOfLastWeek.getTime() - 1);

    const thisWeek = completions.filter(completion => {
      const compDate = new Date(completion.completed_date);
      return compDate >= startOfThisWeek && compDate <= now && completion.completed === true;
    }).length;

    const lastWeek = completions.filter(completion => {
      const compDate = new Date(completion.completed_date);
      return compDate >= startOfLastWeek && compDate <= endOfLastWeek && completion.completed === true;
    }).length;

    return { thisWeek, lastWeek };
  };

  const calculateMonthlyStats = (completions, now) => {
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    const thisMonth = completions.filter(completion => {
      const compDate = new Date(completion.completed_date);
      return compDate >= startOfThisMonth && compDate <= now && completion.completed === true;
    }).length;

    const lastMonth = completions.filter(completion => {
      const compDate = new Date(completion.completed_date);
      return compDate >= startOfLastMonth && compDate <= endOfLastMonth && completion.completed === true;
    }).length;

    return { thisMonth, lastMonth };
  };

  if (loading) {
    return (
      <div className="progress-stats-loading">
        <h4>Loading...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-stats-error">
        <h4>Error</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="progress-stats-container">
      <div className="progress-stats-header">
        <h4>{habitName}</h4>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="progress-stats-select"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-main-grid">
        {/* Total Completions */}
        <div className="stat-card stat-card-completions">
          <div className="stat-value stat-value-blue">
            {stats.totalCompletions}
          </div>
          <div className="stat-label">Total Completions</div>
        </div>

        {/* Completion Percentage */}
        <div className="stat-card stat-card-percentage">
          <div className="stat-value stat-value-green">
            {stats.completionPercentage}%
          </div>
          <div className="stat-label">Completion Rate</div>
        </div>

        {/* Current Streak */}
        <div className="stat-card stat-card-current-streak">
          <div className="stat-value stat-value-orange">
            {stats.currentStreak}
          </div>
          <div className="stat-label">Current Streak</div>
        </div>

        {/* Best Streak */}
        <div className="stat-card stat-card-best-streak">
          <div className="stat-value stat-value-pink">
            {stats.bestStreak}
          </div>
          <div className="stat-label">Best Streak</div>
        </div>
      </div>

      {/* Weekly & Monthly Comparison */}
      <div className="stats-comparison-grid">
        {/* Weekly Stats */}
        <div className="comparison-card comparison-card-weekly">
          <h5>📅 Weekly Progress</h5>
          <div>
            <div className="comparison-row">
              <span>This Week:</span>
              <span className="comparison-value">{stats.weeklyStats.thisWeek} days</span>
            </div>
            <div className="comparison-row">
              <span>Last Week:</span>
              <span className="comparison-value">{stats.weeklyStats.lastWeek} days</span>
            </div>
            <div className={`comparison-trend ${
              stats.weeklyStats.thisWeek >= stats.weeklyStats.lastWeek 
                ? 'comparison-trend-positive' 
                : 'comparison-trend-negative'
            }`}>
              {stats.weeklyStats.thisWeek >= stats.weeklyStats.lastWeek ? '📈 Improving!' : '📉 Keep pushing!'}
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="comparison-card comparison-card-monthly">
          <h5>📆 Monthly Progress</h5>
          <div>
            <div className="comparison-row">
              <span>This Month:</span>
              <span className="comparison-value">{stats.monthlyStats.thisMonth} days</span>
            </div>
            <div className="comparison-row">
              <span>Last Month:</span>
              <span className="comparison-value">{stats.monthlyStats.lastMonth} days</span>
            </div>
            <div className={`comparison-trend ${
              stats.monthlyStats.thisMonth >= stats.monthlyStats.lastMonth 
                ? 'comparison-trend-positive' 
                : 'comparison-trend-negative'
            }`}>
              {stats.monthlyStats.thisMonth >= stats.monthlyStats.lastMonth ? '🚀 Great progress!' : '💪 Keep going!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressStats;