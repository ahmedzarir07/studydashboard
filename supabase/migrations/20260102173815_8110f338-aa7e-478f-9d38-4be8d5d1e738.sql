-- Change default for is_public to true on study_records
ALTER TABLE public.study_records ALTER COLUMN is_public SET DEFAULT true;

-- Change default for is_public to true on chapter_completions
ALTER TABLE public.chapter_completions ALTER COLUMN is_public SET DEFAULT true;

-- Update existing records to be public by default
UPDATE public.study_records SET is_public = true WHERE is_public = false;
UPDATE public.chapter_completions SET is_public = true WHERE is_public = false;