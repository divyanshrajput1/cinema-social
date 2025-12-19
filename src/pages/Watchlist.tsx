import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getImageUrl } from "@/hooks/useTMDB";
import { Clock, Film, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Watchlist = () => {
  const { user, loading: authLoading } = useAuth();
  const { watchlist, isLoading, removeFromWatchlist } = useWatchlist();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-semibold">Watchlist</h1>
          <span className="text-muted-foreground">({watchlist.length} films)</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding films you want to watch
            </p>
            <Button variant="letterboxd" asChild>
              <Link to="/films">Browse Films</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlist.map((item) => (
              <div key={item.id} className="group relative">
                <Link to={`/film/${item.tmdb_id}`}>
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted poster-hover">
                    {item.poster_path ? (
                      <img
                        src={getImageUrl(item.poster_path, "w500")}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromWatchlist.mutate(item.tmdb_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <h3 className="mt-2 text-sm font-medium line-clamp-1">{item.title}</h3>
                {item.release_date && (
                  <p className="text-xs text-muted-foreground">
                    {item.release_date.split("-")[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Watchlist;
