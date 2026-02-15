# Supabase Database Schema

## Tables

### assessments
```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
```

### appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
```

## Storage Buckets

### medical-documents
- Public bucket for storing patient medical documents
- Accepts: PDF, JPG, JPEG, PNG files
- Path structure: `{patient_id}/{timestamp}.{extension}`

## Indexes

```sql
-- For faster patient queries
CREATE INDEX idx_assessments_patient_id ON assessments(patient_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);

-- For queue management
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_priority ON appointments(priority_score DESC);
CREATE INDEX idx_appointments_created ON appointments(created_at);
```

## Row Level Security (RLS)

Since no authentication is required, you can disable RLS or set permissive policies:

```sql
-- Disable RLS for public access (development only)
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- OR create permissive policies for production
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON assessments FOR ALL USING (true);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON appointments FOR ALL USING (true);
```

## Realtime

Enable realtime for the appointments table:

```sql
-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
```

## Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the table creation scripts above
3. Go to Storage and create a bucket named `medical-documents`
4. Set the bucket to public
5. Copy your project URL and anon key
6. Create a `.env` file in the project root with:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
