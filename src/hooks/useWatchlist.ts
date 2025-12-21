import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface WatchlistItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  added_at: string;
  media_type: 'movie' | 'tv';
}

export const useWatchlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });
      
      if (error) throw error;
      return data as WatchlistItem[];
    },
    enabled: !!user,
  });

  const addToWatchlist = useMutation({
    mutationFn: async (item: { tmdb_id: number; title: string; poster_path?: string; release_date?: string; media_type?: 'movie' | 'tv' }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
        tmdb_id: item.tmdb_id,
        title: item.title,
        poster_path: item.poster_path || null,
        release_date: item.release_date || null,
        media_type: item.media_type || 'movie',
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
      toast.success("Added to watchlist");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("Already in watchlist");
      } else {
        toast.error("Failed to add to watchlist");
      }
    },
  });

  const removeFromWatchlist = useMutation({
    mutationFn: async (tmdbId: number) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
      toast.success("Removed from watchlist");
    },
    onError: () => {
      toast.error("Failed to remove from watchlist");
    },
  });

  const isInWatchlist = (tmdbId: number) => {
    return watchlist.some((item) => item.tmdb_id === tmdbId);
  };

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
};
