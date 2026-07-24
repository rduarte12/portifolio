export default function ShareButton({ title, url }: { title: string; url: string }) {
  
  const handleShare = async (e: React.MouseEvent) => {
    // Evita que o clique no botão dispare o link do card (se o botão estiver dentro de um Link)
    e.preventDefault(); 
    e.stopPropagation();

    // 1. Tenta usar a Web Share API nativa (Celulares e navegadores modernos)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Read more: ${title}`,
          url: url,
        });
        return;
      } catch (error) {
        // Se o usuário cancelar a janela de compartilhamento, não faz nada
        if ((error as Error).name === 'AbortError') return;
      }
    }

    // 2. Fallback: Se a API não estiver disponível (ex: navegadores desktop antigos), copia o link
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard! You can now share it anywhere.');
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex-row gap-sm text-muted"
      style={{ 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'opacity 0.2s'
      }}
      title="Share"
    >
      {/* SVG Inline do ícone de Compartilhar (Rede) */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
      <span style={{ fontSize: '0.85rem' }}>Share</span>
    </button>
  );
}