import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StarRating from "@/components/movies/StarRating";
import TVCard from "@/components/tv/TVCard";
import TrailerModal from "@/components/movies/TrailerModal";
import LogMovieDialog from "@/components/movies/LogMovieDialog";
import ReviewSection from "@/components/reviews/ReviewSection";
import SeasonList from "@/components/tv/SeasonList";
import TMDBAttribution from "@/components/common/TMDBAttribution";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Heart, Plus, Share2, Calendar, Play, Check, Tv } from "lucide-react";
import { useTVDetails, TMDBVideo, TMDBTVShow } from "@/hooks/useTMDBTV";
import { getImageUrl, getBackdropUrl } from "@/hooks/useTMDB";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useDiary } from "@/hooks/useDiary";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TVDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { getEntryForMovie, addToDiary } = useDiary();
  
  const { data: show, isLoading, error } = useTVDetails(id);

  const tvId = parseInt(id || "0");
  const inWatchlist = isInWatchlist(tvId);
  const diaryEntry = getEntryForMovie(tvId);

  const handleWatchlistToggle = () => {
    if (!user) {
      toast.error("Sign in to add to watchlist");
      navigate("/auth");
      return;
    }
    
    if (inWatchlist) {
      removeFromWatchlist.mutate(tvId);
    } else {
      addToWatchlist.mutate({
        tmdb_id: tvId,
        title: show?.name || "",
        poster_path: show?.poster_path,
        release_date: show?.first_air_date,
        media_type: 'tv',
      });
    }
  };

  const handleLogShow = () => {
    if (!user) {
      toast.error("Sign in to log shows");
      navigate("/auth");
      return;
    }
    setLogDialogOpen(true);
  };

  const handleLogSubmit = (data: { watched_at: string; rating?: number; review?: string; liked: boolean }) => {
    addToDiary.mutate({
      tmdb_id: tvId,
      title: show?.name || "",
      poster_path: show?.poster_path,
      release_date: show?.first_air_date,
      media_type: 'tv',
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

  if (error || !show) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Show not found</h1>
          <p className="text-muted-foreground mb-8">The TV show you're looking for doesn't exist or couldn't be loaded.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(show.backdrop_path);
  const posterUrl = getImageUrl(show.poster_path, 'w500');
  const firstAirDate = show.first_air_date ? new Date(show.first_air_date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }) : '';
  const creator = show.created_by?.[0];
  const cast = show.credits?.cast?.slice(0, 6) || [];
  const trailer = show.videos?.results?.find(
    (v: TMDBVideo) => v.type === 'Trailer' && v.site === 'YouTube'
  );
  const similarShows = show.similar?.results?.slice(0, 6) || [];

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
              alt={show.name}
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
              <div className="w-48 md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl cinema-glow mx-auto md:mx-0 relative">
                <img
                  src={posterUrl}
                  alt={show.name}
                  className="w-full h-full object-cover"
                />
                {/* TV badge */}
                <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <Tv className="w-3 h-3" />
                  TV Series
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
                {show.name}
              </h1>
              
              {show.tagline && (
                <p className="text-primary text-lg mb-4">{show.tagline}</p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                {firstAirDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {firstAirDate}
                  </span>
                )}
                <span>
                  {show.number_of_seasons} {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                </span>
                <span>
                  {show.number_of_episodes} Episodes
                </span>
                {creator && (
                  <span>Created by <span className="text-foreground">{creator.name}</span></span>
                )}
              </div>

              {/* Status badge */}
              <div className="mb-4">
                <span className={cn(
                  "px-3 py-1 text-sm rounded-full font-medium",
                  show.status === "Returning Series" ? "bg-green-500/20 text-green-500" :
                  show.status === "Ended" ? "bg-muted text-muted-foreground" :
                  "bg-primary/20 text-primary"
                )}>
                  {show.status}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres?.map((genre) => (
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
                  onClick={handleLogShow}
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
            {/* Tabs for Overview, Seasons, Reviews */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="seasons">Seasons & Episodes</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                {/* Synopsis */}
                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Synopsis
                  </h2>
                  <p className="text-foreground/80 leading-relaxed">
                    {show.overview || 'No synopsis available.'}
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
                        <div key={person.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={getImageUrl(person.profile_path, 'w200')}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="seasons">
                {show.seasons && show.seasons.length > 0 ? (
                  <SeasonList tvId={tvId} seasons={show.seasons} />
                ) : (
                  <p className="text-muted-foreground">No season information available.</p>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewSection 
                  movie={{
                    id: tvId,
                    title: show.name,
                    poster_path: show.poster_path,
                  }}
                  mediaType="tv"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Stats & Similar */}
          <div className="space-y-8">
            {/* Rating Stats */}
            <div className="glass-card rounded-xl p-6">
              <div className="text-center mb-4">
                <p className="font-display text-5xl font-bold text-primary mb-1">
                  {show.vote_average.toFixed(1)}
                </p>
                <StarRating rating={show.vote_average / 2} readonly size="lg" />
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {show.vote_count.toLocaleString()} ratings
                </p>
              </div>
            </div>

            {/* Show Info */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Show Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-foreground">{show.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seasons</span>
                  <span className="text-foreground">{show.number_of_seasons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Episodes</span>
                  <span className="text-foreground">{show.number_of_episodes}</span>
                </div>
                {show.episode_run_time?.[0] && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Episode Runtime</span>
                    <span className="text-foreground">{show.episode_run_time[0]}m</span>
                  </div>
                )}
                {show.networks?.[0] && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span className="text-foreground">{show.networks[0].name}</span>
                  </div>
                )}
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

            {/* Similar Shows */}
            {similarShows.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Similar Shows
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {similarShows.map((tvShow: TMDBTVShow) => (
                    <TVCard 
                      key={tvShow.id} 
                      id={tvShow.id}
                      name={tvShow.name}
                      posterPath={tvShow.poster_path}
                      year={tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear().toString() : ''}
                      rating={tvShow.vote_average}
                      onClick={() => navigate(`/tv/${tvShow.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TMDB Attribution */}
        <TMDBAttribution />
      </div>

      <Footer />
      
      {/* Trailer Modal */}
      <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />
      
      {/* Log Show Dialog */}
      {show && (
        <LogMovieDialog
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          movie={{
            id: tvId,
            title: show.name,
            poster_path: show.poster_path,
            release_date: show.first_air_date,
          }}
          onSubmit={handleLogSubmit}
          mediaType="tv"
        />
      )}
    </div>
  );
};

export default TVDetail;
