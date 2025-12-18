import { Star, Eye, Heart, Plus } from "lucide-react";
import { getImageUrl } from "@/hooks/useTMDB";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  year: string;
  rating?: number;
  onClick?: () => void;
}

const MovieCard = ({ id, title, posterPath, year, rating, onClick }: MovieCardProps) => {
  return (
    <div 
      className="group relative cursor-pointer poster-hover"
      onClick={onClick}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
        <img
          src={getImageUrl(posterPath, 'w500')}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <button className="w-9 h-9 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-letterboxd-green hover:bg-muted transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                <Heart className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-secondary hover:bg-muted transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Title */}
            <h3 className="text-sm font-medium text-foreground line-clamp-2 text-center">
              {title}
            </h3>
          </div>
        </div>

        {/* Rating Badge */}
        {rating && rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-3 h-3 text-primary fill-primary star-glow" />
            <span className="text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
