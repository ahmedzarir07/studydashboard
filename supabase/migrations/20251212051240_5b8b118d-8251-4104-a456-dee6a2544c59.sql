-- Create table for chapter completions
CREATE TABLE public.chapter_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject, chapter)
);

-- Create table for chapter resources
CREATE TABLE public.chapter_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject, chapter)
);

-- Enable RLS on both tables
ALTER TABLE public.chapter_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_resources ENABLE ROW LEVEL SECURITY;

-- RLS policies for chapter_completions
CREATE POLICY "Users can view their own completions"
ON public.chapter_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions"
ON public.chapter_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
ON public.chapter_completions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
ON public.chapter_completions FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for chapter_resources
CREATE POLICY "Users can view their own resources"
ON public.chapter_resources FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resources"
ON public.chapter_resources FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
ON public.chapter_resources FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
ON public.chapter_resources FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at on chapter_completions
CREATE TRIGGER update_chapter_completions_updated_at
BEFORE UPDATE ON public.chapter_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on chapter_resources
CREATE TRIGGER update_chapter_resources_updated_at
BEFORE UPDATE ON public.chapter_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();