import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WikipediaTocItem {
  id: string;
  title: string;
  level: number;
}

export interface WikipediaSection {
  id: string;
  title: string;
  level: number;
  content: string;
}

export interface WikipediaInfobox {
  html: string;
  data: Record<string, string>;
}

export interface WikipediaFullData {
  title: string;
  pageId: number;
  url: string;
  infobox: WikipediaInfobox | null;
  leadSection: string;
  sections: WikipediaSection[];
  toc: WikipediaTocItem[];
  images: string[];
  hasSections: boolean;
  isLimited: boolean;
}

interface WikipediaParams {
  title: string;
  year?: string;
  mediaType: 'movie' | 'tv';
}

const fetchWikipediaFull = async (params: WikipediaParams): Promise<WikipediaFullData> => {
  const { data, error } = await supabase.functions.invoke('wikipedia', {
    body: {
      title: params.title,
      year: params.year,
      mediaType: params.mediaType,
      fullContent: true,
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

export const useWikipediaFull = (params: WikipediaParams | null, enabled: boolean = true) => {
  return useQuery<WikipediaFullData>({
    queryKey: ['wikipedia-full', params?.title, params?.year, params?.mediaType],
    queryFn: () => fetchWikipediaFull(params!),
    enabled: enabled && !!params?.title,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: false,
  });
};
