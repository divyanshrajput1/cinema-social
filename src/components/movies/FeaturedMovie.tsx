import { Button } from "@/components/ui/button";
import { Play, Plus, Star } from "lucide-react";
import StarRating from "./StarRating";

interface FeaturedMovieProps {
  title: string;
  tagline: string;
  overview: string;
  backdropUrl: string;
  posterUrl: string;
  rating: number;
  year: string;
  runtime: string;
  genres: string[];
}

const FeaturedMovie = ({
  title,
  tagline,
  overview,
  backdropUrl,
  posterUrl,
  rating,
  year,
  runtime,
  genres,
}: FeaturedMovieProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-end">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pb-16 pt-32">
        <div className="flex flex-col md:flex-row gap-8 items-end">
          {/* Poster */}
          <div className="hidden md:block flex-shrink-0">
            <div className="w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl cinema-glow">
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 max-w-2xl">
            {tagline && (
              <p className="text-primary font-medium mb-2 animate-fade-in">
                {tagline}
              </p>
            )}
            
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              {title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <span>{year}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>{runtime}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-foreground font-medium">{rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="text-muted-foreground mb-6 line-clamp-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {overview}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <Button variant="cinema" size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Watch Trailer
              </Button>
              <Button variant="letterboxd" size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Add to Watchlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMovie;
