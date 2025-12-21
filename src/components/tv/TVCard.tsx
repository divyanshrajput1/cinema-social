import { getImageUrl } from "@/hooks/useTMDB";
import { cn } from "@/lib/utils";
import { Tv } from "lucide-react";

interface TVCardProps {
  id: number;
  name: string;
  posterPath: string | null;
  year: string;
  rating: number;
  onClick?: () => void;
  className?: string;
}

const TVCard = ({ id, name, posterPath, year, rating, onClick, className }: TVCardProps) => {
  return (
    <div
      className={cn(
        "group cursor-pointer transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
        <img
          src={getImageUrl(posterPath)}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* TV badge */}
        <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
          <Tv className="w-3 h-3" />
          TV
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating badge */}
        {rating > 0 && (
          <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-primary">
            ★ {rating.toFixed(1)}
          </div>
        )}
      </div>
      
      <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
        {name}
      </h3>
      {year && (
        <p className="text-xs text-muted-foreground">{year}</p>
      )}
    </div>
  );
};

export default TVCard;
