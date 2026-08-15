import "./Footer.css";
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
          <a className="footer-create" href="/signup">
            Create Portfolio
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Lovely Portfolio</span>
      </div>
    </footer>
  );
}

export default Footer;
