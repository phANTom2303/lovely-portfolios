import "./Header.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="site-logo" onClick={closeMenu}>
          Lovely Portfolio
        </Link>

        <nav className="header-actions">
          <Link to="/signin">Sign In</Link>
          <Link to="/signup" className="header-create">
            Create Profile
          </Link>
        </nav>

        <button
          type="button"
          className={`hamburger-button ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="mobile-overlay" onClick={closeMenu}>
          <nav
            className="mobile-menu"
            onClick={(event) => event.stopPropagation()}
          >
            <Link to="/" className="mobile-link" onClick={closeMenu}>
              Home
            </Link>
            <Link to="/profile" className="mobile-link" onClick={closeMenu}>
              Profile
            </Link>
            <Link to="/signin" className="mobile-link" onClick={closeMenu}>
              Sign In
            </Link>
            <Link
              to="/signup"
              className="mobile-link mobile-create"
              onClick={closeMenu}
            >
              Create Profile
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
