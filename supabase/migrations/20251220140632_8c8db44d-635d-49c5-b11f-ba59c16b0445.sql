-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tmdb_id)
);

-- Create review_likes table
CREATE TABLE public.review_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_id)
);

-- Create review_comments table
CREATE TABLE public.review_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Review likes policies
CREATE POLICY "Anyone can view likes" ON public.review_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like reviews" ON public.review_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike reviews" ON public.review_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Review comments policies
CREATE POLICY "Anyone can view comments" ON public.review_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.review_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.review_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.review_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at on reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on review_comments
CREATE TRIGGER update_review_comments_updated_at
  BEFORE UPDATE ON public.review_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();