import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/movies/StarRating";
import { getImageUrl } from "@/hooks/useTMDB";

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie: {
    id: number;
    title: string;
    poster_path?: string;
  };
  existingReview?: {
    id: string;
    rating: number;
    content: string;
  };
  onSubmit: (data: { rating: number; content: string }) => void;
  isLoading?: boolean;
}

const WriteReviewDialog = ({
  open,
  onOpenChange,
  movie,
  existingReview,
  onSubmit,
  isLoading,
}: WriteReviewDialogProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [content, setContent] = useState(existingReview?.content || "");

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setContent(existingReview.content);
    } else {
      setRating(0);
      setContent("");
    }
  }, [existingReview, open]);

  const handleSubmit = () => {
    if (rating === 0) return;
    if (content.trim().length < 10) return;
    onSubmit({ rating, content: content.trim() });
    onOpenChange(false);
  };

  const isValid = rating > 0 && content.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {existingReview ? "Edit Review" : "Write a Review"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Movie Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 aspect-[2/3] rounded-md overflow-hidden bg-muted flex-shrink-0">
              <img
                src={getImageUrl(movie.poster_path, "w200")}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{movie.title}</h3>
              <p className="text-sm text-muted-foreground">Your rating</p>
              <div className="mt-1">
                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your Review
            </label>
            <Textarea
              placeholder="Share your thoughts about this film... (minimum 10 characters)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 resize-none bg-muted/50 border-border"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/2000
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="cinema"
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
            >
              {isLoading
                ? "Saving..."
                : existingReview
                ? "Update Review"
                : "Post Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewDialog;
