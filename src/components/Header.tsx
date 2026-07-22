import { Link } from 'react-router-dom';

export default function Header() {
  // Estilo padronizado para os links de navegação para mantermos o código limpo
  const navLinkStyle = { textDecoration: 'none', fontWeight: 550 };

  return (
    <header className="container">
      {/* flex-between afasta a logo dos links. mobile-col empilha no celular. */}
      <nav className="flex-between mobile-col gap-md" style={{ paddingTop: '40px', width: '100%' }}>
        
        {/* Container da Brand: Logo + Nome alinhados em linha */}
        <div className="flex-row gap-sm">
          <img 
            src="/statistic-graph.svg" 
            alt="Rafael Mendonça Duarte Logo" 
            style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }} 
          />
          <span className="text-main font-bold" style={{ fontSize: '1.2rem' }}>
            Rafael Mendonça Duarte
          </span>
        </div>

        {/* Container dos Links de Navegação */}
        <div className="flex-row gap-md flex-wrap " >
          <Link to="/" style={navLinkStyle}>Home</Link>
          <Link to="/research"  style={navLinkStyle}>Research</Link>
          <Link to="/projects"  style={navLinkStyle}>Projects</Link>
          <Link to="/blog" style={navLinkStyle}>Blog</Link>
        </div>
        
      </nav>
    </header>
  );
}