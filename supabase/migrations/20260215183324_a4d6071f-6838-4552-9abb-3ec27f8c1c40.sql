
CREATE TABLE public.ai_chat_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  current_class text,
  student_name text,
  weak_subjects text[] DEFAULT '{}'::text[],
  college_name text,
  study_hours text,
  main_goal text,
  help_type text[] DEFAULT '{}'::text[],
  preferred_language text,
  biggest_problem text,
  ai_expectation text[] DEFAULT '{}'::text[],
  student_level text,
  ai_behavior text,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.ai_chat_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON public.ai_chat_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own preferences" ON public.ai_chat_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.ai_chat_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_ai_chat_preferences_updated_at
BEFORE UPDATE ON public.ai_chat_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
