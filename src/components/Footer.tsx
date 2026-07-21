export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer container">
      <div className="footer-content">
        
        <p className="copyright">
          © {currentYear} Rafael Duarte. All rights reserved.
        </p>
        
        <div className="social-links">
          {/* Lembre-se de colocar os seus links reais aqui */}
          <a href="https://github.com/rduarte12" target="_blank" rel="noopener noreferrer">
            <img src="/github-icon.svg" alt="GitHub" className="social-icon" style={{ width: '24px', height: '24px' }} /> GitHub
          </a>
          <a href="https://linkedin.com/in/rafael-mendonca-duarte" target="_blank" rel="noopener noreferrer">
            <img src="/linkedin-icon.svg" alt="LinkedIn" className="social-icon" style={{ width: '24px', height: '24px' }} /> LinkedIn
          </a>
        </div>

      </div>
    </footer>
  );
}