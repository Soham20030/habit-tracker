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

  useEffect(() => {
    fetchUserProfile();
    fetchHabits();
  }, []);

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
        <div key={habit.id} style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0'}}>
          <h3>{habit.name}</h3>
          <p>{habit.description}</p>
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