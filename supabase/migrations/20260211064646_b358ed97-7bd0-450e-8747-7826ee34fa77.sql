
-- Doubts table
CREATE TABLE public.doubts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT,
  question TEXT NOT NULL,
  image_url TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doubts" ON public.doubts FOR SELECT USING (true);
CREATE POLICY "Auth users can create doubts" ON public.doubts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own doubts" ON public.doubts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own doubts" ON public.doubts FOR DELETE USING (auth.uid() = user_id);

-- Answers table
CREATE TABLE public.doubt_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doubt_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view answers" ON public.doubt_answers FOR SELECT USING (true);
CREATE POLICY "Auth users can create answers" ON public.doubt_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON public.doubt_answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own answers" ON public.doubt_answers FOR DELETE USING (auth.uid() = user_id);

-- Votes table (one vote per user per answer)
CREATE TABLE public.doubt_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_id UUID NOT NULL REFERENCES public.doubt_answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

ALTER TABLE public.doubt_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.doubt_votes FOR SELECT USING (true);
CREATE POLICY "Auth users can vote" ON public.doubt_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON public.doubt_votes FOR DELETE USING (auth.uid() = user_id);

-- Reports table
CREATE TABLE public.doubt_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doubt_id UUID REFERENCES public.doubts(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.doubt_answers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'inappropriate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doubt_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can report" ON public.doubt_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view reports" ON public.doubt_reports FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_doubts_updated_at BEFORE UPDATE ON public.doubts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doubt_answers_updated_at BEFORE UPDATE ON public.doubt_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.doubts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doubt_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doubt_votes;
