import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { AuthContext } from "../AuthContext";
import {useContext} from "react";


function Navbar() {
  const {logout} = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };
  return (
    <nav className="navbar" style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
      <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <div className="brand-icon">🌿</div>
            <span className="brand-text">HabitGrow</span>
          </Link>
        </div>
        
        {location.pathname !== '/' && (
          <div className="navbar-links">
            {location.pathname === '/register' ? (
              <Link to="/login" className="nav-link signup-link">Login</Link>
            ) : location.pathname === '/dashboard' ? (
              <button onClick={handleLogout} className="nav-link signup-link">Logout</button>
            ) : (
              <Link to="/register" className="nav-link signup-link">Sign Up</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;