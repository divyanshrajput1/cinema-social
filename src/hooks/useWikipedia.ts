import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WikipediaData {
  title: string;
  pageId: number;
  url: string;
  sections: { [key: string]: string };
  hasSections: boolean;
}

interface WikipediaParams {
  title: string;
  year?: string;
  mediaType: 'movie' | 'tv';
}

const fetchWikipedia = async (params: WikipediaParams): Promise<WikipediaData> => {
  const { data, error } = await supabase.functions.invoke('wikipedia', {
    body: {
      title: params.title,
      year: params.year,
      mediaType: params.mediaType,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to fetch Wikipedia data');
  }

  if (data.error === 'not_found') {
    throw new Error('No Wikipedia article found');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
};

export const useWikipedia = (params: WikipediaParams | null, enabled: boolean = false) => {
  return useQuery<WikipediaData>({
    queryKey: ['wikipedia', params?.title, params?.year, params?.mediaType],
    queryFn: () => fetchWikipedia(params!),
    enabled: enabled && !!params?.title,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: false,
  });
};
