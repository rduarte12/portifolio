import { Link } from 'react-router-dom';
import ShareButton from './ShareButton';

interface FeedCardProps {
    id: string;
    title: string;
    summary: string;
    date: string;
    tags: string[];
    link: string;
    owner?: string;
    imgUrl?: string;
    likesCount?: number;
    viewsCount?: number;
    showShareButton?: boolean;
}

export default function Feed({ 
    id, 
    title, 
    summary, 
    date, 
    tags, 
    link, 
    owner, 
    imgUrl = "#", 
    likesCount, 
    viewsCount, 
    showShareButton 
}: FeedCardProps) {
    
    // Verifica se é um link externo (incluindo https)
    const isExternal = link.startsWith('http://') || link.startsWith('https://');

    const CardContent = (
    <div className="card feed-card gap-md">

        <div className="text-feed-card text-justify">
            
            <h4 className="text-main font-bold text-justify text-serif" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
                {title}
            </h4>
            
            <p className="text-muted text-justify" style={{ marginBottom: '16px' }}>
                {summary}
            </p>

            <div className="flex-row flex-wrap gap-sm" style={{ marginBottom: '16px' }}>
                {tags.map((tag, index) => (
                    <span key={index} className="tag text-main font-bold">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="text-muted flex-row flex-wrap gap-sm" style={{ fontSize: '0.85rem', alignItems: 'center' }}>
                <span>Article: {id}</span>
                <span>| Published on {date}</span>
                {owner !== undefined && <span>| by {owner}</span>} 
                {likesCount !== undefined && <span>| Likes {likesCount}</span>} 
                {viewsCount !== undefined && <span>| Views {viewsCount}</span>}
                {showShareButton && (
                    <ShareButton title={title} url={window.location.origin + link} />
                )}
            </div>
        </div>

        {imgUrl && imgUrl !== "#" && (
            <div className="image-feed-card">
                <img 
                    src={imgUrl} 
                    alt={title} 
                    className="feed-image" 
                />
            </div>
        )}

    </div>
    );

    const linkStyle = { textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' };

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