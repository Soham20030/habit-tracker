import { Link } from "react-router-dom";
import "../styles/footer.css";

function Footer({ showAccountSection = true }) {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section brand-section">
            <div className="footer-brand">
              <div className="brand-icon">🌿</div>
              <span className="brand-text">HabitGrow</span>
            </div>
            <p className="brand-description">
              Nurture your habits, grow your potential
            </p>
          </div>

          {/* Account - Only show if showAccountSection is true */}
          {showAccountSection && (
            <div className="footer-section">
              <h4 className="footer-title">Account</h4>
              <ul className="footer-links">
                <li><Link to="/login" className="footer-link">Login</Link></li>
                <li><Link to="/register" className="footer-link">Sign Up</Link></li>
                <li><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; 2025 HabitGrow. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacy" className="footer-bottom-link">Privacy Policy</Link>
              <Link to="/terms" className="footer-bottom-link">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;