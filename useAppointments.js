import { useState, useEffect } from 'react';
import { getAppointments } from '../services/database';

export const useAppointments = (filters = {}) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await getAppointments(filters);
            setAppointments(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch if we have a patientId filter
        if (filters.patientId) {
            fetchAppointments();
        }
    }, [filters.patientId]); // Re-fetch when patientId changes

    return { appointments, loading, error, refetch: fetchAppointments };
};
