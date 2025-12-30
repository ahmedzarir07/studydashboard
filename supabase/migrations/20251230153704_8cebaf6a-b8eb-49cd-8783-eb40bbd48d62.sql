-- Create table for monthly study plans
CREATE TABLE public.monthly_study_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_year TEXT NOT NULL, -- Format: "2025-01"
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  planned_activities TEXT[] NOT NULL DEFAULT '{}', -- Array of activity names
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year, subject, chapter)
);

-- Enable Row Level Security
ALTER TABLE public.monthly_study_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own plans" 
ON public.monthly_study_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans" 
ON public.monthly_study_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
ON public.monthly_study_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" 
ON public.monthly_study_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_monthly_study_plans_updated_at
BEFORE UPDATE ON public.monthly_study_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_monthly_study_plans_user_month ON public.monthly_study_plans(user_id, month_year);