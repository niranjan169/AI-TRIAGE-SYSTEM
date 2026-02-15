-- ⚡ USER AUTHENTICATION TABLES FOR SUPABASE
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- In production, this should be hashed!
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Disable RLS for demo (allow all operations)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some demo users (optional)
INSERT INTO users (email, password, name, role) VALUES
  ('patient@demo.com', 'patient123', 'Demo Patient', 'patient'),
  ('admin@demo.com', 'admin123', 'Demo Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Verify table was created
SELECT 
  'users' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Users table created successfully! Demo accounts added.' as status;
