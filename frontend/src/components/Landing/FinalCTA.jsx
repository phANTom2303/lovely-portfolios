import "./FinalCTA.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";

function FinalCTA() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="landing-final-cta" id="cta">
      <div className="landing-container">
        <div className="final-cta-card">
          <div className="cta-glow-circle" aria-hidden="true"></div>

          <div className="final-cta-content">
            <span className="cta-eyebrow">Get Started</span>
            <h2>Ready to present your work with clarity?</h2>
            <p className="final-cta-subtitle">
              Add your details once. Generate clean, role-focused portfolios
              aligned with your target job descriptions in seconds.
            </p>

            <div className="final-cta-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/home" className="cta-primary-btn">
                    Go to Home
                  </Link>
                  <Link to="/profile" className="cta-secondary-btn">
                    My Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="cta-primary-btn">
                    Create Your Profile
                  </Link>
                  <Link to="/signin" className="cta-secondary-btn">
                    Sign In to Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
