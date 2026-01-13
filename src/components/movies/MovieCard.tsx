import { Star, Eye, Heart, Plus } from "lucide-react";
import { getImageUrl } from "@/hooks/useTMDB";
import { use3DCard } from "@/hooks/use3DCard";
import { motion } from "framer-motion";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  year: string;
  rating?: number;
  onClick?: () => void;
}

const MovieCard = ({ id, title, posterPath, year, rating, onClick }: MovieCardProps) => {
  const { cardProps, glowStyle, isHovered } = use3DCard(12);

  return (
    <motion.div 
      className="group relative cursor-pointer will-change-transform"
      onClick={onClick}
      {...cardProps}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
        <img
          src={getImageUrl(posterPath, 'w500')}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          loading="lazy"
        />
        
        {/* 3D Glow Effect */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg z-10"
          style={glowStyle}
        />
        
        {/* Hover Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {/* Quick Actions */}
            <motion.div 
              className="flex items-center justify-center gap-3 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
            >
              <button className="w-9 h-9 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-letterboxd-green hover:bg-muted transition-all duration-200 hover:scale-110">
                <Eye className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200 hover:scale-110">
                <Heart className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-secondary hover:bg-muted transition-all duration-200 hover:scale-110">
                <Plus className="w-4 h-4" />
              </button>
            </motion.div>
            
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
        
        {/* Bottom shadow for depth */}
        <div 
          className="absolute -bottom-2 left-2 right-2 h-4 bg-black/30 blur-md rounded-full transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.6 : 0 }}
        />
      </div>
    </motion.div>
  );
};

export default MovieCard;
