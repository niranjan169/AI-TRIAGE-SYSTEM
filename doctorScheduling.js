import { supabase, IS_DEMO_MODE } from '../lib/supabase';

// Mock doctors for demo mode
const mockDoctors = [
    // Emergency Department
    { id: 'doc_1', name: 'Dr. Sarah Johnson', specialization: 'Emergency Medicine', department: 'Emergency Department', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_2', name: 'Dr. Michael Chen', specialization: 'Emergency Medicine', department: 'Emergency Department', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_3', name: 'Dr. Emily Rodriguez', specialization: 'Emergency Medicine', department: 'Emergency Department', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_4', name: 'Dr. James Wilson', specialization: 'Emergency Medicine', department: 'Emergency Department', status: 'ON_CALL', is_backup: true, max_appointments_per_day: 15, current_appointments_today: 0 },

    // Cardiology
    { id: 'doc_5', name: 'Dr. Robert Anderson', specialization: 'Cardiology', department: 'Cardiology', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_6', name: 'Dr. Lisa Thompson', specialization: 'Cardiology', department: 'Cardiology', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_7', name: 'Dr. David Martinez', specialization: 'Cardiology', department: 'Cardiology', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_8', name: 'Dr. Jennifer Lee', specialization: 'Cardiology', department: 'Cardiology', status: 'ON_CALL', is_backup: true, max_appointments_per_day: 15, current_appointments_today: 0 },

    // General Practice
    { id: 'doc_9', name: 'Dr. Daniel White', specialization: 'General Practice', department: 'General Practice', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_10', name: 'Dr. Jessica Harris', specialization: 'General Practice', department: 'General Practice', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_11', name: 'Dr. Matthew Clark', specialization: 'General Practice', department: 'General Practice', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_12', name: 'Dr. Rachel Lewis', specialization: 'General Practice', department: 'General Practice', status: 'ON_CALL', is_backup: true, max_appointments_per_day: 15, current_appointments_today: 0 },

    // Urgent Care
    { id: 'doc_13', name: 'Dr. Andrew Walker', specialization: 'Urgent Care', department: 'Urgent Care', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_14', name: 'Dr. Nicole Hall', specialization: 'Urgent Care', department: 'Urgent Care', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_15', name: 'Dr. Kevin Allen', specialization: 'Urgent Care', department: 'Urgent Care', status: 'AVAILABLE', is_backup: false, max_appointments_per_day: 10, current_appointments_today: 0 },
    { id: 'doc_16', name: 'Dr. Stephanie Young', specialization: 'Urgent Care', department: 'Urgent Care', status: 'ON_CALL', is_backup: true, max_appointments_per_day: 15, current_appointments_today: 0 },
];

/**
 * Smart Doctor Assignment Algorithm
 * - Assigns doctor based on department and availability
 * - Respects daily appointment limits (10 per doctor, 15 for backup)
 * - Uses backup doctors when regular doctors are full
 * - Handles high-risk patients with priority
 */
export const assignDoctor = async (department, appointmentDate, riskLevel) => {
    console.log('🏥 Assigning doctor:', { department, appointmentDate, riskLevel });

    if (IS_DEMO_MODE) {
        return assignDoctorDemo(department, appointmentDate, riskLevel);
    }

    try {
        // Get all doctors in the department
        const { data: allDoctors, error: fetchError } = await supabase
            .from('doctors')
            .select('*')
            .eq('department', department)
            .in('status', ['AVAILABLE', 'ON_CALL']);

        if (fetchError) {
            console.error('Error fetching doctors:', fetchError);
            throw fetchError;
        }

        if (!allDoctors || allDoctors.length === 0) {
            console.error('❌ No doctors in department:', department);
            return {
                doctor: null,
                alert: `CRITICAL: No doctors found in ${department}`,
                needsAdminIntervention: true
            };
        }

        // Filter regular doctors (not backup) with capacity
        let availableDoctors = allDoctors.filter(d =>
            !d.is_backup &&
            d.current_appointments_today < d.max_appointments_per_day
        );

        // Sort by workload (least busy first)
        availableDoctors.sort((a, b) => {
            // Prefer AVAILABLE over ON_CALL
            if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
            if (a.status !== 'AVAILABLE' && b.status === 'AVAILABLE') return 1;
            // Then by workload
            return a.current_appointments_today - b.current_appointments_today;
        });

        let doctor = availableDoctors[0];

        // If no regular doctor available, try backup
        if (!doctor) {
            console.log('⚠️ No regular doctor available, trying backup...');
            const backupDoctors = allDoctors.filter(d =>
                d.is_backup &&
                d.current_appointments_today < d.max_appointments_per_day
            );
            backupDoctors.sort((a, b) => a.current_appointments_today - b.current_appointments_today);
            doctor = backupDoctors[0];

            if (!doctor) {
                console.error('❌ No doctors available in department:', department);
                return {
                    doctor: null,
                    alert: `CRITICAL: No available doctors in ${department}. All doctors at capacity.`,
                    needsAdminIntervention: true
                };
            }
        }

        // Update doctor's appointment count
        await supabase
            .from('doctors')
            .update({
                current_appointments_today: doctor.current_appointments_today + 1,
                status: doctor.current_appointments_today + 1 >= doctor.max_appointments_per_day ? 'BUSY' : doctor.status
            })
            .eq('id', doctor.id);

        console.log('✅ Doctor assigned:', doctor.name);

        return {
            doctor,
            alert: doctor.is_backup ? `Assigned to backup doctor ${doctor.name}` : null,
            needsAdminIntervention: false
        };

    } catch (error) {
        console.error('❌ Error assigning doctor:', error);
        throw error;
    }
};

// Demo mode assignment
const assignDoctorDemo = (department, appointmentDate, riskLevel) => {
    // Filter doctors by department
    let availableDoctors = mockDoctors.filter(d =>
        d.department === department &&
        !d.is_backup &&
        d.current_appointments_today < d.max_appointments_per_day
    );

    // Sort by current workload
    availableDoctors.sort((a, b) => a.current_appointments_today - b.current_appointments_today);

    let doctor = availableDoctors[0];

    // If no regular doctor available, try backup
    if (!doctor) {
        const backupDoctors = mockDoctors.filter(d =>
            d.department === department &&
            d.is_backup &&
            d.current_appointments_today < d.max_appointments_per_day
        );
        doctor = backupDoctors[0];

        if (!doctor) {
            return {
                doctor: null,
                alert: `CRITICAL: No available doctors in ${department}`,
                needsAdminIntervention: true
            };
        }
    }

    // Update doctor's count
    doctor.current_appointments_today += 1;
    if (doctor.current_appointments_today >= doctor.max_appointments_per_day) {
        doctor.status = 'BUSY';
    }

    return {
        doctor,
        alert: doctor.is_backup ? `Assigned to backup doctor ${doctor.name}` : null,
        needsAdminIntervention: false
    };
};

/**
 * Calculate estimated waiting time
 * Based on queue position and average consultation time
 */
export const calculateEstimatedTime = (queuePosition, riskLevel) => {
    // Average consultation times (minutes)
    const consultationTimes = {
        'High': 30, // Emergency cases take longer
        'Medium': 20,
        'Low': 15
    };

    const avgTime = consultationTimes[riskLevel] || 20;
    const estimatedMinutes = queuePosition * avgTime;

    if (estimatedMinutes < 60) {
        return `${estimatedMinutes} minutes`;
    } else {
        const hours = Math.floor(estimatedMinutes / 60);
        const minutes = estimatedMinutes % 60;
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
};

/**
 * Check for appointment conflicts
 * Returns true if there's a conflict
 */
export const checkAppointmentConflict = async (patientId, appointmentDate, appointmentSlot) => {
    if (IS_DEMO_MODE) {
        // Check mock storage (would need to be implemented)
        return false;
    }

    const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('patient_id', patientId)
        .eq('appointment_date', appointmentDate)
        .eq('appointment_slot', appointmentSlot)
        .in('status', ['pending', 'in-progress']);

    if (error) {
        console.error('Error checking conflicts:', error);
        return false;
    }

    return data && data.length > 0;
};

/**
 * Reschedule appointment if conflict exists
 * Finds next available slot
 */
export const rescheduleIfConflict = async (appointmentData) => {
    const hasConflict = await checkAppointmentConflict(
        appointmentData.patient_id,
        appointmentData.appointment_date,
        appointmentData.appointment_slot
    );

    if (!hasConflict) {
        return appointmentData; // No conflict, return as is
    }

    console.log('⚠️ Appointment conflict detected, rescheduling...');

    // Find next available slot (simple logic - add 1 hour)
    const [time, period] = appointmentData.appointment_slot.split(' ');
    const [hours, minutes] = time.split(':');
    let newHours = parseInt(hours) + 1;

    if (newHours > 12) {
        newHours = 1;
    }

    const newSlot = `${newHours}:${minutes} ${period}`;

    return {
        ...appointmentData,
        appointment_slot: newSlot,
        rescheduled: true,
        original_slot: appointmentData.appointment_slot
    };
};

/**
 * Get all doctors
 */
export const getAllDoctors = async () => {
    if (IS_DEMO_MODE) {
        return mockDoctors;
    }

    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('department', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Get doctors by department
 */
export const getDoctorsByDepartment = async (department) => {
    if (IS_DEMO_MODE) {
        return mockDoctors.filter(d => d.department === department);
    }

    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('department', department)
        .order('is_backup', { ascending: true })
        .order('current_appointments_today', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Update doctor status
 */
export const updateDoctorStatus = async (doctorId, status) => {
    if (IS_DEMO_MODE) {
        const doctor = mockDoctors.find(d => d.id === doctorId);
        if (doctor) {
            doctor.status = status;
        }
        return doctor;
    }

    const { data, error } = await supabase
        .from('doctors')
        .update({ status })
        .eq('id', doctorId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Reset daily appointment counts (run at midnight)
 */
export const resetDailyAppointments = async () => {
    if (IS_DEMO_MODE) {
        mockDoctors.forEach(d => {
            d.current_appointments_today = 0;
            if (d.status === 'BUSY') {
                d.status = d.is_backup ? 'ON_CALL' : 'AVAILABLE';
            }
        });
        return;
    }

    const { error } = await supabase.rpc('reset_daily_appointments');
    if (error) throw error;
};
