-- Allow anyone to view all study_records for Community leaderboard (full progress = same as Home)
-- Drop the restrictive RLS policies and add a single permissive policy for SELECT

-- First drop the old SELECT policies
DROP POLICY IF EXISTS "Anyone can view public study records" ON public.study_records;
DROP POLICY IF EXISTS "Users can view their own records" ON public.study_records;
DROP POLICY IF EXISTS "Admins can view all study records" ON public.study_records;

-- Create a single permissive SELECT policy that allows anyone to read all records
CREATE POLICY "Anyone can view all study records"
ON public.study_records
FOR SELECT
USING (true);