import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedMovie from "@/components/movies/FeaturedMovie";
import MovieGrid from "@/components/movies/MovieGrid";
import ReviewCard from "@/components/reviews/ReviewCard";
import { featuredMovie, popularMovies, recentlyReviewed, mockReviews, classicMovies } from "@/data/mockMovies";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Film, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background film-grain">
      <Navbar />
      
      {/* Featured Movie Hero */}
      <FeaturedMovie {...featuredMovie} />

      {/* Popular Films */}
      <MovieGrid
        title="Popular This Week"
        subtitle="The most-watched films in the past seven days"
        movies={popularMovies}
        onMovieClick={(id) => navigate(`/film/${id}`)}
      />

      {/* Recent Reviews Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Recent Reviews
              </h2>
              <p className="text-muted-foreground mt-1">
                Fresh takes from the community
              </p>
            </div>
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              View all
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockReviews.map((review, index) => (
              <div
                key={review.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ReviewCard {...review} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Just Reviewed */}
      <MovieGrid
        title="Just Reviewed"
        subtitle="Films getting attention right now"
        movies={recentlyReviewed}
        onMovieClick={(id) => navigate(`/film/${id}`)}
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

      {/* Classic Films */}
      <MovieGrid
        title="Timeless Classics"
        subtitle="Masterpieces that defined cinema"
        movies={classicMovies}
        onMovieClick={(id) => navigate(`/film/${id}`)}
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
    </div>
  );
};

export default Index;
