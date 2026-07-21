export default function Header() {
  return (
    <header className="container">
      <nav className="navbar">
        
        {/* Lado Esquerdo */}
        <div className="navbar-brand">
          <span className="navbar-logo-circle">RD</span>
          <span className="navbar-name">Rafael Duarte</span>
        </div>

        {/* Lado Direito */}
        <div className="navbar-links">
          <a href="/" className="nav-item">Home</a>
          <a href="/research" className="nav-item">Research</a>
          <a href="/projects" className="nav-item">Projects</a>
          <a href="/blog" className="nav-item">Blog</a>
        </div>
        
      </nav>
    </header>
  );
}