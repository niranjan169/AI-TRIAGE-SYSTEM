-- 🗑️ FRESH START - DELETE EVERYTHING AND START CLEAN
-- Run this FIRST to delete all old tables
-- Then run COMPLETE_SETUP.sql
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql

-- Drop all tables (this will delete all data!)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS reset_daily_appointments();
DROP FUNCTION IF EXISTS get_available_doctor(TEXT, DATE, TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Success message
SELECT '✅ All tables deleted! Now run COMPLETE_SETUP.sql to create fresh tables.' as status;
