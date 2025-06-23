import {useContext, useState, useEffect} from "react";
import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';


function Dashboard() {
  const {logout} = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userHabits, setUserHabits] = useState([]);
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [completions, setCompletions] = useState({}); 
  const [completionLoading, setCompletionLoading] = useState({});
  const [editingHabit, setEditingHabit] = useState(null); 
  const [editName, setEditName] = useState(''); 
  const [editDescription, setEditDescription] = useState(''); 

  useEffect(() => {
    fetchUserProfile();
    fetchHabits();
  }, []);

  useEffect(() => {
    if (userHabits.length > 0) {
      fetchTodaysCompletions();
    }
  }, [userHabits]);

  const handleAddHabit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/habits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: habitName,
        description: habitDescription
      })
    });

    if (response.ok) {
      setHabitName('');
      setHabitDescription('');
      fetchHabits();
    } else {
      setError('Failed to add habit');
    }
  } catch (err) {
    setError('Error adding habit');
  }
};

  const fetchHabits = async() => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/habits", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if(response.ok) {
        const userHabit = await response.json();
        setUserHabits(userHabit);
      } else {
         setError("Failed to fetch user Habits");
      }
    } catch (error) {
      setError('Error connectin to server');
    }
  };

  const fetchUserProfile = async() => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers:{
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      if(response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setError("Failed to fetch user profile");
      }
    } catch (error) {
      setError('Error connectin to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysCompletions = async () => {
  try {
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    const response = await fetch(`http://localhost:5000/api/completions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const allCompletions = await response.json();
      
      const todaysCompletions = {};
      allCompletions.forEach(completion => {
        const completionDate = new Date(completion.completed_date).toISOString().split('T')[0];
        if (completionDate === today) {
          todaysCompletions[completion.habit_id] = completion.completed;
        }
      });
      
      setCompletions(todaysCompletions);
    } else {
      console.error('Failed to fetch completions');
    }
  } catch (error) {
    console.error('Error fetching completions:', error);
  }
};

const toggleCompletion = async (habitId) => {
  try {
    // Set loading state for this specific habit
    setCompletionLoading(prev => ({ ...prev, [habitId]: true }));
    
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];
    const currentStatus = completions[habitId] || false;
    
    const response = await fetch('http://localhost:5000/api/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        habitId: habitId,        // Changed from habit_id to habitId
        date: today,            // Changed from completed_date to date
        completed: !currentStatus
      })
    });

    if (response.ok) {
      // Update the completion status in state
      setCompletions(prev => ({
        ...prev,
        [habitId]: !currentStatus
      }));
    } else {
      setError('Failed to update completion status');
    }
  } catch (error) {
    setError('Error updating completion status');
  } finally {
    // Clear loading state for this habit
    setCompletionLoading(prev => ({ ...prev, [habitId]: false }));
  }
};

// Start editing a habit
const startEditing = (habit) => {
  setEditingHabit(habit.id);
  setEditName(habit.name);
  setEditDescription(habit.description);
};

// Cancel editing
const cancelEditing = () => {
  setEditingHabit(null);
  setEditName('');
  setEditDescription('');
};

const saveEdit = async (habitId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/habits/${habitId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editName,
        description: editDescription
      })
    });

    if (response.ok) {
      // Reset editing state
      setEditingHabit(null);
      setEditName('');
      setEditDescription('');
      // Refresh habits list
      fetchHabits();
    } else {
      setError('Failed to update habit');
    }
  } catch (error) {
    setError('Error updating habit');
  }
};

const deleteHabit = async (habitId) => {
  // Show confirmation dialog
  if (!window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
    return; // User cancelled, don't delete
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/habits/${habitId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // If we were editing this habit, cancel the edit
      if (editingHabit === habitId) {
        cancelEditing();
      }
      // Refresh habits list
      fetchHabits();
    } else {
      setError('Failed to delete habit');
    }
  } catch (error) {
    setError('Error deleting habit');
  }
};


  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
};

  const {isLoggedIn} = useContext(AuthContext);
return (
 <>
  <h1>Welcome back, {loading ? 'Loading...' : user ? user.username : 'User'}!</h1>
  {userHabits.length > 0 ? (
    <div>
      <h2>Your Habits</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Habit'}
        </button>
            {showAddForm && (
      <form onSubmit={handleAddHabit}>
        <input
          type="text"
          placeholder="Habit name"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={habitDescription}
          onChange={(e) => setHabitDescription(e.target.value)}
        />
        <button type="submit">Add Habit</button>
      </form>
    )}
   
{userHabits.map(habit => (
  <div key={habit.id} style={{
    border: '1px solid #ccc', 
    padding: '15px', 
    margin: '10px 0',
    borderRadius: '8px',
    backgroundColor: completions[habit.id] ? '#f0f8f0' : '#fff'
  }}>
    {editingHabit === habit.id ? (
      // Edit form when habit is being edited
      <div>
        <h3>Edit Habit</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          saveEdit(habit.id);
        }}>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Habit name"
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Save Changes
            </button>
            <button type="button" onClick={cancelEditing} style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    ) : (
      // Normal habit display when not editing
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          checked={completions[habit.id] || false}
          onChange={() => toggleCompletion(habit.id)}
          disabled={completionLoading[habit.id]}
          style={{ 
            width: '20px', 
            height: '20px',
            cursor: completionLoading[habit.id] ? 'wait' : 'pointer'
          }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 5px 0',
            textDecoration: completions[habit.id] ? 'line-through' : 'none',
            color: completions[habit.id] ? '#666' : '#000'
          }}>
            {habit.name}
          </h3>
          <p style={{ 
            margin: '0',
            color: completions[habit.id] ? '#666' : '#333'
          }}>
            {habit.description}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {completionLoading[habit.id] ? 'Updating...' : 
             completions[habit.id] ? '✅ Done today!' : 'Not completed'}
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => startEditing(habit)}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Edit
            </button>
            <button 
              onClick={() => deleteHabit(habit.id)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
      ))}
    </div>
  ) : (
    <div>
      <h2>Start Your Habit Journey!</h2>
      <p>Create your first habit to get started</p>
      <form onSubmit={handleAddHabit}>
        <input
          type="text"
          placeholder="Habit name"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={habitDescription}
          onChange={(e) => setHabitDescription(e.target.value)}
        />
        <button type="submit">Add Habit</button>
      </form>
    </div>
  )}
  <button onClick={handleLogout}>Logout</button>
 </>
)
}

export default Dashboard