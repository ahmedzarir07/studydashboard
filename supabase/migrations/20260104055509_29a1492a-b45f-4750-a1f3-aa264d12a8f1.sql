-- Update public_study_progress view to include user_id
DROP VIEW IF EXISTS public_study_progress;

CREATE VIEW public_study_progress AS
SELECT 
  sr.id,
  sr.user_id,
  p.id as profile_id,
  p.display_name,
  sr.subject,
  sr.chapter,
  sr.activity,
  sr.status,
  sr.updated_at
FROM study_records sr
JOIN profiles p ON sr.user_id = p.user_id
WHERE sr.is_public = true;