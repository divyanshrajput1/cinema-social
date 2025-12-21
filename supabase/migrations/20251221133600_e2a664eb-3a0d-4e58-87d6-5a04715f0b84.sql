-- Add media_type column to diary table
ALTER TABLE public.diary 
ADD COLUMN media_type text NOT NULL DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv'));

-- Add media_type column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN media_type text NOT NULL DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv'));

-- Add media_type column to watchlist table
ALTER TABLE public.watchlist 
ADD COLUMN media_type text NOT NULL DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv'));

-- Create indexes for better query performance
CREATE INDEX idx_diary_media_type ON public.diary(media_type);
CREATE INDEX idx_reviews_media_type ON public.reviews(media_type);
CREATE INDEX idx_watchlist_media_type ON public.watchlist(media_type);

-- Update unique constraint for diary to include media_type
DROP INDEX IF EXISTS diary_user_id_tmdb_id_idx;
CREATE UNIQUE INDEX diary_user_tmdb_media_idx ON public.diary(user_id, tmdb_id, media_type);

-- Update unique constraint for reviews to include media_type
DROP INDEX IF EXISTS reviews_user_id_tmdb_id_idx;
CREATE UNIQUE INDEX reviews_user_tmdb_media_idx ON public.reviews(user_id, tmdb_id, media_type);

-- Update unique constraint for watchlist to include media_type
DROP INDEX IF EXISTS watchlist_user_id_tmdb_id_idx;
CREATE UNIQUE INDEX watchlist_user_tmdb_media_idx ON public.watchlist(user_id, tmdb_id, media_type);