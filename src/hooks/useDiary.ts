import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DiaryEntry {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  watched_at: string;
  rating: number | null;
  review: string | null;
  liked: boolean;
  created_at: string;
  updated_at: string;
}

interface AddDiaryInput {
  tmdb_id: number;
  title: string;
  poster_path?: string;
  release_date?: string;
  watched_at?: string;
  rating?: number;
  review?: string;
  liked?: boolean;
}

interface UpdateDiaryInput {
  id: string;
  watched_at?: string;
  rating?: number;
  review?: string;
  liked?: boolean;
}

export const useDiary = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: diary = [], isLoading } = useQuery({
    queryKey: ["diary", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("diary")
        .select("*")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false });
      
      if (error) throw error;
      return data as DiaryEntry[];
    },
    enabled: !!user,
  });

  const addToDiary = useMutation({
    mutationFn: async (input: AddDiaryInput) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase.from("diary").insert({
        user_id: user.id,
        tmdb_id: input.tmdb_id,
        title: input.title,
        poster_path: input.poster_path || null,
        release_date: input.release_date || null,
        watched_at: input.watched_at || new Date().toISOString().split("T")[0],
        rating: input.rating || null,
        review: input.review || null,
        liked: input.liked || false,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary", user?.id] });
      toast.success("Added to diary");
    },
    onError: () => {
      toast.error("Failed to add to diary");
    },
  });

  const updateDiaryEntry = useMutation({
    mutationFn: async (input: UpdateDiaryInput) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("diary")
        .update({
          watched_at: input.watched_at,
          rating: input.rating,
          review: input.review,
          liked: input.liked,
        })
        .eq("id", input.id)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary", user?.id] });
      toast.success("Diary entry updated");
    },
    onError: () => {
      toast.error("Failed to update diary entry");
    },
  });

  const removeFromDiary = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("diary")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary", user?.id] });
      toast.success("Removed from diary");
    },
    onError: () => {
      toast.error("Failed to remove from diary");
    },
  });

  const getEntryForMovie = (tmdbId: number) => {
    return diary.find((entry) => entry.tmdb_id === tmdbId);
  };

  return {
    diary,
    isLoading,
    addToDiary,
    updateDiaryEntry,
    removeFromDiary,
    getEntryForMovie,
  };
};
