import { useState } from "react";
import { useMovieReviews, useTVReviews, getAvatarUrl, TMDBReview } from "@/hooks/useTMDBReviews";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ExternalLink, ChevronDown, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface TMDBReviewsSectionProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

const TMDBReviewCard = ({ review }: { review: TMDBReview }) => {
  const [expanded, setExpanded] = useState(false);
  const avatarUrl = getAvatarUrl(review.author_details.avatar_path);
  const isLongContent = review.content.length > 300;
  const displayContent = expanded ? review.content : review.content.slice(0, 300);

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={avatarUrl || undefined} alt={review.author} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {review.author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {review.author_details.name || review.author}
            </p>
            {review.author_details.username && (
              <p className="text-sm text-muted-foreground">
                @{review.author_details.username}
              </p>
            )}
          </div>
        </div>
        
        {review.author_details.rating && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">
              {review.author_details.rating}/10
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="text-foreground/80 leading-relaxed">
        <p className="whitespace-pre-line">
          {displayContent}
          {isLongContent && !expanded && '...'}
        </p>
        {isLongContent && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
          >
            {expanded ? 'Show less' : 'Read more'}
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
        </span>
        <a
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          View on TMDB
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

const TMDBReviewsSection = ({ mediaId, mediaType }: TMDBReviewsSectionProps) => {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = mediaType === 'movie' 
    ? useMovieReviews(mediaId) 
    : useTVReviews(mediaId);

  const reviews = data?.pages.flatMap(page => page.results) || [];
  const totalReviews = data?.pages[0]?.total_results || 0;

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Reviews from TMDB
          </h2>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Reviews from TMDB
        </h2>
        {totalReviews > 0 && (
          <span className="text-sm text-muted-foreground">
            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No TMDB reviews available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <TMDBReviewCard key={review.id} review={review} />
          ))}
          
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More Reviews'}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TMDBReviewsSection;
