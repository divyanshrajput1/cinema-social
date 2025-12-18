import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  readonly = false,
  size = "md" 
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = (hoverRating || rating) >= index;
        const isHalf = !isFilled && (hoverRating || rating) >= index - 0.5;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => !readonly && setHoverRating(index)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className={cn(
              "transition-all duration-150",
              !readonly && "hover:scale-110 cursor-pointer animate-star-pulse",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizes[size],
                "transition-colors duration-150",
                isFilled 
                  ? "text-primary fill-primary star-glow" 
                  : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
