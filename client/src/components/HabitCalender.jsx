import React, { useState, useEffect } from 'react';

const HabitCalendar = ({ habitId, habitName }) => {
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
      
      const response = await fetch(`http://localhost:5000/api/completions/${habitId}`, {
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
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading calendar...</div>;
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '20px 0',
      backgroundColor: '#fff'
    }}>
      {/* Calendar Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <button 
          onClick={goToPreviousMonth}
          style={{
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Previous
        </button>
        
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          {habitName} - {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button 
          onClick={goToNextMonth}
          style={{
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Next →
        </button>
      </div>

      {/* Days of week header */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '2px',
        marginBottom: '10px'
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            padding: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#f5f5f5',
            fontSize: '12px'
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '2px'
      }}>
        {calendarDays.map((dayData, index) => (
          <div
            key={index}
            style={{
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #eee',
              backgroundColor: dayData ? (
                dayData.isCompleted ? '#4CAF50' : 
                dayData.isToday ? '#fff3cd' : '#fff'
              ) : 'transparent',
              color: dayData ? (
                dayData.isCompleted ? 'white' : 
                dayData.isToday ? '#856404' : '#333'
              ) : 'transparent',
              fontWeight: dayData && dayData.isToday ? 'bold' : 'normal',
              fontSize: '14px',
              position: 'relative'
            }}
          >
            {dayData && (
              <>
                {dayData.day}
                {dayData.isCompleted && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '4px',
                    fontSize: '10px'
                  }}>
                    ✓
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: '15px', 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: '#4CAF50',
            borderRadius: '3px'
          }}></div>
          <span>Completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '3px'
          }}></div>
          <span>Today</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: '#fff',
            border: '1px solid #eee',
            borderRadius: '3px'
          }}></div>
          <span>Not completed</span>
        </div>
      </div>
    </div>
  );
};

export default HabitCalendar;