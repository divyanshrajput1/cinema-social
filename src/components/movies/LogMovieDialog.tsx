import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogMovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie: {
    id: number;
    title: string;
    poster_path?: string;
    release_date?: string;
  };
  onSubmit: (data: {
    watched_at: string;
    rating?: number;
    review?: string;
    liked: boolean;
  }) => void;
}

const LogMovieDialog = ({ open, onOpenChange, movie, onSubmit }: LogMovieDialogProps) => {
  const [watchedAt, setWatchedAt] = useState(new Date().toISOString().split("T")[0]);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [review, setReview] = useState("");
  const [liked, setLiked] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      watched_at: watchedAt,
      rating,
      review: review.trim() || undefined,
      liked,
    });
    // Reset form
    setRating(undefined);
    setReview("");
    setLiked(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Log {movie.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Watched On</Label>
            <Input
              type="date"
              value={watchedAt}
              onChange={(e) => setWatchedAt(e.target.value)}
              className="bg-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? undefined : star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-colors",
                      (hoveredStar !== null ? star <= hoveredStar : star <= (rating || 0))
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className="p-1 ml-4"
              >
                <Heart
                  className={cn(
                    "w-6 h-6 transition-colors",
                    liked
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Review (optional)</Label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think?"
              className="bg-input"
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="letterboxd">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogMovieDialog;
