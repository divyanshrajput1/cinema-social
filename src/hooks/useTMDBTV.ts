import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TMDBTVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  media_type?: string;
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  overview: string;
  poster_path: string | null;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  overview: string;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  air_date: string | null;
  overview: string;
  poster_path: string | null;
  episodes: TMDBEpisode[];
}

export interface TMDBTVDetails extends TMDBTVShow {
  tagline: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  status: string;
  in_production: boolean;
  last_air_date: string | null;
  seasons: TMDBSeason[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  videos?: {
    results: TMDBVideo[];
  };
  similar?: {
    results: TMDBTVShow[];
  };
  recommendations?: {
    results: TMDBTVShow[];
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

export interface TMDBTVResponse {
  page: number;
  results: TMDBTVShow[];
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

export const useTVTrending = (page = 1) => {
  return useQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'tv_trending', page],
    queryFn: () => fetchTMDB('tv_trending', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTVPopular = (page = 1) => {
  return useQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'tv_popular', page],
    queryFn: () => fetchTMDB('tv_popular', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useInfiniteTVPopular = () => {
  return useInfiniteQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'tv_popular', 'infinite'],
    queryFn: ({ pageParam = 1 }) => fetchTMDB('tv_popular', { page: pageParam }),
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

export const useTVTopRated = (page = 1) => {
  return useQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'tv_top_rated', page],
    queryFn: () => fetchTMDB('tv_top_rated', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTVOnTheAir = (page = 1) => {
  return useQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'tv_on_the_air', page],
    queryFn: () => fetchTMDB('tv_on_the_air', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTVAiringToday = (page = 1) => {
  return useQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'tv_airing_today', page],
    queryFn: () => fetchTMDB('tv_airing_today', { page }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchTV = (query: string, page = 1) => {
  return useQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'search_tv', query, page],
    queryFn: () => fetchTMDB('search_tv', { query, page }),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInfiniteSearchTV = (query: string) => {
  return useInfiniteQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'search_tv', 'infinite', query],
    queryFn: ({ pageParam = 1 }) => fetchTMDB('search_tv', { query, page: pageParam }),
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

export const useTVDetails = (tvId: number | string | undefined) => {
  return useQuery<TMDBTVDetails>({
    queryKey: ['tmdb', 'tv', tvId],
    queryFn: () => fetchTMDB('tv_details', { tvId }),
    enabled: !!tvId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useTVSeason = (tvId: number | string | undefined, seasonNumber: number | undefined) => {
  return useQuery<TMDBSeasonDetails>({
    queryKey: ['tmdb', 'tv_season', tvId, seasonNumber],
    queryFn: () => fetchTMDB('tv_season', { tvId, seasonNumber }),
    enabled: !!tvId && seasonNumber !== undefined,
    staleTime: 1000 * 60 * 10,
  });
};

export const useSimilarTV = (tvId: number | string | undefined, page = 1) => {
  return useQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'tv_similar', tvId, page],
    queryFn: () => fetchTMDB('tv_similar', { tvId, page }),
    enabled: !!tvId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTVGenres = () => {
  return useQuery<{ genres: { id: number; name: string }[] }>({
    queryKey: ['tmdb', 'tv_genres'],
    queryFn: () => fetchTMDB('tv_genres'),
    staleTime: 1000 * 60 * 60,
  });
};

export interface TVDiscoverFilters {
  genreId?: number;
  year?: number;
  minRating?: number;
  sortBy?: string;
}

export const useInfiniteTVDiscover = (filters: TVDiscoverFilters) => {
  return useInfiniteQuery<TMDBTVResponse>({
    queryKey: ['tmdb', 'discover_tv', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchTMDB('discover_tv', { 
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

// Multi-search hook (searches both movies and TV)
export interface MultiSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  // Movie fields
  title?: string;
  release_date?: string;
  // TV fields
  name?: string;
  first_air_date?: string;
  // Common fields
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
}

export interface MultiSearchResponse {
  page: number;
  results: MultiSearchResult[];
  total_pages: number;
  total_results: number;
}

export const useMultiSearch = (query: string, page = 1) => {
  return useQuery<MultiSearchResponse>({
    queryKey: ['tmdb', 'multi_search', query, page],
    queryFn: () => fetchTMDB('multi_search', { query, page }),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInfiniteMultiSearch = (query: string) => {
  return useInfiniteQuery<MultiSearchResponse>({
    queryKey: ['tmdb', 'multi_search', 'infinite', query],
    queryFn: ({ pageParam = 1 }) => fetchTMDB('multi_search', { query, page: pageParam }),
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
