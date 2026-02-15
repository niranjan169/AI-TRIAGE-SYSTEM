-- ⚡ FIXED SQL - RUN THIS IN SUPABASE SQL EDITOR
-- This will fix the "age column not found" error
-- Link: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql

-- Drop existing tables completely
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;

-- Create assessments table with ALL required columns
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  age INTEGER,                    -- ✅ This was missing!
  gender TEXT,                    -- ✅ This was missing!
  symptoms TEXT[] NOT NULL,
  vitals JSONB,
  medical_history TEXT,
  risk_level TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  department TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  reasoning TEXT NOT NULL,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table with ALL required columns
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_slot TEXT NOT NULL,
  time_range TEXT NOT NULL,
  department TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  priority_score INTEGER NOT NULL,
  doctor_id TEXT,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_assessments_patient_id ON assessments(patient_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_priority ON appointments(priority_score DESC);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);

-- Disable RLS for demo (allows all operations)
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Enable realtime for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Verify tables were created
SELECT 
  'assessments' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'assessments'
ORDER BY ordinal_position;

SELECT 
  'appointments' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Database setup complete! All columns created correctly.' as status;
