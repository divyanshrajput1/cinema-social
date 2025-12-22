import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TMDBPerson {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  gender: number;
  popularity: number;
  also_known_as: string[];
  homepage: string | null;
}

export interface TMDBPersonCredit {
  id: number;
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  department?: string;
  media_type: 'movie' | 'tv';
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  episode_count?: number;
}

export interface TMDBPersonDetails extends TMDBPerson {
  combined_credits: {
    cast: TMDBPersonCredit[];
    crew: TMDBPersonCredit[];
  };
  images: {
    profiles: Array<{
      file_path: string;
      aspect_ratio: number;
      width: number;
      height: number;
    }>;
  };
}

const fetchTMDB = async (action: string, params: Record<string, any> = {}) => {
  const { data, error } = await supabase.functions.invoke('tmdb', {
    body: { action, ...params }
  });
  
  if (error) throw error;
  return data;
};

export const getProfileUrl = (path: string | null, size: 'w185' | 'w300' | 'h632' | 'original' = 'w300') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const usePersonDetails = (personId: number | string | undefined) => {
  return useQuery({
    queryKey: ['person', personId],
    queryFn: () => fetchTMDB('person_details', { personId }),
    enabled: !!personId,
  });
};

export const usePersonCredits = (personId: number | string | undefined) => {
  return useQuery({
    queryKey: ['person-credits', personId],
    queryFn: () => fetchTMDB('person_credits', { personId }),
    enabled: !!personId,
  });
};
