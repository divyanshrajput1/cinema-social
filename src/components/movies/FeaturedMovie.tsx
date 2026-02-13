import { Button } from "@/components/ui/button";
import { Play, Plus, Star } from "lucide-react";
import { getImageUrl, getBackdropUrl, TMDBMovieDetails, TMDBVideo } from "@/hooks/useTMDB";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FeaturedMovieProps {
  movie: TMDBMovieDetails;
  onWatchTrailer?: (videoKey: string) => void;
}

const FeaturedMovie = ({ movie, onWatchTrailer }: FeaturedMovieProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const year = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';
  const genres = movie.genres?.map(g => g.name) || [];
  
  // Find trailer
  const trailer = movie.videos?.results?.find(
    (v: TMDBVideo) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1] as const,
      },
    },
  };

  return (
    <section ref={ref} className="relative min-h-[80vh] flex items-end overflow-hidden">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0">
        {prefersReducedMotion ? (
          <>
            {backdropUrl ? (
              <img
                src={backdropUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </>
        ) : (
          <motion.div
            className="absolute inset-0"
            style={{ y: backgroundY }}
          >
            {backdropUrl ? (
              <motion.img
                src={backdropUrl}
                alt={movie.title}
                className="w-full h-[120%] object-cover will-change-transform"
                style={{ scale: backgroundScale }}
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </motion.div>
        )}
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        
        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.4)_70%)]" />
        
        {/* Ambient glow edges */}
        <div className="ambient-glow-left" />
        <div className="ambient-glow-right" />
      </div>

      {/* Content */}
      <motion.div 
        className="relative container mx-auto px-4 pb-16 pt-32"
        style={prefersReducedMotion ? {} : { opacity: contentOpacity }}
      >
        <motion.div 
          className="flex flex-col md:flex-row gap-8 items-end"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Poster with 3D effect */}
          <motion.div 
            className="hidden md:block flex-shrink-0"
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotateY: 5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl cinema-glow relative group">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Poster shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-1 max-w-2xl">
            {movie.tagline && (
              <motion.p 
                className="text-primary font-medium mb-2"
                variants={itemVariants}
              >
                {movie.tagline}
              </motion.p>
            )}
            
            <motion.h1 
              className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4"
              variants={itemVariants}
            >
              {movie.title}
            </motion.h1>

            {/* Meta */}
            <motion.div 
              className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground"
              variants={itemVariants}
            >
              {year && <span>{year}</span>}
              {runtime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <span>{runtime}</span>
                </>
              )}
              {movie.vote_average > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary fill-primary star-glow" />
                    <span className="text-foreground font-medium">{movie.vote_average.toFixed(1)}</span>
                  </div>
                </>
              )}
            </motion.div>

            {/* Genres */}
            <motion.div 
              className="flex flex-wrap gap-2 mb-4"
              variants={itemVariants}
            >
              {genres.slice(0, 4).map((genre, index) => (
                <motion.span
                  key={genre}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  {genre}
                </motion.span>
              ))}
            </motion.div>

            {/* Overview */}
            <motion.p 
              className="text-muted-foreground mb-6 line-clamp-3"
              variants={itemVariants}
            >
              {movie.overview}
            </motion.p>

            {/* Actions */}
            <motion.div 
              className="flex flex-wrap gap-3"
              variants={itemVariants}
            >
              {trailer && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="cinema" 
                    size="lg" 
                    className="gap-2 relative overflow-hidden group"
                    onClick={() => onWatchTrailer?.(trailer.key)}
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                    <Play className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Watch Trailer</span>
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="letterboxd" size="lg" className="gap-2 relative overflow-hidden group">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                  <Plus className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Add to Watchlist</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FeaturedMovie;
