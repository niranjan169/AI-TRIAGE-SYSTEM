-- ⚡ QUICK SETUP - Copy and paste this entire file into Supabase SQL Editor

-- 1. Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  symptoms TEXT[] NOT NULL,
  vitals JSONB,
  medical_history TEXT,
  risk_level TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  department TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  reasoning TEXT NOT NULL,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  assessment_id UUID REFERENCES assessments(id),
  patient_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_slot TEXT NOT NULL,
  time_range TEXT NOT NULL,
  department TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  priority_score INTEGER NOT NULL,
  doctor_id TEXT,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_patient_id ON assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created ON assessments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_priority ON appointments(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments(created_at DESC);

-- 4. Enable Row Level Security (RLS) with permissive policies for demo
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for demo (in production, add proper auth)
CREATE POLICY IF NOT EXISTS "Allow all operations on assessments" 
  ON assessments FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on appointments" 
  ON appointments FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 5. Enable Realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- ✅ Done! Now create the storage bucket in the next step.
