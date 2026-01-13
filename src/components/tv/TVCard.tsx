import { getImageUrl } from "@/hooks/useTMDB";
import { cn } from "@/lib/utils";
import { Tv } from "lucide-react";
import { use3DCard } from "@/hooks/use3DCard";
import { motion } from "framer-motion";

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
  const { cardProps, glowStyle, isHovered } = use3DCard(12);

  return (
    <motion.div
      className={cn(
        "group cursor-pointer will-change-transform",
        className
      )}
      onClick={onClick}
      {...cardProps}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
        <img
          src={getImageUrl(posterPath)}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          loading="lazy"
        />
        
        {/* 3D Glow Effect */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg z-10"
          style={glowStyle}
        />
        
        {/* TV badge */}
        <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
          <Tv className="w-3 h-3" />
          TV
        </div>
        
        {/* Overlay on hover */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        />
        
        {/* Rating badge */}
        {rating > 0 && (
          <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-primary">
            ★ {rating.toFixed(1)}
          </div>
        )}
        
        {/* Bottom shadow for depth */}
        <div 
          className="absolute -bottom-2 left-2 right-2 h-4 bg-black/30 blur-md rounded-full transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.6 : 0 }}
        />
      </div>
      
      <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
        {name}
      </h3>
      {year && (
        <p className="text-xs text-muted-foreground">{year}</p>
      )}
    </motion.div>
  );
};

export default TVCard;
