import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import '../styles/charts.css';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Charts = ({ habits = [], habitId, refreshTrigger }) => {
  const [completionsData, setCompletionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30'); // days
  const [chartType, setChartType] = useState('trends'); // trends, comparison, overview

  useEffect(() => {
    if (habits.length > 0) {
      fetchCompletionsData();
    }
  }, [habits, selectedTimeRange]);

  // Add this new useEffect to listen for refreshTrigger changes
  useEffect(() => {
    if (habits.length > 0 && refreshTrigger) {
      fetchCompletionsData();
    }
  }, [refreshTrigger]);

  const fetchCompletionsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/completions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const allCompletions = await response.json();
        processCompletionsData(allCompletions);
      } else {
        setError('Failed to fetch completions data');
      }
    } catch (error) {
      setError('Error fetching completions data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processCompletionsData = (completions) => {
    const days = parseInt(selectedTimeRange);
    const today = new Date();
    const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    
    // Create date range array
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      dateRange.push(date.toISOString().split('T')[0]);
    }

    // Process data for each date
    const processedData = dateRange.map(date => {
      const dataPoint = {
        date: date,
        formattedDate: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        totalHabits: habits.length,
        completedHabits: 0,
        completionRate: 0
      };

      // Add individual habit data
      habits.forEach(habit => {
        const habitCompletion = completions.find(c => 
          c.habit_id === habit.id && 
          new Date(c.completed_date).toISOString().split('T')[0] === date &&
          c.completed
        );
        
        const habitKey = `habit_${habit.id}`;
        dataPoint[habitKey] = habitCompletion ? 1 : 0;
        dataPoint[`${habitKey}_name`] = habit.name;
        
        if (habitCompletion) {
          dataPoint.completedHabits++;
        }
      });

      // Calculate completion rate
      dataPoint.completionRate = habits.length > 0 
        ? Math.round((dataPoint.completedHabits / habits.length) * 100) 
        : 0;

      return dataPoint;
    });

    setCompletionsData(processedData);
  };

  const getHabitComparisonData = () => {
    if (!completionsData.length) return [];

    return habits.map(habit => {
      const habitKey = `habit_${habit.id}`;
      const totalCompletions = completionsData.reduce((sum, day) => sum + (day[habitKey] || 0), 0);
      const completionRate = Math.round((totalCompletions / completionsData.length) * 100);
      
      return {
        name: habit.name.length > 15 ? habit.name.substring(0, 15) + '...' : habit.name,
        fullName: habit.name,
        completions: totalCompletions,
        completionRate: completionRate,
        totalDays: completionsData.length
      };
    });
  };

  const getOverviewData = () => {
    if (!completionsData.length) return [];

    const totalDays = completionsData.length;
    const perfectDays = completionsData.filter(day => day.completionRate === 100).length;
    const goodDays = completionsData.filter(day => day.completionRate >= 70 && day.completionRate < 100).length;
    const okayDays = completionsData.filter(day => day.completionRate >= 40 && day.completionRate < 70).length;
    const poorDays = completionsData.filter(day => day.completionRate < 40).length;

    return [
      { name: 'Perfect', shortName: 'Perfect (100%)', value: perfectDays, color: '#4CAF50', fullName: 'Perfect Days (100%)' },
      { name: 'Good', shortName: 'Good (70-99%)', value: goodDays, color: '#8BC34A', fullName: 'Good Days (70-99%)' },
      { name: 'Okay', shortName: 'Okay (40-69%)', value: okayDays, color: '#FFC107', fullName: 'Okay Days (40-69%)' },
      { name: 'Poor', shortName: 'Poor (<40%)', value: poorDays, color: '#FF5722', fullName: 'Poor Days (<40%)' }
    ];
  };

  // Custom label function for pie chart
  const renderCustomLabel = (entry) => {
    const percent = ((entry.value / completionsData.length) * 100).toFixed(0);
    // Only show label if the slice is big enough (>5%)
    if (percent > 5) {
      return `${entry.name}: ${percent}%`;
    }
    return '';
  };

  const renderTrendsChart = () => (
    <div className="chart-section">
      <h3>📈 Completion Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={completionsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'completionRate') return [`${value}%`, 'Completion Rate'];
              return [value, name];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="completionRate" 
            stroke="#667eea" 
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Overall Completion Rate"
          />
          {habits.slice(0, 3).map((habit, index) => (
            <Line
              key={habit.id}
              type="monotone"
              dataKey={`habit_${habit.id}`}
              stroke={['#48bb78', '#805ad5', '#ed8936'][index]}
              strokeWidth={2}
              dot={{ r: 3 }}
              name={habit.name.length > 20 ? habit.name.substring(0, 20) + '...' : habit.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderComparisonChart = () => (
    <div className="chart-section">
      <h3>📊 Habit Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={getHabitComparisonData()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name, props) => {
              if (name === 'completionRate') return [`${value}%`, 'Completion Rate'];
              if (name === 'completions') return [`${value} days`, 'Completed Days'];
              return [value, name];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return `Habit: ${payload[0].payload.fullName}`;
              }
              return label;
            }}
          />
          <Legend />
          <Bar 
            dataKey="completionRate" 
            fill="#48bb78" 
            name="Completion Rate (%)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderOverviewChart = () => (
    <div className="chart-section">
      <h3>🎯 Performance Overview</h3>
      <div className="overview-container">
        <div className="overview-chart">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={getOverviewData().filter(item => item.value > 0)} // Only show non-zero values
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getOverviewData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} days (${((value / completionsData.length) * 100).toFixed(1)}%)`, 
                  props.payload.fullName
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="overview-stats">
          <h4>📊 Quick Stats</h4>
          
          <div className="stat-card">
            <div className="stat-label">Total Days Tracked</div>
            <div className="stat-value primary">{completionsData.length}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Average Completion Rate</div>
            <div className="stat-value success">
              {completionsData.length > 0 
                ? Math.round(completionsData.reduce((sum, day) => sum + day.completionRate, 0) / completionsData.length)
                : 0}%
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Best Day</div>
            <div className="stat-value warning small">
              {completionsData.length > 0
                ? (() => {
                    const bestDay = completionsData.reduce((best, day) => 
                      day.completionRate > best.completionRate ? day : best
                    );
                    return `${bestDay.formattedDate} (${bestDay.completionRate}%)`;
                  })()
                : 'N/A'}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Total Habits</div>
            <div className="stat-value secondary">{habits.length}</div>
          </div>

          {/* Legend for pie chart */}
          <div className="legend-container">
            <h5>Categories:</h5>
            {getOverviewData().map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="legend-text">
                  <strong>{item.shortName}:</strong> {item.value} days
                  <span className="legend-percentage">
                    ({completionsData.length > 0 ? ((item.value / completionsData.length) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="charts-container">
        <div className="charts-loading">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-container">
        <div className="charts-error">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="charts-container">
        <div className="charts-empty">
          <h3>📊 Progress Analytics</h3>
          <p>Create some habits and start tracking to see your progress charts!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-container">
      <div className="charts-card">
        <div className="charts-header">
          <h2 className="charts-title">📊 Progress Analytics</h2>
          <div className="charts-controls">
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="charts-select"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 2 weeks</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 2 months</option>
              <option value="90">Last 3 months</option>
            </select>
            <select 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value)}
              className="charts-select"
            >
              <option value="trends">📈 Trends</option>
              <option value="comparison">📊 Comparison</option>
              <option value="overview">🎯 Overview</option>
            </select>
          </div>
        </div>

        {chartType === 'trends' && renderTrendsChart()}
        {chartType === 'comparison' && renderComparisonChart()}
        {chartType === 'overview' && renderOverviewChart()}
      </div>
    </div>
  );
};

export default Charts;