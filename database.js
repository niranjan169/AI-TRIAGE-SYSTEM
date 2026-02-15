import { supabase, MEDICAL_DOCUMENTS_BUCKET, IS_DEMO_MODE } from '../lib/supabase';

// Mock data storage for demo mode
const mockStorage = {
    assessments: [],
    appointments: []
};

// Assessment operations
export const saveAssessment = async (assessmentData) => {
    if (IS_DEMO_MODE) {
        const mockAssessment = {
            id: `mock_${Date.now()}`,
            ...assessmentData,
            created_at: new Date().toISOString()
        };
        mockStorage.assessments.push(mockAssessment);
        return mockAssessment;
    }

    const { data, error } = await supabase
        .from('assessments')
        .insert([assessmentData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getPatientAssessments = async (patientId) => {
    if (IS_DEMO_MODE) {
        return mockStorage.assessments.filter(a => a.patient_id === patientId);
    }

    const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// Appointment operations
export const createAppointment = async (appointmentData) => {
    if (IS_DEMO_MODE) {
        const mockAppointment = {
            id: `mock_${Date.now()}`,
            ...appointmentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockStorage.appointments.push(mockAppointment);
        return mockAppointment;
    }

    const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getAppointments = async (filters = {}) => {
    console.log('🔍 getAppointments called with filters:', filters);

    if (IS_DEMO_MODE) {
        console.log('🎮 DEMO MODE: Using mock storage');
        let results = [...mockStorage.appointments];
        console.log('📦 Total mock appointments:', results.length);

        if (filters.patientId) {
            console.log('🔎 Filtering by patient_id:', filters.patientId);
            results = results.filter(a => {
                const matches = a.patient_id === filters.patientId;
                console.log(`  - Appointment ${a.id}: patient_id="${a.patient_id}" matches=${matches}`);
                return matches;
            });
            console.log('✅ Filtered results:', results.length);
        }

        if (filters.status) {
            results = results.filter(a => a.status === filters.status);
        }

        // Add mock assessments data
        results = results.map(apt => ({
            ...apt,
            assessments: mockStorage.assessments.find(a => a.id === apt.assessment_id) || null
        }));

        console.log('📋 Returning appointments:', results.length);
        return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    console.log('🗄️ DATABASE MODE: Querying Supabase');
    let query = supabase
        .from('appointments')
        .select('*, assessments(*)');

    if (filters.patientId) {
        console.log('🔎 Adding patient_id filter:', filters.patientId);
        query = query.eq('patient_id', filters.patientId);
    }

    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('❌ Database error:', error);
        throw error;
    }

    console.log('✅ Database returned appointments:', data?.length);
    return data;
};

export const updateAppointment = async (id, updates) => {
    if (IS_DEMO_MODE) {
        const index = mockStorage.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            mockStorage.appointments[index] = {
                ...mockStorage.appointments[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            return mockStorage.appointments[index];
        }
        return null;
    }

    const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const cancelAppointment = async (id) => {
    return updateAppointment(id, { status: 'cancelled' });
};

export const completeAppointment = async (id) => {
    return updateAppointment(id, { status: 'completed', completed_at: new Date().toISOString() });
};

// Queue operations
export const getActiveQueue = async () => {
    if (IS_DEMO_MODE) {
        const activeAppointments = mockStorage.appointments.filter(
            a => a.status === 'pending' || a.status === 'in-progress'
        );

        return activeAppointments.map(apt => ({
            ...apt,
            assessments: mockStorage.assessments.find(a => a.id === apt.assessment_id) || null
        })).sort((a, b) => b.priority_score - a.priority_score);
    }

    const { data, error } = await supabase
        .from('appointments')
        .select('*, assessments(*)')
        .in('status', ['pending', 'in-progress'])
        .order('priority_score', { ascending: false });

    if (error) throw error;
    return data;
};

// File upload to Supabase Storage
export const uploadMedicalDocument = async (file, patientId) => {
    if (IS_DEMO_MODE) {
        // In demo mode, just return a mock URL
        console.log('📄 Demo Mode: File would be uploaded:', file.name);
        return {
            path: `demo/${patientId}/${file.name}`,
            url: `https://demo.supabase.co/storage/v1/object/public/medical-documents/demo/${patientId}/${file.name}`
        };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from(MEDICAL_DOCUMENTS_BUCKET)
        .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(MEDICAL_DOCUMENTS_BUCKET)
        .getPublicUrl(fileName);

    return { path: fileName, url: publicUrl };
};

// Realtime subscription for queue updates
export const subscribeToQueue = (callback) => {
    if (IS_DEMO_MODE) {
        // In demo mode, simulate updates every 30 seconds
        const interval = setInterval(() => {
            callback({ eventType: 'UPDATE' });
        }, 30000);

        return {
            unsubscribe: () => clearInterval(interval)
        };
    }

    return supabase
        .channel('appointments-queue')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'appointments' },
            callback
        )
        .subscribe();
};
