import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Film, Tv, Star, Pencil, Trash2, MessageSquare } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import EditReviewDialog from "@/components/reviews/EditReviewDialog";

interface UserReview {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  rating: number;
  content: string;
  media_type: string;
  created_at: string;
  updated_at: string;
}

const Reviews = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["user-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as UserReview[];
    },
    enabled: !!user,
  });

  const handleDelete = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user?.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleUpdateReview = async (id: string, rating: number, content: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ rating, content })
        .eq("id", id)
        .eq("user_id", user?.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review updated");
      setEditingReview(null);
    } catch {
      toast.error("Failed to update review");
    }
  };

  const getDetailPath = (review: UserReview) => {
    return review.media_type === "tv" ? `/tv/${review.tmdb_id}` : `/film/${review.tmdb_id}`;
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return "/placeholder.svg";
    return `https://image.tmdb.org/t/p/w300${posterPath}`;
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <h1 className="font-display text-2xl font-semibold mb-2">Sign in to view your reviews</h1>
            <p className="text-muted-foreground mb-6">
              Keep track of all the movies and TV shows you've reviewed.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
            My Reviews
          </h1>
          <p className="text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="flex gap-4">
                    <Skeleton className="w-20 md:w-24 aspect-[2/3] rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">
              You haven't reviewed anything yet.
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start exploring movies and TV shows to share your thoughts and ratings.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/films">Browse Films</Link>
              </Button>
              <Button asChild>
                <Link to="/tv">Browse TV Shows</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {!isLoading && reviews.length > 0 && (
          <div className="grid gap-4 md:gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                <CardContent className="p-4 md:p-6">
                  <div className="flex gap-4">
                    {/* Poster */}
                    <Link 
                      to={getDetailPath(review)}
                      className="flex-shrink-0 w-20 md:w-24 aspect-[2/3] rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={getPosterUrl(review.poster_path)}
                        alt={review.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Link 
                            to={getDetailPath(review)}
                            className="font-display text-lg md:text-xl font-semibold hover:text-primary transition-colors line-clamp-1"
                          >
                            {review.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className="gap-1 text-xs">
                              {review.media_type === "tv" ? (
                                <>
                                  <Tv className="w-3 h-3" />
                                  TV Show
                                </>
                              ) : (
                                <>
                                  <Film className="w-3 h-3" />
                                  Movie
                                </>
                              )}
                            </Badge>
                            <div className="flex items-center gap-1 text-primary">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-semibold">{review.rating}</span>
                              <span className="text-muted-foreground">/5</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingReview(review)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete your review for "{review.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(review.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Review Text */}
                      <p className="text-foreground/80 text-sm md:text-base leading-relaxed line-clamp-3 mb-3">
                        {review.content}
                      </p>

                      {/* Date */}
                      <p className="text-xs text-muted-foreground">
                        Reviewed on {format(new Date(review.created_at), "MMMM d, yyyy")}
                        {review.updated_at !== review.created_at && (
                          <span className="ml-2">(edited)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Edit Review Dialog */}
      {editingReview && (
        <EditReviewDialog
          open={!!editingReview}
          onOpenChange={(open) => !open && setEditingReview(null)}
          review={editingReview}
          onSave={handleUpdateReview}
        />
      )}
    </div>
  );
};

export default Reviews;
