import {useState, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../AuthContext";
import Navbar from "../components/Navbar"
import Footer from "../components/Footer";
import "../styles/login.css";

function Login() {
  const {login} = useContext(AuthContext);
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      if(response.ok) {
        const data = await response.json();
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        login(data.token);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Login failed. Please try again.');
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
        <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Continue your growth journey</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
     <Footer/>
    </>
  );
}

export default Login;