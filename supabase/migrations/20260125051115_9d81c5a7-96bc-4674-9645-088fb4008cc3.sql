-- Add new profile fields for comprehensive student profile
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS study_type TEXT DEFAULT 'hsc',
ADD COLUMN IF NOT EXISTS group_name TEXT DEFAULT 'science',
ADD COLUMN IF NOT EXISTS batch TEXT,
ADD COLUMN IF NOT EXISTS board_roll TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS board_name TEXT,
ADD COLUMN IF NOT EXISTS passing_year INTEGER,
ADD COLUMN IF NOT EXISTS optional_subjects TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_linked BOOLEAN DEFAULT false;

-- Add constraint for gender values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_gender_check CHECK (gender IN ('male', 'female', 'other') OR gender IS NULL);

-- Add constraint for study_type values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_study_type_check CHECK (study_type IN ('hsc', 'admission') OR study_type IS NULL);

-- Add constraint for group_name values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_group_name_check CHECK (group_name IN ('science', 'arts', 'commerce') OR group_name IS NULL);