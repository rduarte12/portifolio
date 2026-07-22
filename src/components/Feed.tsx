interface FeedCardProps {
    title: string;
    description: string;
    tags: string[];
    link?: string;
    imgUrl?: string;
    likes?: number;
    comments?: number;
}

export default function FeedCard({ title, description, imgUrl, tags, link = "#", likes = 0, comments = 0 }: FeedCardProps) {
    const isExternal = link.startsWith('http://');
}