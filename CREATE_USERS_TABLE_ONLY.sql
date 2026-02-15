-- 👤 CREATE USERS TABLE ONLY
-- Run this if you only need to add the users table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert demo users
INSERT INTO users (email, password, name, role) VALUES
('patient@demo.com', 'password123', 'Demo Patient', 'patient'),
('admin@demo.com', 'admin123', 'Demo Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT * FROM users;

SELECT '✅ Users table created! Demo accounts ready.' as status;
