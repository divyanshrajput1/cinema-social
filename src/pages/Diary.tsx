import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDiary } from "@/hooks/useDiary";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/common/BackButton";
import { getImageUrl } from "@/hooks/useTMDB";
import { Calendar, Film, Heart, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Diary = () => {
  const { user, loading: authLoading } = useAuth();
  const { diary, isLoading, removeFromDiary } = useDiary();
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
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group diary entries by month
  const groupedEntries = diary.reduce((acc, entry) => {
    const date = new Date(entry.watched_at);
    const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(entry);
    return acc;
  }, {} as Record<string, typeof diary>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-semibold">Diary</h1>
          <span className="text-muted-foreground">({diary.length} entries)</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : diary.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your diary is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start logging films you've watched
            </p>
            <Button variant="letterboxd" asChild>
              <Link to="/films">Browse Films</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([monthYear, entries]) => (
              <div key={monthYear}>
                <h2 className="font-display text-xl font-semibold mb-4 text-primary">
                  {monthYear}
                </h2>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="glass-card rounded-lg p-4 flex gap-4 group"
                    >
                      <Link to={`/film/${entry.tmdb_id}`} className="shrink-0">
                        <div className="w-16 aspect-[2/3] rounded overflow-hidden bg-muted">
                          {entry.poster_path ? (
                            <img
                              src={getImageUrl(entry.poster_path, "w200")}
                              alt={entry.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/film/${entry.tmdb_id}`}
                              className="font-semibold hover:text-primary transition-colors"
                            >
                              {entry.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              Watched on{" "}
                              {new Date(entry.watched_at).toLocaleDateString("en-US", {
                                weekday: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.liked && (
                              <Heart className="w-4 h-4 fill-destructive text-destructive" />
                            )}
                            {entry.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-primary text-primary" />
                                <span className="text-sm font-medium">{entry.rating}</span>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={() => removeFromDiary.mutate(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {entry.review && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {entry.review}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Diary;
