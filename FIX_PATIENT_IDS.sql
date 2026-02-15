-- ⚡ FIX EXISTING APPOINTMENTS - UPDATE PATIENT IDs TO EMAILS
-- This updates old appointments that have random patient IDs to use user emails instead
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql

-- First, let's see what we have
SELECT 
  id,
  patient_id,
  patient_name,
  appointment_date,
  status
FROM appointments
ORDER BY created_at DESC
LIMIT 10;

-- If you see patient_id like "patient_1234567890", we need to fix them
-- We'll update them to use emails based on the patient_name

-- Option 1: If you want to DELETE all old appointments and start fresh
-- UNCOMMENT the line below to delete all appointments
-- DELETE FROM appointments;
-- DELETE FROM assessments;

-- Option 2: Update existing appointments to use demo emails
-- This assumes you have users with these emails in the users table

-- Update appointments for "Demo Patient" to use patient@demo.com
UPDATE appointments
SET patient_id = 'patient@demo.com'
WHERE patient_name = 'Demo Patient'
  AND patient_id LIKE 'patient_%';

-- Update appointments for "Demo Admin" to use admin@demo.com  
UPDATE appointments
SET patient_id = 'admin@demo.com'
WHERE patient_name = 'Demo Admin'
  AND patient_id LIKE 'patient_%';

-- Update assessments for "Demo Patient"
UPDATE assessments
SET patient_id = 'patient@demo.com'
WHERE patient_name = 'Demo Patient'
  AND patient_id LIKE 'patient_%';

-- Update assessments for "Demo Admin"
UPDATE assessments
SET patient_id = 'admin@demo.com'
WHERE patient_name = 'Demo Admin'
  AND patient_id LIKE 'patient_%';

-- Verify the updates
SELECT 
  'appointments' as table_name,
  patient_id,
  patient_name,
  COUNT(*) as count
FROM appointments
GROUP BY patient_id, patient_name
ORDER BY patient_id;

SELECT 
  'assessments' as table_name,
  patient_id,
  patient_name,
  COUNT(*) as count
FROM assessments
GROUP BY patient_id, patient_name
ORDER BY patient_id;

-- Success message
SELECT '✅ Patient IDs updated! Now appointments are linked to user emails.' as status;
