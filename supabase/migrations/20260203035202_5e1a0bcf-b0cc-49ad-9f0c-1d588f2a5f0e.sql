-- Add unique constraint for study_records upsert operations
ALTER TABLE public.study_records 
ADD CONSTRAINT study_records_user_subject_chapter_activity_type_unique 
UNIQUE (user_id, subject, chapter, activity, type);