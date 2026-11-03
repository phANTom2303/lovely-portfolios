import "./Header.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

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

  function toggleUserMenu() {
    setIsUserMenuOpen((prev) => !prev);
  }

  function closeUserMenu() {
    setIsUserMenuOpen(false);
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      closeMenu();
      closeUserMenu();
    }
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="site-logo" onClick={closeMenu}>
          Lovely Portfolio
        </Link>

        <nav
          className={`header-actions ${isAuthenticated ? "authenticated-actions" : ""}`}
        >
          {isAuthenticated ? (
            <div className="user-menu">
              <button
                type="button"
                className="user-menu-button"
                onClick={toggleUserMenu}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                {user?.name || "Account"}
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={closeUserMenu}>
                    My profile
                  </Link>
                  <Link to="/home" onClick={closeUserMenu}>
                    Home
                  </Link>
                  <button
                    type="button"
                    className="user-dropdown-link logout-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin">Sign In</Link>
              <Link to="/signup" className="header-create">
                Create Profile
              </Link>
            </>
          )}
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
            {isAuthenticated ? (
              <>
                <div className="mobile-link mobile-user-name">
                  {user?.name || "Account"}
                </div>
                <Link
                  to="/profile"
                  className="mobile-link"
                  onClick={closeMenu}
                >
                  My profile
                </Link>
                <Link to="/home" className="mobile-link" onClick={closeMenu}>
                  Home
                </Link>
                <button
                  type="button"
                  className="mobile-link logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="mobile-link" onClick={closeMenu}>
                  Home
                </Link>
                <Link
                  to="/profile"
                  className="mobile-link"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/signin"
                  className="mobile-link"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="mobile-link mobile-create"
                  onClick={closeMenu}
                >
                  Create Profile
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
