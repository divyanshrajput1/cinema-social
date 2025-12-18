import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedMovie from "@/components/movies/FeaturedMovie";
import MovieGrid from "@/components/movies/MovieGrid";
import TrailerModal from "@/components/movies/TrailerModal";
import { useTrending, usePopular, useTopRated, useNowPlaying, TMDBMovie, useMovieDetails } from "@/hooks/useTMDB";
import { Button } from "@/components/ui/button";
import { Users, Film, Star, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const transformMovies = (movies: TMDBMovie[] = []) => {
  return movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '',
    rating: movie.vote_average,
  }));
};

const Index = () => {
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  const { data: trending, isLoading: trendingLoading } = useTrending();
  const { data: popular, isLoading: popularLoading } = usePopular();
  const { data: topRated, isLoading: topRatedLoading } = useTopRated();
  const { data: nowPlaying, isLoading: nowPlayingLoading } = useNowPlaying();
  
  // Get featured movie details (first trending movie)
  const featuredMovieId = trending?.results?.[0]?.id;
  const { data: featuredMovie, isLoading: featuredLoading } = useMovieDetails(featuredMovieId);

  const handleMovieClick = (id: number) => {
    navigate(`/film/${id}`);
  };

  return (
    <div className="min-h-screen bg-background film-grain">
      <Navbar />
      
      {/* Featured Movie Hero */}
      {featuredLoading || !featuredMovie ? (
        <section className="relative min-h-[80vh] flex items-end pt-16">
          <div className="absolute inset-0 bg-muted" />
          <div className="relative container mx-auto px-4 pb-16 pt-32">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <Skeleton className="hidden md:block w-64 aspect-[2/3] rounded-lg" />
              <div className="flex-1 max-w-2xl space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-96" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-40" />
                  <Skeleton className="h-12 w-48" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <FeaturedMovie 
          movie={featuredMovie} 
          onWatchTrailer={setTrailerKey}
        />
      )}

      {/* Trending Films */}
      <MovieGrid
        title="Trending This Week"
        subtitle="The most-watched films in the past seven days"
        movies={transformMovies(trending?.results?.slice(1, 15))}
        onMovieClick={handleMovieClick}
        isLoading={trendingLoading}
      />

      {/* Now Playing */}
      <MovieGrid
        title="Now in Theaters"
        subtitle="Currently showing in cinemas"
        movies={transformMovies(nowPlaying?.results?.slice(0, 14))}
        onMovieClick={handleMovieClick}
        isLoading={nowPlayingLoading}
      />

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-transparent via-card/50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Film, value: "750K+", label: "Films in database" },
              { icon: Star, value: "12M+", label: "Ratings logged" },
              { icon: Users, value: "2.5M+", label: "Active members" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <p className="font-display text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular */}
      <MovieGrid
        title="Popular Films"
        subtitle="Fan favorites and critically acclaimed"
        movies={transformMovies(popular?.results?.slice(0, 14))}
        onMovieClick={handleMovieClick}
        isLoading={popularLoading}
      />

      {/* Top Rated */}
      <MovieGrid
        title="Top Rated"
        subtitle="The highest-rated films of all time"
        movies={transformMovies(topRated?.results?.slice(0, 14))}
        onMovieClick={handleMovieClick}
        isLoading={topRatedLoading}
      />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
              Track films you've watched.
              <br />
              <span className="text-gradient">Save those you want to see.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Tell your friends what's good. Join a community of film lovers today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="cinema" size="xl">
                Get Started — It's Free
              </Button>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Trailer Modal */}
      <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />
    </div>
  );
};

export default Index;
