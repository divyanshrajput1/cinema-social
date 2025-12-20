import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
}

export interface TMDBMovieDetails extends TMDBMovie {
  tagline: string;
  runtime: number;
  budget: number;
  revenue: number;
  status: string;
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  videos?: {
    results: TMDBVideo[];
  };
  similar?: {
    results: TMDBMovie[];
  };
  recommendations?: {
    results: TMDBMovie[];
  };
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

const fetchTMDB = async (action: string, params: Record<string, any> = {}) => {
  const { data, error } = await supabase.functions.invoke('tmdb', {
    body: { action, ...params },
  });
  
  if (error) {
    console.error('TMDB fetch error:', error);
    throw error;
  }
  
  return data;
};

export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'original') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const useTrending = (page = 1) => {
  return useQuery<TMDBResponse>({
    queryKey: ['tmdb', 'trending', page],
    queryFn: () => fetchTMDB('trending', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePopular = (page = 1) => {
  return useQuery<TMDBResponse>({
    queryKey: ['tmdb', 'popular', page],
    queryFn: () => fetchTMDB('popular', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useInfinitePopular = () => {
  return useInfiniteQuery<TMDBResponse>({
    queryKey: ['tmdb', 'popular', 'infinite'],
    queryFn: ({ pageParam = 1 }) => fetchTMDB('popular', { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopRated = (page = 1) => {
  return useQuery<TMDBResponse>({
    queryKey: ['tmdb', 'top_rated', page],
    queryFn: () => fetchTMDB('top_rated', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useNowPlaying = (page = 1) => {
  return useQuery<TMDBResponse>({
    queryKey: ['tmdb', 'now_playing', page],
    queryFn: () => fetchTMDB('now_playing', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpcoming = (page = 1) => {
  return useQuery<TMDBResponse>({
    queryKey: ['tmdb', 'upcoming', page],
    queryFn: () => fetchTMDB('upcoming', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchMovies = (query: string, page = 1) => {
  return useQuery<TMDBResponse>({
    queryKey: ['tmdb', 'search', query, page],
    queryFn: () => fetchTMDB('search', { query, page }),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInfiniteSearch = (query: string) => {
  return useInfiniteQuery<TMDBResponse>({
    queryKey: ['tmdb', 'search', 'infinite', query],
    queryFn: ({ pageParam = 1 }) => fetchTMDB('search', { query, page: pageParam }),
    initialPageParam: 1,
    enabled: query.length > 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useMovieDetails = (movieId: number | string | undefined) => {
  return useQuery<TMDBMovieDetails>({
    queryKey: ['tmdb', 'movie', movieId],
    queryFn: () => fetchTMDB('movie_details', { movieId }),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useSimilarMovies = (movieId: number | string | undefined, page = 1) => {
  return useQuery<TMDBResponse>({
    queryKey: ['tmdb', 'similar', movieId, page],
    queryFn: () => fetchTMDB('similar', { movieId, page }),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGenres = () => {
  return useQuery<{ genres: { id: number; name: string }[] }>({
    queryKey: ['tmdb', 'genres'],
    queryFn: () => fetchTMDB('genres'),
    staleTime: 1000 * 60 * 60,
  });
};

export interface DiscoverFilters {
  genreId?: number;
  year?: number;
  minRating?: number;
  sortBy?: string;
}

export const useInfiniteDiscover = (filters: DiscoverFilters) => {
  return useInfiniteQuery<TMDBResponse>({
    queryKey: ['tmdb', 'discover', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchTMDB('discover', { 
      page: pageParam,
      ...filters 
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages && lastPage.page < 500) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
};
