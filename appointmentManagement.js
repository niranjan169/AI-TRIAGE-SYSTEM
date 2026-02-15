import { supabase, IS_DEMO_MODE } from '../lib/supabase';

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
    if (IS_DEMO_MODE) {
        // In demo mode, update localStorage
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const index = appointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
            appointments[index].status = status;
            appointments[index].updated_at = new Date().toISOString();
            localStorage.setItem('appointments', JSON.stringify(appointments));
        }
        return appointments[index];
    }

    const { data, error } = await supabase
        .from('appointments')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Cancel appointment
 * - Updates status to 'cancelled'
 * - Decrements doctor's appointment count
 * - Recalculates queue positions for remaining appointments
 */
export const cancelAppointment = async (appointmentId) => {
    console.log('🚫 Cancelling appointment:', appointmentId);

    if (IS_DEMO_MODE) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const index = appointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
            const apt = appointments[index];
            appointments[index].status = 'cancelled';
            appointments[index].updated_at = new Date().toISOString();
            localStorage.setItem('appointments', JSON.stringify(appointments));

            // Recalculate queue positions
            await recalculateQueuePositions(apt.department, apt.appointment_date);
        }
        return appointments[index];
    }

    // Get appointment details first
    const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*, doctor_id')
        .eq('id', appointmentId)
        .single();

    if (fetchError) throw fetchError;

    // Update appointment status
    const { data, error } = await supabase
        .from('appointments')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;

    // Decrement doctor's appointment count
    if (appointment.doctor_id) {
        // Get current doctor data
        const { data: doctor } = await supabase
            .from('doctors')
            .select('current_appointments_today')
            .eq('id', appointment.doctor_id)
            .single();

        if (doctor && doctor.current_appointments_today > 0) {
            await supabase
                .from('doctors')
                .update({
                    current_appointments_today: doctor.current_appointments_today - 1,
                    status: 'AVAILABLE' // Set back to available
                })
                .eq('id', appointment.doctor_id);
        }
    }

    // Recalculate queue positions for same department/date
    await recalculateQueuePositions(appointment.department, appointment.appointment_date);

    console.log('✅ Appointment cancelled');
    return data;
};

/**
 * Reschedule appointment
 * - Updates appointment date and slot
 * - Recalculates queue positions for both old and new dates
 */
export const rescheduleAppointment = async (appointmentId, newDate, newSlot) => {
    console.log('📅 Rescheduling appointment:', { appointmentId, newDate, newSlot });

    if (IS_DEMO_MODE) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const index = appointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
            const oldDate = appointments[index].appointment_date;
            const department = appointments[index].department;

            appointments[index].appointment_date = newDate;
            appointments[index].appointment_slot = newSlot;
            appointments[index].updated_at = new Date().toISOString();
            localStorage.setItem('appointments', JSON.stringify(appointments));

            // Recalculate queue for both old and new dates
            await recalculateQueuePositions(department, oldDate);
            await recalculateQueuePositions(department, newDate);
        }
        return appointments[index];
    }

    // Get appointment details
    const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

    if (fetchError) throw fetchError;

    const oldDate = appointment.appointment_date;
    const department = appointment.department;

    // Update appointment
    const { data, error } = await supabase
        .from('appointments')
        .update({
            appointment_date: newDate,
            appointment_slot: newSlot,
            updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;

    // Recalculate queue positions for both dates
    await recalculateQueuePositions(department, oldDate);
    await recalculateQueuePositions(department, newDate);

    console.log('✅ Appointment rescheduled');
    return data;
};

/**
 * Recalculate queue positions for appointments
 * Orders by priority_score (descending) and created_at (ascending)
 */
export const recalculateQueuePositions = async (department, date) => {
    console.log('🔄 Recalculating queue positions:', { department, date });

    if (IS_DEMO_MODE) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const relevantApts = appointments
            .filter(a =>
                a.department === department &&
                a.appointment_date === date &&
                a.status === 'pending'
            )
            .sort((a, b) => {
                // Sort by priority (high to low), then by created_at (old to new)
                if (b.priority_score !== a.priority_score) {
                    return b.priority_score - a.priority_score;
                }
                return new Date(a.created_at) - new Date(b.created_at);
            });

        // Update queue positions
        relevantApts.forEach((apt, index) => {
            const fullIndex = appointments.findIndex(a => a.id === apt.id);
            if (fullIndex !== -1) {
                appointments[fullIndex].queue_position = index + 1;
            }
        });

        localStorage.setItem('appointments', JSON.stringify(appointments));
        return;
    }

    // Get all pending appointments for this department and date
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('department', department)
        .eq('appointment_date', date)
        .eq('status', 'pending')
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching appointments:', error);
        return;
    }

    // Update queue positions
    const updates = appointments.map((apt, index) =>
        supabase
            .from('appointments')
            .update({ queue_position: index + 1 })
            .eq('id', apt.id)
    );

    await Promise.all(updates);
    console.log(`✅ Updated ${appointments.length} queue positions`);
};
