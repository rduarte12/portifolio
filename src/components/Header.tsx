import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="container">
      <nav className="navbar">
        
        <div className="navbar-brand">
          <img src="/statistic-graph.svg" alt="Rafael Duarte Logo" className="navbar-logo-image" />
          <span className="navbar-name">Rafael Duarte</span>
        </div>

        <div className="navbar-links">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/research" className="nav-item">Research</Link>
          <Link to="/projects" className="nav-item">Projects</Link>
          <Link to="/blog" className="nav-item">Blog</Link>
        </div>
        
      </nav>
    </header>
  );
}