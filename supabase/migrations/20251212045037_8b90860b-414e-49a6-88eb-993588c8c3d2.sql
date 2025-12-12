-- Create study_records table for tracking user progress
CREATE TABLE public.study_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  activity TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('status', 'class_number')),
  status TEXT CHECK (status IN ('Done', 'In progress', 'Not Started', '')),
  class_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject, chapter, activity)
);

-- Enable Row Level Security
ALTER TABLE public.study_records ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own records
CREATE POLICY "Users can view their own records"
ON public.study_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own records"
ON public.study_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
ON public.study_records
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
ON public.study_records
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_study_records_updated_at
BEFORE UPDATE ON public.study_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_records;