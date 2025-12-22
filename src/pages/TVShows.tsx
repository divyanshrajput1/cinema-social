import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TVCard from "@/components/tv/TVCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Grid, List, Loader2, X, SlidersHorizontal } from "lucide-react";
import { useInfiniteTVDiscover, useInfiniteSearchTV, useTVGenres, TMDBTVShow, TVDiscoverFilters } from "@/hooks/useTMDBTV";
import { useDebounce } from "@/hooks/useDebounce";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

const ratingOptions = [
  { value: "0", label: "Any Rating" },
  { value: "5", label: "5+ Stars" },
  { value: "6", label: "6+ Stars" },
  { value: "7", label: "7+ Stars" },
  { value: "8", label: "8+ Stars" },
  { value: "9", label: "9+ Stars" },
];

const sortOptions = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "popularity.asc", label: "Least Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "vote_average.asc", label: "Lowest Rated" },
  { value: "first_air_date.desc", label: "Newest First" },
  { value: "first_air_date.asc", label: "Oldest First" },
];

const TVShows = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedGenre, setSelectedGenre] = useState<string>(searchParams.get('genre') || '');
  const [selectedYear, setSelectedYear] = useState<string>(searchParams.get('year') || '');
  const [selectedRating, setSelectedRating] = useState<string>(searchParams.get('rating') || '');
  const [selectedSort, setSelectedSort] = useState<string>(searchParams.get('sort') || 'popularity.desc');
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver();
  
  const { data: genresData } = useTVGenres();
  
  // Build filters object
  const filters: TVDiscoverFilters = useMemo(() => ({
    genreId: selectedGenre && selectedGenre !== 'all' ? parseInt(selectedGenre) : undefined,
    year: selectedYear && selectedYear !== 'all' ? parseInt(selectedYear) : undefined,
    minRating: selectedRating && selectedRating !== '0' ? parseInt(selectedRating) : undefined,
    sortBy: selectedSort || 'popularity.desc',
  }), [selectedGenre, selectedYear, selectedRating, selectedSort]);
  
  const hasActiveFilters = (selectedGenre && selectedGenre !== 'all') || (selectedYear && selectedYear !== 'all') || (selectedRating && selectedRating !== '0') || selectedSort !== 'popularity.desc';
  
  const {
    data: searchData,
    isLoading: searchLoading,
    isFetchingNextPage: searchFetchingNext,
    hasNextPage: searchHasNext,
    fetchNextPage: fetchNextSearch,
  } = useInfiniteSearchTV(debouncedSearch);
  
  const {
    data: discoverData,
    isLoading: discoverLoading,
    isFetchingNextPage: discoverFetchingNext,
    hasNextPage: discoverHasNext,
    fetchNextPage: fetchNextDiscover,
  } = useInfiniteTVDiscover(filters);
  
  const isSearching = debouncedSearch.length > 0;
  const data = isSearching ? searchData : discoverData;
  const isLoading = isSearching ? searchLoading : discoverLoading;
  const isFetchingNextPage = isSearching ? searchFetchingNext : discoverFetchingNext;
  const hasNextPage = isSearching ? searchHasNext : discoverHasNext;
  const fetchNextPage = isSearching ? fetchNextSearch : fetchNextDiscover;
  
  const shows = data?.pages.flatMap(page => page.results) ?? [];
  const totalResults = data?.pages[0]?.total_results ?? 0;

  // Trigger load more
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedYear) params.set('year', selectedYear);
    if (selectedRating) params.set('rating', selectedRating);
    if (selectedSort && selectedSort !== 'popularity.desc') params.set('sort', selectedSort);
    setSearchParams(params);
  }, [debouncedSearch, selectedGenre, selectedYear, selectedRating, selectedSort, setSearchParams]);

  const handleShowClick = (id: number) => {
    navigate(`/tv/${id}`);
  };
  
  const clearFilters = () => {
    setSelectedGenre('all');
    setSelectedYear('all');
    setSelectedRating('0');
    setSelectedSort('popularity.desc');
    setSearchQuery('');
  };

  const getActiveFilterLabel = () => {
    const parts: string[] = [];
    if (selectedGenre && selectedGenre !== 'all') {
      const genre = genresData?.genres.find(g => g.id.toString() === selectedGenre);
      if (genre) parts.push(genre.name);
    }
    if (selectedYear && selectedYear !== 'all') parts.push(selectedYear);
    if (selectedRating && selectedRating !== '0') parts.push(`${selectedRating}+ rating`);
    return parts.length > 0 ? parts.join(' • ') : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              TV Shows
            </h1>
            <p className="text-muted-foreground">
              {isSearching 
                ? `Search results for "${debouncedSearch}"` 
                : getActiveFilterLabel() || 'Discover TV series from our database'
              }
            </p>
          </div>

          {/* Search & Filter Toggle */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border h-12"
                />
                {searchLoading && searchQuery && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-primary-foreground text-primary rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
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

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Genre</label>
                  <Select value={selectedGenre || 'all'} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="all">All Genres</SelectItem>
                      {genresData?.genres.map((genre) => (
                        <SelectItem key={genre.id} value={genre.id.toString()}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Year</label>
                  <Select value={selectedYear || 'all'} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Any Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border max-h-60">
                      <SelectItem value="all">Any Year</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rating</label>
                  <Select value={selectedRating || '0'} onValueChange={setSelectedRating}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {ratingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sort By</label>
                  <Select value={selectedSort || 'popularity.desc'} onValueChange={setSelectedSort}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {hasActiveFilters && (
                  <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                    <Button variant="ghost" onClick={clearFilters} className="gap-2">
                      <X className="w-4 h-4" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          {!isLoading && shows.length > 0 && (
            <p className="text-sm text-muted-foreground mb-6">
              Showing {shows.length.toLocaleString()} of {totalResults.toLocaleString()} TV shows
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

          {/* TV Show Grid */}
          {!isLoading && shows.length > 0 && (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
                {shows.map((show: TMDBTVShow, index: number) => (
                  <div
                    key={`${show.id}-${index}`}
                    className="animate-fade-in"
                    style={{ animationDelay: `${(index % 20) * 0.03}s` }}
                  >
                    <TVCard
                      id={show.id}
                      name={show.name}
                      posterPath={show.poster_path}
                      year={show.first_air_date ? new Date(show.first_air_date).getFullYear().toString() : ''}
                      rating={show.vote_average}
                      onClick={() => handleShowClick(show.id)}
                    />
                  </div>
                ))}
              </div>
              
              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                )}
                {!hasNextPage && shows.length > 0 && (
                  <p className="text-muted-foreground text-sm">You've seen all the shows!</p>
                )}
              </div>
            </>
          )}

          {/* No Results */}
          {!isLoading && shows.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">
                {isSearching 
                  ? `No TV shows found matching "${debouncedSearch}"`
                  : 'No TV shows found with the selected filters'
                }
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TVShows;
