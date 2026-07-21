import { Link } from 'react-router-dom';

interface CardProps {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  imgUrl?: string;
}


export default function Card({ title, description, imgUrl, tags, link = "#" }: CardProps) {
    const isExternal = link.startsWith('http://');

    const CardContent = (
        <div className="card">
            {imgUrl && imgUrl !== "#" && (
                <img src={imgUrl} alt={title} className="card-image" />
            )}

            <h4 className="card-title">{title}</h4>
            <p className="card-description">{description}</p>

            <div className="card-tags">
                {tags.map((tag, index) => (
                    <span key={index} className="card-tag">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
    // Se for externo, abre em nova aba
    if (isExternal) {
        return (
            <a href={link} className="card-link" target="_blank" rel="noopener noreferrer">
            {CardContent}
            </a>
        );
    } else {
        return (
            <Link to={link} className="card-link">
                {CardContent}
            </Link>
        );
    }

}
