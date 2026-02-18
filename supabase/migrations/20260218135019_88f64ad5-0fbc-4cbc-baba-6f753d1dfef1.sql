
-- Add image_url to doubt_answers
ALTER TABLE public.doubt_answers ADD COLUMN image_url text;

-- Create doubt_likes table
CREATE TABLE public.doubt_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doubt_id uuid NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(doubt_id, user_id)
);

ALTER TABLE public.doubt_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.doubt_likes FOR SELECT USING (true);
CREATE POLICY "Auth users can like" ON public.doubt_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own like" ON public.doubt_likes FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.doubt_likes;
