-- 🔧 FIX DOCTORS TABLE - ADD MISSING COLUMNS
-- Run this FIRST if you get "specialization does not exist" error
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql

-- Option 1: Add missing columns to existing table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS is_backup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_appointments_per_day INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS current_appointments_today INTEGER DEFAULT 0;

-- Update existing doctors to have specialization based on department
UPDATE doctors
SET specialization = department
WHERE specialization IS NULL;

-- Make specialization NOT NULL
ALTER TABLE doctors 
ALTER COLUMN specialization SET NOT NULL;

-- Verify
SELECT * FROM doctors LIMIT 5;

SELECT '✅ Doctors table fixed! Now run COMPLETE_SETUP.sql again.' as status;
