import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StarRating from "@/components/movies/StarRating";
import MovieCard from "@/components/movies/MovieCard";
import ReviewCard from "@/components/reviews/ReviewCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Heart, Plus, Share2, Clock, Calendar } from "lucide-react";
import { popularMovies, mockReviews } from "@/data/mockMovies";
import { useState } from "react";

const FilmDetail = () => {
  const { id } = useParams();
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Mock data for now
  const movie = {
    id: 1,
    title: "Dune: Part Two",
    tagline: "Long live the fighters.",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.",
    backdropUrl: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    rating: 8.4,
    year: "2024",
    releaseDate: "March 1, 2024",
    runtime: "2h 46m",
    genres: ["Science Fiction", "Adventure", "Drama"],
    director: "Denis Villeneuve",
    cast: [
      { name: "Timothée Chalamet", character: "Paul Atreides", image: "https://i.pravatar.cc/150?img=11" },
      { name: "Zendaya", character: "Chani", image: "https://i.pravatar.cc/150?img=12" },
      { name: "Rebecca Ferguson", character: "Lady Jessica", image: "https://i.pravatar.cc/150?img=13" },
      { name: "Josh Brolin", character: "Gurney Halleck", image: "https://i.pravatar.cc/150?img=14" },
      { name: "Austin Butler", character: "Feyd-Rautha", image: "https://i.pravatar.cc/150?img=15" },
      { name: "Florence Pugh", character: "Princess Irulan", image: "https://i.pravatar.cc/150?img=16" },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-end pt-16">
        {/* Backdrop */}
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 pb-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-48 md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl cinema-glow mx-auto md:mx-0">
                <img
                  src={movie.posterUrl}
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
              
              <p className="text-primary text-lg mb-4">{movie.tagline}</p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {movie.releaseDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {movie.runtime}
                </span>
                <span>Directed by <span className="text-foreground">{movie.director}</span></span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="letterboxd" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Watched
                </Button>
                <Button variant="outline" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Like
                </Button>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Watchlist
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
                {movie.overview}
              </p>
            </section>

            {/* Cast */}
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Cast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {movie.cast.map((person) => (
                  <div key={person.name} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                      <img
                        src={person.image}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Write Review */}
            <section className="glass-card rounded-xl p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Write a Review
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your Rating</label>
                  <StarRating
                    rating={userRating}
                    onRatingChange={setUserRating}
                    size="lg"
                  />
                </div>
                <Textarea
                  placeholder="Share your thoughts about this film..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="min-h-[120px] bg-muted/50 border-border"
                />
                <Button variant="letterboxd" disabled={!userRating}>
                  Post Review
                </Button>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Popular Reviews
              </h2>
              <div className="space-y-4">
                {mockReviews.slice(0, 2).map((review) => (
                  <ReviewCard key={review.id} {...review} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Stats & Similar */}
          <div className="space-y-8">
            {/* Rating Stats */}
            <div className="glass-card rounded-xl p-6">
              <div className="text-center mb-4">
                <p className="font-display text-5xl font-bold text-primary mb-1">
                  {movie.rating.toFixed(1)}
                </p>
                <StarRating rating={movie.rating / 2} readonly size="lg" />
                <p className="text-sm text-muted-foreground mt-2">Based on 45,231 ratings</p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-3">{star}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 7 : star === 2 ? 2 : 1}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Films */}
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Similar Films
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {popularMovies.slice(1, 7).map((film) => (
                  <MovieCard key={film.id} {...film} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FilmDetail;
