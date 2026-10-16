import "./Header.css";
import { Link } from "react-router-dom";
function Header() {
  return (
    <header className="site-header">
      <a href="/" className="site-logo">
        Lovely Portfolio
      </a>
      <nav className="header-actions">
        <Link to="/signin">Sign In</Link>
        <Link to="/signup" className="header-create">
          Create Profile
        </Link>
      </nav>
    </header>
  );
}
export default Header;
