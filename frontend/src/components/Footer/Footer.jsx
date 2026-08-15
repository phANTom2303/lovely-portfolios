import "./Footer.css";
import { Link } from "react-router-dom";
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <div className="footer-logo">Lovely Portfolio</div>

          <p>Your work deserves a better introduction.</p>
        </div>

        <div className="footer-links">
          <a href="/about">About Us</a>
          <Link className="footer-create" to="/signup">
            Create Portfolio
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Lovely Portfolio</span>
      </div>
    </footer>
  );
}

export default Footer;
