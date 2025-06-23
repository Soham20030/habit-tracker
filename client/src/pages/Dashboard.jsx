import {useContext, useState, useEffect} from "react";
import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';
import HabitCalendar from '../components/HabitCalender';
import StreakCounter from '../components/StreakCounter';
import ProgressStats from '../components/ProgressStats';
import Charts from '../components/Charts';
import '../styles/dashboard.css';
import Navbar from '../components/Navbar';
import Footer from "../components/Footer";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const [justCompleted, setJustCompleted] = useState({});
  
  // Add refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      const response = await fetch(`${BASE_URL}/api/habits`, {
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
        setShowAddForm(false);
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
      const response = await fetch(`${BASE_URL}/api/habits`, {
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
      setError('Error connecting to server');
    }
  };

  const fetchUserProfile = async() => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/auth/profile`, {
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
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysCompletions = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`${BASE_URL}/api/completions`, {
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
      setCompletionLoading(prev => ({ ...prev, [habitId]: true }));
      
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const currentStatus = completions[habitId] || false;
      
      const response = await fetch(`${BASE_URL}/api/habits/${habitId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          habitId: habitId,
          date: today,
          completed: !currentStatus
        })
      });

      if (response.ok) {
        setCompletions(prev => ({
          ...prev,
          [habitId]: !currentStatus
        }));

        // Trigger celebration animation if completing (not uncompleting)
        if (!currentStatus) {
          setJustCompleted(prev => ({ ...prev, [habitId]: true }));
          setTimeout(() => {
            setJustCompleted(prev => ({ ...prev, [habitId]: false }));
          }, 600);
        }

        // Trigger refresh for all child components
        setRefreshTrigger(prev => prev + 1);
      } else {
        setError('Failed to update completion status');
      }
    } catch (error) {
      setError('Error updating completion status');
    } finally {
      setCompletionLoading(prev => ({ ...prev, [habitId]: false }));
    }
  };

  const startEditing = (habit) => {
    setEditingHabit(habit.id);
    setEditName(habit.name);
    setEditDescription(habit.description);
  };

  const cancelEditing = () => {
    setEditingHabit(null);
    setEditName('');
    setEditDescription('');
  };

  const saveEdit = async (habitId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/habits/${habitId}`, {
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
        setEditingHabit(null);
        setEditName('');
        setEditDescription('');
        fetchHabits();
      } else {
        setError('Failed to update habit');
      }
    } catch (error) {
      setError('Error updating habit');
    }
  };

  const deleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/habits/${habitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        if (editingHabit === habitId) {
          cancelEditing();
        }
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
        <Navbar/>
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {loading ? 'Loading...' : user ? user.username : 'User'}!</h1>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {userHabits.length > 0 && (
        <div className="charts-section">
          <Charts habits={userHabits} refreshTrigger={refreshTrigger} />
        </div>
      )}

      {userHabits.length > 0 ? (
        <div className="habits-section">
          <div className="section-header">
            <h2>Your Habits</h2>
            <button 
              className={`add-habit-btn ${showAddForm ? 'cancel' : ''}`}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : 'Add New Habit'}
            </button>
          </div>

          {showAddForm && (
            <div className="add-habit-form">
              <h3>Add New Habit</h3>
              <form onSubmit={handleAddHabit}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter habit name..."
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Add a description (optional)..."
                    value={habitDescription}
                    onChange={(e) => setHabitDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Habit
                  </button>
                </div>
              </form>
            </div>
          )}
   
          <div className="habits-grid">
            {userHabits.map(habit => (
              <div 
                key={habit.id} 
                className={`habit-card ${completions[habit.id] ? 'completed' : ''} ${justCompleted[habit.id] ? 'just-completed' : ''}`}
              >
                {editingHabit === habit.id ? (
                  <div className="add-habit-form">
                    <h3>Edit Habit</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      saveEdit(habit.id);
                    }}>
                      <div className="form-group">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Habit name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description"
                          rows={3}
                        />
                      </div>
                      <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={cancelEditing}>
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="habit-content">
                      <div 
                        className={`habit-checkbox ${completions[habit.id] ? 'checked' : ''} ${completionLoading[habit.id] ? 'loading' : ''}`}
                        onClick={() => !completionLoading[habit.id] && toggleCompletion(habit.id)}
                      />
                      <div className="habit-info">
                        <h3 className={`habit-name ${completions[habit.id] ? 'completed' : ''}`}>
                          {habit.name}
                        </h3>
                        <p className={`habit-description ${completions[habit.id] ? 'completed' : ''}`}>
                          {habit.description}
                        </p>
                      </div>
                      <div className="habit-actions">
                        <div className={`habit-status ${completions[habit.id] ? 'completed' : ''}`}>
                          {completionLoading[habit.id] ? 'Updating...' : 
                           completions[habit.id] ? '✅ Done today!' : 'Not completed'}
                        </div>
                        <div className="habit-buttons">
                          <button 
                            className="btn-small btn-edit"
                            onClick={() => startEditing(habit)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-small btn-delete"
                            onClick={() => deleteHabit(habit.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="habit-components">
                      <StreakCounter habitId={habit.id} habitName={habit.name} refreshTrigger={refreshTrigger} />
                      <HabitCalendar habitId={habit.id} habitName={habit.name} refreshTrigger={refreshTrigger} />
                      <ProgressStats habitId={habit.id} habitName={habit.name} refreshTrigger={refreshTrigger} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h2>Start Your Habit Journey!</h2>
          <p>Create your first habit to get started</p>
          <form onSubmit={handleAddHabit} className="add-habit-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter habit name..."
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Add a description (optional)..."
                value={habitDescription}
                onChange={(e) => setHabitDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Your First Habit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    <Footer showAccountSection={false} />
    </>

  );
}

export default Dashboard