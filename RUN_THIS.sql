-- ⚡ COPY THIS ENTIRE CODE AND RUN IN SUPABASE SQL EDITOR
-- Link: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql

-- Drop existing tables if they exist (clean start)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;

-- Create assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  symptoms TEXT[],
  vitals JSONB,
  medical_history TEXT,
  risk_level TEXT,
  risk_score INTEGER,
  department TEXT,
  confidence INTEGER,
  reasoning TEXT,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  assessment_id UUID REFERENCES assessments(id),
  patient_name TEXT NOT NULL,
  appointment_date DATE,
  appointment_slot TEXT,
  time_range TEXT,
  department TEXT,
  risk_level TEXT,
  priority_score INTEGER,
  doctor_id TEXT,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_assessments_patient ON assessments(patient_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Disable RLS for demo (allow all access)
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Success message
SELECT 'Database setup complete! ✅' as message;
