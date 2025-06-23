import { Link } from "react-router-dom";
import '../styles/home.css'
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
    <Navbar/>
     <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <h1>Welcome to HabitGrow</h1>
          <p>Track your daily habits and build consistency for a better you</p>
        </div>

        <div className="home-buttons">
          <Link to="/login" className="home-button login">
            Login
          </Link>
          <Link to="/register" className="home-button signup">
            Sign Up
          </Link>
        </div>

        <div className="home-features">
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <p className="feature-text">Track Daily</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <p className="feature-text">See Progress</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <p className="feature-text">Build Consistency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
    
  );
}

export default Home;