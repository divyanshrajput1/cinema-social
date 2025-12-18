import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import StarRating from "../movies/StarRating";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  id: string;
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  movie: {
    title: string;
    year: string;
    posterUrl: string;
  };
  rating: number;
  content: string;
  likes: number;
  comments: number;
  createdAt: Date;
  liked?: boolean;
}

const ReviewCard = ({
  user,
  movie,
  rating,
  content,
  likes,
  comments,
  createdAt,
  liked = false,
}: ReviewCardProps) => {
  return (
    <article className="glass-card rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-border">
      <div className="flex gap-4">
        {/* Movie Poster */}
        <div className="flex-shrink-0 hidden sm:block">
          <div className="w-20 aspect-[2/3] rounded-md overflow-hidden bg-muted">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{user.name}</span>
                  <span className="text-muted-foreground text-sm">reviewed</span>
                  <span className="font-medium text-foreground">{movie.title}</span>
                  <span className="text-muted-foreground text-sm">{movie.year}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={rating} readonly size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Review Text */}
          <p className="text-foreground/90 leading-relaxed mb-4 line-clamp-4">
            {content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button className={`flex items-center gap-2 text-sm transition-colors ${liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{comments}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ReviewCard;
