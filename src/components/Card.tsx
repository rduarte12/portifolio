import { Link } from 'react-router-dom';

interface CardProps {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  imgUrl?: string;
}

export default function Card({ title, description, imgUrl, tags, link = "#" }: CardProps) {
    // Verifica se é um link externo (incluindo https)
    const isExternal = link.startsWith('http://') || link.startsWith('https://');

    const CardContent = (
        <div className="card">
            {imgUrl && imgUrl !== "#" && (
                <img src={imgUrl} alt={title} className="card-image" />
            )}

            {/* Usando as classes utilitárias de tipografia e espaçamento */}
            <h4 className="text-main font-bold text-justify text-serif" style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
                {title}
            </h4>
            
            <p className="text-muted text-justify" style={{ flexGrow: 1, marginBottom: '24px' }}>
                {description}
            </p>

            {/* Substituímos o card-tags pelo Flexbox genérico */}
            <div className="flex-row flex-wrap gap-sm">
                {tags.map((tag, index) => (
                    <span key={index} className="tag text-main font-bold">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );

    // O estilo inline no Link/<a> garante que o navegador não deixe o texto azul/sublinhado
    const linkStyle = { textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' };

    // Se for externo, abre em nova aba
    if (isExternal) {
        return (
            <a href={link} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                {CardContent}
            </a>
        );
    } else {
        return (
            <Link to={link} style={linkStyle}>
                {CardContent}
            </Link>
        );
    }
}