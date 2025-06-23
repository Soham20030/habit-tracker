import { useState, useEffect } from 'react';

function ProgressStats({ habitId, habitName }) {
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

  const calculateProgressStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/completions/${habitId}`, {
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
      <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
        <h4>📊 Progress Stats - Loading...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '15px', border: '1px solid #f44336', borderRadius: '8px', margin: '10px 0', backgroundColor: '#ffebee' }}>
        <h4>📊 Progress Stats - Error</h4>
        <p style={{ color: '#f44336', margin: '5px 0' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '15px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      margin: '10px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0 }}>📊 Progress Stats: {habitName}</h4>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Main Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px',
        marginBottom: '15px'
      }}>
        {/* Total Completions */}
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
            {stats.totalCompletions}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Completions</div>
        </div>

        {/* Completion Percentage */}
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '6px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
            {stats.completionPercentage}%
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Completion Rate</div>
        </div>

        {/* Current Streak */}
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '6px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
            {stats.currentStreak}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Current Streak</div>
        </div>

        {/* Best Streak */}
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fce4ec', borderRadius: '6px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
            {stats.bestStreak}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Best Streak</div>
        </div>
      </div>

      {/* Weekly & Monthly Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {/* Weekly Stats */}
        <div style={{ padding: '10px', backgroundColor: '#f3e5f5', borderRadius: '6px' }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#7b1fa2' }}>📅 Weekly Progress</h5>
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>This Week:</span>
              <strong>{stats.weeklyStats.thisWeek} days</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last Week:</span>
              <strong>{stats.weeklyStats.lastWeek} days</strong>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: stats.weeklyStats.thisWeek >= stats.weeklyStats.lastWeek ? '#4caf50' : '#f44336',
              marginTop: '4px',
              textAlign: 'center'
            }}>
              {stats.weeklyStats.thisWeek >= stats.weeklyStats.lastWeek ? '📈 Improving!' : '📉 Keep pushing!'}
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div style={{ padding: '10px', backgroundColor: '#e0f2f1', borderRadius: '6px' }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#00695c' }}>📆 Monthly Progress</h5>
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>This Month:</span>
              <strong>{stats.monthlyStats.thisMonth} days</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last Month:</span>
              <strong>{stats.monthlyStats.lastMonth} days</strong>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: stats.monthlyStats.thisMonth >= stats.monthlyStats.lastMonth ? '#4caf50' : '#f44336',
              marginTop: '4px',
              textAlign: 'center'
            }}>
              {stats.monthlyStats.thisMonth >= stats.monthlyStats.lastMonth ? '🚀 Great progress!' : '💪 Keep going!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressStats;