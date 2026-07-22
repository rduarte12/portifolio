export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="container" style={{ marginTop: '80px', paddingBottom: '40px' }}>
      
      {/* Usamos flex-between para o PC e mobile-col para empilhar no celular */}
      <div 
        className="flex-between mobile-col gap-md" 
        style={{ paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}
      >
        
        <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
          © {currentYear} Rafael Duarte. All rights reserved.
        </p>
        
        {/* Container dos links usando flex-row e gap-md (16px) */}
        <div className="flex-row gap-md">
          
          <a 
            href="https://github.com/rduarte12" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-row gap-sm text-muted"
            style={{ textDecoration: 'none', fontWeight: 500 }}
          >
            <img 
              src="/github-icon.svg" 
              alt="GitHub" 
              style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
            /> 
            GitHub
          </a>

          <a 
            href="https://linkedin.com/in/rafael-mendonca-duarte" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-row gap-sm text-muted"
            style={{ textDecoration: 'none', fontWeight: 500 }}
          >
            <img 
              src="/linkedin-icon.svg" 
              alt="LinkedIn" 
              style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
            /> 
            LinkedIn
          </a>

        </div>

      </div>
    </footer>
  );
}