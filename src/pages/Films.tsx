import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MovieCard from "@/components/movies/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Grid, List, Loader2 } from "lucide-react";
import { useInfinitePopular, useInfiniteSearch, TMDBMovie } from "@/hooks/useTMDB";
import { useDebounce } from "@/hooks/useDebounce";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const Films = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver();
  
  const {
    data: searchData,
    isLoading: searchLoading,
    isFetchingNextPage: searchFetchingNext,
    hasNextPage: searchHasNext,
    fetchNextPage: fetchNextSearch,
  } = useInfiniteSearch(debouncedSearch);
  
  const {
    data: popularData,
    isLoading: popularLoading,
    isFetchingNextPage: popularFetchingNext,
    hasNextPage: popularHasNext,
    fetchNextPage: fetchNextPopular,
  } = useInfinitePopular();
  
  const isSearching = debouncedSearch.length > 0;
  const data = isSearching ? searchData : popularData;
  const isLoading = isSearching ? searchLoading : popularLoading;
  const isFetchingNextPage = isSearching ? searchFetchingNext : popularFetchingNext;
  const hasNextPage = isSearching ? searchHasNext : popularHasNext;
  const fetchNextPage = isSearching ? fetchNextSearch : fetchNextPopular;
  
  // Flatten all pages into a single array of movies
  const movies = data?.pages.flatMap(page => page.results) ?? [];
  const totalResults = data?.pages[0]?.total_results ?? 0;

  // Trigger load more when intersection observer fires
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update URL when search changes
  useEffect(() => {
    if (debouncedSearch) {
      setSearchParams({ q: debouncedSearch });
    } else {
      setSearchParams({});
    }
  }, [debouncedSearch, setSearchParams]);

  const handleMovieClick = (id: number) => {
    navigate(`/film/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Films
            </h1>
            <p className="text-muted-foreground">
              {isSearching 
                ? `Search results for "${debouncedSearch}"` 
                : 'Explore popular films from our database'
              }
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search films..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border h-12"
              />
              {searchLoading && searchQuery && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-colors ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-colors ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {!isLoading && movies.length > 0 && (
            <p className="text-sm text-muted-foreground mb-6">
              {isSearching 
                ? `Found ${totalResults.toLocaleString()} films` 
                : `Showing ${movies.length} of ${totalResults.toLocaleString()} popular films`
              }
            </p>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
              {Array.from({ length: 21 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          )}

          {/* Movie Grid */}
          {!isLoading && movies.length > 0 && (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
                {movies.map((movie: TMDBMovie, index: number) => (
                  <div
                    key={`${movie.id}-${index}`}
                    className="animate-fade-in"
                    style={{ animationDelay: `${(index % 20) * 0.03}s` }}
                  >
                    <MovieCard
                      id={movie.id}
                      title={movie.title}
                      posterPath={movie.poster_path}
                      year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : ''}
                      rating={movie.vote_average}
                      onClick={() => handleMovieClick(movie.id)}
                    />
                  </div>
                ))}
              </div>
              
              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                )}
                {!hasNextPage && movies.length > 0 && (
                  <p className="text-muted-foreground text-sm">You've seen all the films!</p>
                )}
              </div>
            </>
          )}

          {/* No Results */}
          {!isLoading && isSearching && movies.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">
                No films found matching "{debouncedSearch}"
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Films;
