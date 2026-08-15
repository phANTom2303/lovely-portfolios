import "./Header.css";
function Header() {
  return (
    <header className="site-header">
      <a href="/" className="site-logo">
        Lovely Portfolio
      </a>
      <nav className="header-actions">
        <a href="/signin">Sign In</a>
        <a className="header-create" href="/signup">
          Create Profile
        </a>
      </nav>
    </header>
  );
}
export default Header;
