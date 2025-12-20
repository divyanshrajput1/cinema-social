import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Review {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

interface ReviewComment {
  id: string;
  user_id: string;
  review_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface CreateReviewInput {
  tmdb_id: number;
  title: string;
  poster_path?: string;
  rating: number;
  content: string;
}

interface UpdateReviewInput {
  id: string;
  rating: number;
  content: string;
}

export const useReviews = (tmdbId?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reviews for a specific movie
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", tmdbId],
    queryFn: async () => {
      if (!tmdbId) return [];
      
      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("tmdb_id", tmdbId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles for all review authors
      const userIds = [...new Set(reviewsData?.map(r => r.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);
      
      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );
      
      const reviewsWithProfiles = (reviewsData || []).map(review => ({
        ...review,
        profile: profilesMap.get(review.user_id) || undefined,
      }));
      
      return await enrichReviews(reviewsWithProfiles);
    },
    enabled: !!tmdbId,
  });

  const enrichReviews = async (reviewsData: any[]): Promise<Review[]> => {
    const enrichedReviews = await Promise.all(
      reviewsData.map(async (review) => {
        // Get likes count
        const { count: likesCount } = await supabase
          .from("review_likes")
          .select("*", { count: "exact", head: true })
          .eq("review_id", review.id);

        // Get comments count
        const { count: commentsCount } = await supabase
          .from("review_comments")
          .select("*", { count: "exact", head: true })
          .eq("review_id", review.id);

        // Check if current user has liked
        let userHasLiked = false;
        if (user) {
          const { data: likeData } = await supabase
            .from("review_likes")
            .select("id")
            .eq("review_id", review.id)
            .eq("user_id", user.id)
            .maybeSingle();
          userHasLiked = !!likeData;
        }

        return {
          ...review,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          user_has_liked: userHasLiked,
        };
      })
    );
    return enrichedReviews;
  };

  // Get user's review for a specific movie
  const getUserReview = (tmdbId: number) => {
    return reviews.find((r) => r.user_id === user?.id && r.tmdb_id === tmdbId);
  };

  // Create review
  const createReview = useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        tmdb_id: input.tmdb_id,
        title: input.title,
        poster_path: input.poster_path || null,
        rating: input.rating,
        content: input.content,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review posted");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("You've already reviewed this film");
      } else {
        toast.error("Failed to post review");
      }
    },
  });

  // Update review
  const updateReview = useMutation({
    mutationFn: async (input: UpdateReviewInput) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("reviews")
        .update({ rating: input.rating, content: input.content })
        .eq("id", input.id)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review updated");
    },
    onError: () => {
      toast.error("Failed to update review");
    },
  });

  // Delete review
  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted");
    },
    onError: () => {
      toast.error("Failed to delete review");
    },
  });

  // Toggle like
  const toggleLike = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data: existing } = await supabase
        .from("review_likes")
        .select("id")
        .eq("review_id", reviewId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existing) {
        const { error } = await supabase
          .from("review_likes")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("review_likes")
          .insert({ user_id: user.id, review_id: reviewId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: () => {
      toast.error("Failed to update like");
    },
  });

  return {
    reviews,
    isLoading,
    getUserReview,
    createReview,
    updateReview,
    deleteReview,
    toggleLike,
  };
};

export const useReviewComments = (reviewId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["review-comments", reviewId],
    queryFn: async () => {
      if (!reviewId) return [];
      
      // Fetch comments
      const { data: commentsData, error } = await supabase
        .from("review_comments")
        .select("*")
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Fetch profiles for all comment authors
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);
      
      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );
      
      return (commentsData || []).map(comment => ({
        ...comment,
        profile: profilesMap.get(comment.user_id) || undefined,
      })) as ReviewComment[];
    },
    enabled: !!reviewId,
  });

  const addComment = useMutation({
    mutationFn: async ({ reviewId, content }: { reviewId: string; content: string }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase.from("review_comments").insert({
        user_id: user.id,
        review_id: reviewId,
        content,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-comments"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("review_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-comments"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
  };
};
