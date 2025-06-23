import React, { useState, useEffect } from 'react';
import '../styles/habitCalender.css';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HabitCalendar = ({ habitId, habitName, refreshTrigger }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(true);

  // Get first day of current month and number of days
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch completion data for the current month
  const fetchMonthCompletions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/api/completions/${habitId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const habitCompletions = await response.json();
        
        // Convert array to object with date as key for easy lookup
        const completionMap = {};
        habitCompletions.forEach(completion => {
          const date = new Date(completion.completed_date).toISOString().split('T')[0];
          completionMap[date] = completion.completed;
        });
        
        setCompletions(completionMap);
      }
    } catch (error) {
      console.error('Error fetching completions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (habitId) {
      fetchMonthCompletions();
    }
  }, [habitId, currentMonth]);

  // Add this new useEffect to listen for refreshTrigger changes
  useEffect(() => {
    if (habitId && refreshTrigger) {
      fetchMonthCompletions();
    }
  }, [refreshTrigger]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days array
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isCompleted = completions[dateString] === true;
      const isToday = dateString === new Date().toISOString().split('T')[0];
      
      days.push({
        day,
        dateString,
        isCompleted,
        isToday
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className="habit-calendar loading">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="habit-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button 
          onClick={goToPreviousMonth}
          className="calendar-nav-button"
        >
          ← Previous
        </button>
        
        <h3 className="calendar-title">
          {habitName} - {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button 
          onClick={goToNextMonth}
          className="calendar-nav-button"
        >
          Next →
        </button>
      </div>

      {/* Days of week header */}
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {calendarDays.map((dayData, index) => {
          if (!dayData) {
            // Empty cell
            return <div key={index} className="calendar-day empty"></div>;
          }

          // Determine CSS classes for the day
          const dayClasses = ['calendar-day'];
          
          if (dayData.isCompleted && dayData.isToday) {
            dayClasses.push('completed', 'today');
          } else if (dayData.isCompleted) {
            dayClasses.push('completed');
          } else if (dayData.isToday) {
            dayClasses.push('today');
          } else {
            dayClasses.push('regular');
          }

          return (
            <div
              key={index}
              className={dayClasses.join(' ')}
            >
              {dayData.day}
              {dayData.isCompleted && (
                <span className="calendar-day-check">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-color regular"></div>
          <span>Not completed</span>
        </div>
      </div>
    </div>
  );
};

export default HabitCalendar;