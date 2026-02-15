-- 🏥 COMPLETE HOSPITAL SYSTEM - DOCTORS & SCHEDULING
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lkgxijbsdspuygatamdq/editor/sql

-- 1. Create doctors table with specializations
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BUSY', 'ON_CALL', 'OFFLINE')),
  is_backup BOOLEAN DEFAULT false,
  max_appointments_per_day INTEGER DEFAULT 10,
  current_appointments_today INTEGER DEFAULT 0,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add doctor_id to appointments table if not exists
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id),
ADD COLUMN IF NOT EXISTS estimated_time TEXT,
ADD COLUMN IF NOT EXISTS queue_position INTEGER,
ADD COLUMN IF NOT EXISTS waiting_time_minutes INTEGER DEFAULT 0;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_backup ON doctors(is_backup);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);

-- 4. Insert doctors with specializations
INSERT INTO doctors (name, specialization, department, status, is_backup, max_appointments_per_day) VALUES
-- Emergency Department (High Risk)
('Dr. Sarah Johnson', 'Emergency Medicine', 'Emergency Department', 'AVAILABLE', false, 10),
('Dr. Michael Chen', 'Emergency Medicine', 'Emergency Department', 'AVAILABLE', false, 10),
('Dr. Emily Rodriguez', 'Emergency Medicine', 'Emergency Department', 'AVAILABLE', false, 10),
('Dr. James Wilson', 'Emergency Medicine', 'Emergency Department', 'ON_CALL', true, 15), -- Backup

-- Cardiology (Chest Pain, Heart Issues)
('Dr. Robert Anderson', 'Cardiology', 'Cardiology', 'AVAILABLE', false, 10),
('Dr. Lisa Thompson', 'Cardiology', 'Cardiology', 'AVAILABLE', false, 10),
('Dr. David Martinez', 'Cardiology', 'Cardiology', 'AVAILABLE', false, 10),
('Dr. Jennifer Lee', 'Cardiology', 'Cardiology', 'ON_CALL', true, 15), -- Backup

-- Neurology (Head Injury, Stroke, Confusion)
('Dr. William Brown', 'Neurology', 'Neurology', 'AVAILABLE', false, 10),
('Dr. Amanda Davis', 'Neurology', 'Neurology', 'AVAILABLE', false, 10),
('Dr. Christopher Taylor', 'Neurology', 'Neurology', 'AVAILABLE', false, 10),
('Dr. Michelle Garcia', 'Neurology', 'Neurology', 'ON_CALL', true, 15), -- Backup

-- General Medicine (Low-Medium Risk)
('Dr. Daniel White', 'General Practice', 'General Practice', 'AVAILABLE', false, 10),
('Dr. Jessica Harris', 'General Practice', 'General Practice', 'AVAILABLE', false, 10),
('Dr. Matthew Clark', 'General Practice', 'General Practice', 'AVAILABLE', false, 10),
('Dr. Rachel Lewis', 'General Practice', 'General Practice', 'ON_CALL', true, 15), -- Backup

-- Urgent Care (Medium Risk)
('Dr. Andrew Walker', 'Urgent Care', 'Urgent Care', 'AVAILABLE', false, 10),
('Dr. Nicole Hall', 'Urgent Care', 'Urgent Care', 'AVAILABLE', false, 10),
('Dr. Kevin Allen', 'Urgent Care', 'Urgent Care', 'AVAILABLE', false, 10),
('Dr. Stephanie Young', 'Urgent Care', 'Urgent Care', 'ON_CALL', true, 15) -- Backup
ON CONFLICT DO NOTHING;

-- 5. Create function to reset daily appointment counts
CREATE OR REPLACE FUNCTION reset_daily_appointments()
RETURNS void AS $$
BEGIN
  UPDATE doctors SET current_appointments_today = 0;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get available doctor
CREATE OR REPLACE FUNCTION get_available_doctor(
  p_department TEXT,
  p_appointment_date DATE,
  p_risk_level TEXT
)
RETURNS UUID AS $$
DECLARE
  v_doctor_id UUID;
BEGIN
  -- Try to find available doctor (not backup) with capacity
  SELECT id INTO v_doctor_id
  FROM doctors
  WHERE department = p_department
    AND is_backup = false
    AND status IN ('AVAILABLE', 'ON_CALL')
    AND current_appointments_today < max_appointments_per_day
  ORDER BY 
    CASE WHEN status = 'AVAILABLE' THEN 0 ELSE 1 END,
    current_appointments_today ASC
  LIMIT 1;

  -- If no regular doctor available, try backup
  IF v_doctor_id IS NULL THEN
    SELECT id INTO v_doctor_id
    FROM doctors
    WHERE department = p_department
      AND is_backup = true
      AND status IN ('AVAILABLE', 'ON_CALL')
      AND current_appointments_today < max_appointments_per_day
    ORDER BY current_appointments_today ASC
    LIMIT 1;
  END IF;

  -- Update doctor's appointment count
  IF v_doctor_id IS NOT NULL THEN
    UPDATE doctors 
    SET current_appointments_today = current_appointments_today + 1,
        status = CASE 
          WHEN current_appointments_today + 1 >= max_appointments_per_day THEN 'BUSY'
          ELSE status
        END
    WHERE id = v_doctor_id;
  END IF;

  RETURN v_doctor_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Disable RLS for demo
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;

-- 8. Verify setup
SELECT 
  specialization,
  department,
  COUNT(*) as total_doctors,
  COUNT(*) FILTER (WHERE is_backup = false) as regular_doctors,
  COUNT(*) FILTER (WHERE is_backup = true) as backup_doctors
FROM doctors
GROUP BY specialization, department
ORDER BY department;

-- Success message
SELECT '✅ Hospital system created! 20 doctors added with specializations and backup system.' as status;
