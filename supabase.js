import { createClient } from '@supabase/supabase-js';

// ✅ Supabase Project Credentials

const supabaseUrl = 'https://lkgxijbsdspuygatamdq.supabase.co';

// 👉 Paste your ANON PUBLIC KEY below
// It must start with "eyJ..."
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZ3hpamJzZHNwdXlnYXRhbWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTU5NTMsImV4cCI6MjA4NjYzMTk1M30.0ysZARlFnbHKuIUJaOmsLmma7mf_5E327LnXlaePZwg';

// Validate credentials
const hasValidCredentials =
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey.startsWith('eyJ');

// Create client only if valid
export const supabase = hasValidCredentials
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Storage bucket
export const MEDICAL_DOCUMENTS_BUCKET = 'medical-documents';

// Demo mode
export const IS_DEMO_MODE = !hasValidCredentials;

// Status log
if (IS_DEMO_MODE) {
    console.log('🎮 DEMO MODE ACTIVE — using local memory');
} else {
    console.log('✅ Supabase database connected');
}
