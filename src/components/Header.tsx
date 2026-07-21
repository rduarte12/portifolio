import { NavLink } from 'react-router-dom';

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
          
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Home
          </NavLink>
          
          <NavLink 
            to="/research" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Research
          </NavLink>
          
          <NavLink 
            to="/projects" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Projects
          </NavLink>
          
          <NavLink 
            to="/blog" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Blog
          </NavLink>

        </div>
      </nav>
    </header>
  );
}