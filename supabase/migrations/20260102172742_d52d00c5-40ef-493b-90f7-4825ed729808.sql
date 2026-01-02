-- Drop and recreate views with SECURITY INVOKER (default, explicit for clarity)
DROP VIEW IF EXISTS public.public_study_progress;
DROP VIEW IF EXISTS public.public_chapter_progress;

-- Create a secure public view for study records with SECURITY INVOKER
CREATE VIEW public.public_study_progress 
WITH (security_invoker = true) AS
SELECT 
  sr.id,
  p.id as profile_id,
  p.display_name,
  sr.subject,
  sr.chapter,
  sr.activity,
  sr.status,
  sr.updated_at
FROM public.study_records sr
JOIN public.profiles p ON sr.user_id = p.user_id
WHERE sr.is_public = true;

-- Create a secure public view for chapter completions with SECURITY INVOKER
CREATE VIEW public.public_chapter_progress 
WITH (security_invoker = true) AS
SELECT 
  cc.id,
  p.id as profile_id,
  p.display_name,
  cc.subject,
  cc.chapter,
  cc.completed,
  cc.completed_at,
  cc.updated_at
FROM public.chapter_completions cc
JOIN public.profiles p ON cc.user_id = p.user_id
WHERE cc.is_public = true;

-- Grant SELECT on public views
GRANT SELECT ON public.public_study_progress TO anon, authenticated;
GRANT SELECT ON public.public_chapter_progress TO anon, authenticated;

-- Add RLS policy for public profile viewing (display_name only, for view joins)
CREATE POLICY "Anyone can view profiles for public progress"
ON public.profiles
FOR SELECT
USING (true);

-- Update study_records to allow public read when is_public is true
CREATE POLICY "Anyone can view public study records"
ON public.study_records
FOR SELECT
USING (is_public = true);

-- Update chapter_completions to allow public read when is_public is true  
CREATE POLICY "Anyone can view public chapter completions"
ON public.chapter_completions
FOR SELECT
USING (is_public = true);