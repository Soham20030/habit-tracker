import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import '../styles/register.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username: username,
          email: email,
          password: password
        })
      });

      if(response.ok) {
        setMessage('Registration successful! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Registration failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
    <Navbar/>
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join us and start your journey</p>
        </div>
        
        <form className="register-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text"
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="login-link">
          <p>Already have an account?</p>
          <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
    <Footer/>
    </>
    
  );
}

export default Register;