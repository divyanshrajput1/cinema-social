-- Fix 1: Add restrictive policies to user_roles table to prevent privilege escalation
-- Only SECURITY DEFINER functions (like handle_new_user) should be able to modify roles

CREATE POLICY "Prevent direct role insertions" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Prevent direct role updates" 
ON public.user_roles 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent direct role deletions" 
ON public.user_roles 
FOR DELETE 
USING (false);

-- Fix 2: Add character limits to user-generated content columns to prevent storage DoS

-- Profiles table limits
ALTER TABLE public.profiles 
ALTER COLUMN bio TYPE VARCHAR(1000);

ALTER TABLE public.profiles 
ALTER COLUMN display_name TYPE VARCHAR(100);

ALTER TABLE public.profiles 
ALTER COLUMN username TYPE VARCHAR(50);

-- Reviews table limit
ALTER TABLE public.reviews 
ALTER COLUMN content TYPE VARCHAR(10000);

-- Review comments limit
ALTER TABLE public.review_comments 
ALTER COLUMN content TYPE VARCHAR(2000);

-- Diary review limit
ALTER TABLE public.diary 
ALTER COLUMN review TYPE VARCHAR(5000);

-- Diary title limit
ALTER TABLE public.diary 
ALTER COLUMN title TYPE VARCHAR(500);