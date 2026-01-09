import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TMDBAuthorDetails {
  name: string;
  username: string;
  avatar_path: string | null;
  rating: number | null;
}

export interface TMDBReview {
  id: string;
  author: string;
  author_details: TMDBAuthorDetails;
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface TMDBReviewsResponse {
  id: number;
  page: number;
  results: TMDBReview[];
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

export const getAvatarUrl = (avatarPath: string | null) => {
  if (!avatarPath) return null;
  // TMDB avatar paths can be absolute URLs (starting with /) or relative paths
  if (avatarPath.startsWith('/https://')) {
    return avatarPath.substring(1); // Remove leading slash for external URLs
  }
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  return `https://image.tmdb.org/t/p/w200${avatarPath}`;
};

export const useMovieReviews = (movieId: number | string | undefined) => {
  return useInfiniteQuery<TMDBReviewsResponse>({
    queryKey: ['tmdb', 'movie_reviews', movieId],
    queryFn: ({ pageParam = 1 }) => fetchTMDB('movie_reviews', { movieId, page: pageParam }),
    initialPageParam: 1,
    enabled: !!movieId,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useTVReviews = (tvId: number | string | undefined) => {
  return useInfiniteQuery<TMDBReviewsResponse>({
    queryKey: ['tmdb', 'tv_reviews', tvId],
    queryFn: ({ pageParam = 1 }) => fetchTMDB('tv_reviews', { tvId, page: pageParam }),
    initialPageParam: 1,
    enabled: !!tvId,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 10,
  });
};
