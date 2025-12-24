import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StarRating from "@/components/movies/StarRating";
import MovieCard from "@/components/movies/MovieCard";
import TrailerModal from "@/components/movies/TrailerModal";
import LogMovieDialog from "@/components/movies/LogMovieDialog";
import ReviewSection from "@/components/reviews/ReviewSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Heart, Plus, Share2, Clock, Calendar, Play, Check, BookOpen } from "lucide-react";
import { useMovieDetails, getImageUrl, getBackdropUrl, TMDBVideo } from "@/hooks/useTMDB";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useDiary } from "@/hooks/useDiary";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FilmDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { getEntryForMovie, addToDiary } = useDiary();
  
  const { data: movie, isLoading, error } = useMovieDetails(id);

  const movieId = parseInt(id || "0");
  const inWatchlist = isInWatchlist(movieId);
  const diaryEntry = getEntryForMovie(movieId);

  const handleWatchlistToggle = () => {
    if (!user) {
      toast.error("Sign in to add to watchlist");
      navigate("/auth");
      return;
    }
    
    if (inWatchlist) {
      removeFromWatchlist.mutate(movieId);
    } else {
      addToWatchlist.mutate({
        tmdb_id: movieId,
        title: movie?.title || "",
        poster_path: movie?.poster_path,
        release_date: movie?.release_date,
      });
    }
  };

  const handleLogMovie = () => {
    if (!user) {
      toast.error("Sign in to log films");
      navigate("/auth");
      return;
    }
    setLogDialogOpen(true);
  };

  const handleLogSubmit = (data: { watched_at: string; rating?: number; review?: string; liked: boolean }) => {
    addToDiary.mutate({
      tmdb_id: movieId,
      title: movie?.title || "",
      poster_path: movie?.poster_path,
      release_date: movie?.release_date,
      ...data,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="relative min-h-[60vh] flex items-end pt-16">
          <div className="absolute inset-0 bg-muted" />
          <div className="relative container mx-auto px-4 pb-12">
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="w-48 md:w-64 aspect-[2/3] rounded-lg mx-auto md:mx-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-12 w-80" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full" />
                  ))}
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Film not found</h1>
          <p className="text-muted-foreground mb-8">The film you're looking for doesn't exist or couldn't be loaded.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }) : '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';
  const director = movie.credits?.crew?.find(c => c.job === 'Director');
  const cast = movie.credits?.cast?.slice(0, 6) || [];
  const trailer = movie.videos?.results?.find(
    (v: TMDBVideo) => v.type === 'Trailer' && v.site === 'YouTube'
  );
  const similarMovies = movie.similar?.results?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-end pt-16">
        {/* Backdrop */}
        <div className="absolute inset-0">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 pb-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-48 md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl cinema-glow mx-auto md:mx-0">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="text-primary text-lg mb-4">{movie.tagline}</p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                {releaseDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {releaseDate}
                  </span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {runtime}
                  </span>
                )}
                {director && (
                  <span>Directed by <span className="text-foreground">{director.name}</span></span>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {trailer && (
                  <Button 
                    variant="cinema" 
                    className="gap-2"
                    onClick={() => setTrailerKey(trailer.key)}
                  >
                    <Play className="w-4 h-4" />
                    Trailer
                  </Button>
                )}
                <Button 
                  variant="letterboxd" 
                  className="gap-2"
                  onClick={handleLogMovie}
                >
                  <Eye className="w-4 h-4" />
                  {diaryEntry ? "Logged" : "Log"}
                </Button>
                {diaryEntry?.liked && (
                  <Button variant="outline" className="gap-2" disabled>
                    <Heart className="w-4 h-4 fill-destructive text-destructive" />
                    Liked
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className={cn("gap-2", inWatchlist && "border-primary text-primary")}
                  onClick={handleWatchlistToggle}
                >
                  {inWatchlist ? (
                    <>
                      <Check className="w-4 h-4" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Watchlist
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => {
                    const params = new URLSearchParams({
                      title: movie.title,
                      type: 'movie',
                      back: `/film/${id}`,
                    });
                    if (movie.release_date) {
                      params.set('year', new Date(movie.release_date).getFullYear().toString());
                    }
                    if (movie.poster_path) {
                      params.set('poster', getImageUrl(movie.poster_path, 'w300'));
                    }
                    navigate(`/wikipedia?${params.toString()}`);
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                  Read Full Info
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Synopsis */}
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Synopsis
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                {movie.overview || 'No synopsis available.'}
              </p>
            </section>

            {/* Cast */}
            {cast.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Cast
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {cast.map((person) => (
                    <div 
                      key={person.id} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => navigate(`/person/${person.id}`)}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary transition-all">
                        <img
                          src={getImageUrl(person.profile_path, 'w200')}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{person.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <ReviewSection 
              movie={{
                id: movieId,
                title: movie.title,
                poster_path: movie.poster_path,
              }}
            />
          </div>

          {/* Right Column - Stats & Similar */}
          <div className="space-y-8">
            {/* Rating Stats */}
            <div className="glass-card rounded-xl p-6">
              <div className="text-center mb-4">
                <p className="font-display text-5xl font-bold text-primary mb-1">
                  {movie.vote_average.toFixed(1)}
                </p>
                <StarRating rating={movie.vote_average / 2} readonly size="lg" />
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {movie.vote_count.toLocaleString()} ratings
                </p>
              </div>
            </div>

            {/* Your Entry */}
            {diaryEntry && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                  Your Entry
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Watched</span>
                    <span>{new Date(diaryEntry.watched_at).toLocaleDateString()}</span>
                  </div>
                  {diaryEntry.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <StarRating rating={diaryEntry.rating} readonly size="sm" />
                    </div>
                  )}
                  {diaryEntry.review && (
                    <p className="text-sm text-foreground/80 mt-3 italic">
                      "{diaryEntry.review}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Similar Films */}
            {similarMovies.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Similar Films
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {similarMovies.map((film) => (
                    <MovieCard 
                      key={film.id} 
                      id={film.id}
                      title={film.title}
                      posterPath={film.poster_path}
                      year={film.release_date ? new Date(film.release_date).getFullYear().toString() : ''}
                      rating={film.vote_average}
                      onClick={() => navigate(`/film/${film.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Trailer Modal */}
      <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />
      
      {/* Log Movie Dialog */}
      {movie && (
        <LogMovieDialog
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          movie={{
            id: movieId,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
          }}
          onSubmit={handleLogSubmit}
        />
      )}
    </div>
  );
};

export default FilmDetail;
