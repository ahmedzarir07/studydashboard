-- Add is_public column to study_records
ALTER TABLE public.study_records 
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Add is_public column to chapter_completions
ALTER TABLE public.chapter_completions 
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Create a secure public view for study records (no sensitive data)
CREATE OR REPLACE VIEW public.public_study_progress AS
SELECT 
  sr.id,
  p.id as profile_id,
  sr.subject,
  sr.chapter,
  sr.activity,
  sr.status,
  sr.updated_at
FROM public.study_records sr
JOIN public.profiles p ON sr.user_id = p.user_id
WHERE sr.is_public = true;

-- Create a secure public view for chapter completions
CREATE OR REPLACE VIEW public.public_chapter_progress AS
SELECT 
  cc.id,
  p.id as profile_id,
  cc.subject,
  cc.chapter,
  cc.completed,
  cc.completed_at,
  cc.updated_at
FROM public.chapter_completions cc
JOIN public.profiles p ON cc.user_id = p.user_id
WHERE cc.is_public = true;

-- Add display_name to profiles for public display (instead of email)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text;

-- Grant SELECT on public views to anon and authenticated users
GRANT SELECT ON public.public_study_progress TO anon, authenticated;
GRANT SELECT ON public.public_chapter_progress TO anon, authenticated;