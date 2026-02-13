import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedMovie from "@/components/movies/FeaturedMovie";
import MovieGrid from "@/components/movies/MovieGrid";
import TVGrid from "@/components/tv/TVGrid";
import TrailerModal from "@/components/movies/TrailerModal";
import HorizontalShowcase from "@/components/movies/HorizontalShowcase";
import CinematicIntro from "@/components/common/CinematicIntro";
import FilmGrainOverlay from "@/components/common/FilmGrainOverlay";
import { useTrending, usePopular, useTopRated, useNowPlaying, TMDBMovie, useMovieDetails } from "@/hooks/useTMDB";
import { useTVTrending, useTVPopular, TMDBTVShow } from "@/hooks/useTMDBTV";
import { Button } from "@/components/ui/button";
import { Users, Film, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntroShown } from "@/hooks/useIntroShown";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useGSAPSmoothScroll } from "@/hooks/useGSAPSmoothScroll";

const transformMovies = (movies: TMDBMovie[] = []) => {
  return movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '',
    rating: movie.vote_average,
  }));
};

const transformTVShows = (shows: TMDBTVShow[] = []) => {
  return shows.map((show) => ({
    id: show.id,
    name: show.name,
    posterPath: show.poster_path,
    year: show.first_air_date ? new Date(show.first_air_date).getFullYear().toString() : '',
    rating: show.vote_average,
  }));
};

const Index = () => {
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const { hasShownIntro, markIntroShown } = useIntroShown();
  const [introComplete, setIntroComplete] = useState(hasShownIntro);
  const prefersReducedMotion = useReducedMotion();

  // Enable GSAP smooth scroll on homepage
  useGSAPSmoothScroll();

  const { data: trending, isLoading: trendingLoading } = useTrending();
  const { data: popular, isLoading: popularLoading } = usePopular();
  const { data: topRated, isLoading: topRatedLoading } = useTopRated();
  const { data: nowPlaying, isLoading: nowPlayingLoading } = useNowPlaying();
  
  const { data: tvTrending, isLoading: tvTrendingLoading } = useTVTrending();
  const { data: tvPopular, isLoading: tvPopularLoading } = useTVPopular();
  
  const featuredMovieId = trending?.results?.[0]?.id;
  const { data: featuredMovie, isLoading: featuredLoading } = useMovieDetails(featuredMovieId);

  const handleMovieClick = (id: number) => navigate(`/film/${id}`);
  const handleTVClick = (id: number) => navigate(`/tv/${id}`);

  const handleIntroComplete = () => {
    markIntroShown();
    setIntroComplete(true);
  };

  const statsContainerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const statItemVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -15 },
    visible: { 
      opacity: 1, y: 0, rotateX: 0,
      transition: { duration: 0.6 },
    },
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.8 },
    },
  };

  return (
    <>
      {!introComplete && (
        <CinematicIntro onComplete={handleIntroComplete} />
      )}

      <motion.div 
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Homepage-only film grain overlay */}
        <FilmGrainOverlay opacity={0.025} />
        
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

        {/* Now Playing - Horizontal Showcase */}
        <HorizontalShowcase
          title="Now in Theaters"
          subtitle="Currently showing in cinemas — scroll to explore"
          movies={transformMovies(nowPlaying?.results?.slice(0, 14))}
          onMovieClick={handleMovieClick}
          isLoading={nowPlayingLoading}
        />

        {/* Stats Section with 3D entrance */}
        <section className="py-16 bg-gradient-to-b from-transparent via-card/50 to-transparent overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={statsContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              style={{ perspective: "1000px" }}
            >
              {[
                { icon: Film, value: "750K+", label: "Films in database" },
                { icon: Star, value: "12M+", label: "Ratings logged" },
                { icon: Users, value: "2.5M+", label: "Active members" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  variants={prefersReducedMotion ? {} : statItemVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                    whileHover={{ 
                      boxShadow: "0 0 30px hsl(var(--primary) / 0.4)",
                    }}
                  >
                    <stat.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <p className="font-display text-4xl font-bold text-foreground mb-2">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
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

        {/* Trending TV Shows */}
        <TVGrid
          title="Trending TV Shows"
          subtitle="The most-watched series this week"
          shows={transformTVShows(tvTrending?.results?.slice(0, 14))}
          onShowClick={handleTVClick}
          isLoading={tvTrendingLoading}
        />

        {/* Popular TV Shows */}
        <TVGrid
          title="Popular TV Shows"
          subtitle="Binge-worthy series everyone's talking about"
          shows={transformTVShows(tvPopular?.results?.slice(0, 14))}
          onShowClick={handleTVClick}
          isLoading={tvPopularLoading}
        />

        {/* CTA Section */}
        <section className="py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              variants={ctaVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.h2 
                className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Track films you've watched.
                <br />
                <span className="text-gradient">Save those you want to see.</span>
              </motion.h2>
              <motion.p 
                className="text-lg text-muted-foreground mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Tell your friends what's good. Join a community of film lovers today.
              </motion.p>
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="cinema" size="xl" className="relative overflow-hidden group shimmer-btn">
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10">Get Started — It's Free</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="xl">
                    Learn More
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
        
        <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />
      </motion.div>
    </>
  );
};

export default Index;
