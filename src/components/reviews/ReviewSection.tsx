import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import StarRating from "@/components/movies/StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useReviews, useReviewComments } from "@/hooks/useReviews";
import WriteReviewDialog from "./WriteReviewDialog";
import { toast } from "sonner";

interface ReviewSectionProps {
  movie: {
    id: number;
    title: string;
    poster_path?: string;
  };
  mediaType?: 'movie' | 'tv';
}

const ReviewSection = ({ movie, mediaType = 'movie' }: ReviewSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [writeDialogOpen, setWriteDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<{
    id: string;
    rating: number;
    content: string;
  } | null>(null);

  const {
    reviews,
    isLoading,
    getUserReview,
    createReview,
    updateReview,
    deleteReview,
    toggleLike,
  } = useReviews(movie.id);

  const userReview = user ? getUserReview(movie.id) : undefined;

  const handleWriteReview = () => {
    if (!user) {
      toast.error("Sign in to write a review");
      navigate("/auth");
      return;
    }
    setEditingReview(null);
    setWriteDialogOpen(true);
  };

  const handleEditReview = (review: { id: string; rating: number; content: string }) => {
    setEditingReview(review);
    setWriteDialogOpen(true);
  };

  const handleSubmitReview = (data: { rating: number; content: string }) => {
    if (editingReview) {
      updateReview.mutate({ id: editingReview.id, ...data });
    } else {
      createReview.mutate({
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        media_type: mediaType,
        ...data,
      });
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteReview.mutate(reviewId);
    }
  };

  const handleLike = (reviewId: string) => {
    if (!user) {
      toast.error("Sign in to like reviews");
      navigate("/auth");
      return;
    }
    toggleLike.mutate(reviewId);
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Reviews</h2>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Reviews ({reviews.length})
        </h2>
        {!userReview && (
          <Button variant="outline" size="sm" onClick={handleWriteReview}>
            Write a Review
          </Button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-muted-foreground mb-4">No reviews yet. Be the first to share your thoughts!</p>
          <Button variant="cinema" onClick={handleWriteReview}>
            Write a Review
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              isOwner={user?.id === review.user_id}
              onEdit={() =>
                handleEditReview({
                  id: review.id,
                  rating: review.rating,
                  content: review.content,
                })
              }
              onDelete={() => handleDeleteReview(review.id)}
              onLike={() => handleLike(review.id)}
            />
          ))}
        </div>
      )}

      <WriteReviewDialog
        open={writeDialogOpen}
        onOpenChange={setWriteDialogOpen}
        movie={movie}
        existingReview={editingReview || undefined}
        onSubmit={handleSubmitReview}
        isLoading={createReview.isPending || updateReview.isPending}
      />
    </section>
  );
};

interface ReviewItemProps {
  review: {
    id: string;
    user_id: string;
    rating: number;
    content: string;
    created_at: string;
    profile?: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    };
    likes_count: number;
    comments_count: number;
    user_has_liked: boolean;
  };
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onLike: () => void;
}

const ReviewItem = ({ review, isOwner, onEdit, onDelete, onLike }: ReviewItemProps) => {
  const [showComments, setShowComments] = useState(false);

  const displayName = review.profile?.display_name || review.profile?.username || "Film Lover";
  const avatarUrl = review.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user_id}`;

  return (
    <article className="glass-card rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-border">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <span className="font-medium text-foreground">{displayName}</span>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border-border">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <p className="text-foreground/90 leading-relaxed mb-4 whitespace-pre-wrap">
            {review.content}
          </p>

          <div className="flex items-center gap-6">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 text-sm transition-colors ${
                review.user_has_liked
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Heart className={`w-4 h-4 ${review.user_has_liked ? "fill-current" : ""}`} />
              <span>{review.likes_count}</span>
            </button>

            <Collapsible open={showComments} onOpenChange={setShowComments}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{review.comments_count}</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <CommentsSection reviewId={review.id} />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </article>
  );
};

const CommentsSection = ({ reviewId }: { reviewId: string }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading, addComment, deleteComment } = useReviewComments(reviewId);

  const handleSubmitComment = () => {
    if (!user) {
      toast.error("Sign in to comment");
      navigate("/auth");
      return;
    }
    if (newComment.trim().length < 2) return;
    addComment.mutate({ reviewId, content: newComment.trim() });
    setNewComment("");
  };

  return (
    <div className="space-y-4 border-t border-border pt-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      ) : (
        <>
          {comments.map((comment) => {
            const displayName =
              comment.profile?.display_name ||
              comment.profile?.username ||
              "Film Lover";
            const avatarUrl =
              comment.profile?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`;

            return (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => deleteComment.mutate(comment.id)}
                        className="text-xs text-destructive hover:underline ml-auto"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80">{comment.content}</p>
                </div>
              </div>
            );
          })}

          <div className="flex gap-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-16 resize-none bg-muted/50 border-border text-sm"
              maxLength={500}
            />
            <Button
              variant="cinema"
              size="sm"
              onClick={handleSubmitComment}
              disabled={newComment.trim().length < 2 || addComment.isPending}
              className="self-end"
            >
              Post
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewSection;
