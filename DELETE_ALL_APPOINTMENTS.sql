-- ⚡ EMERGENCY FIX - DELETE ALL APPOINTMENTS AND START FRESH
-- This will delete ALL appointments and assessments from the database
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql

-- WARNING: This will delete ALL data. You'll need to create new appointments after this.

-- Step 1: Delete all appointments
DELETE FROM appointments;

-- Step 2: Delete all assessments
DELETE FROM assessments;

-- Step 3: Verify deletion
SELECT COUNT(*) as appointments_count FROM appointments;
SELECT COUNT(*) as assessments_count FROM assessments;

-- Success message
SELECT '✅ All old data deleted! Now create new appointments and they will be linked to your email.' as status;

-- After running this:
-- 1. Refresh your app
-- 2. Login as: tmniranjan06@gmail.com
-- 3. Create NEW assessment
-- 4. It will save with patient_id = "tmniranjan06@gmail.com"
-- 5. You'll see ONLY your appointments
