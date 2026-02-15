import { useState, useEffect } from 'react';
import { getActiveQueue, subscribeToQueue } from '../services/database';
import { calculateSeverityScore } from '../services/aiTriage';

export const useQueue = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const data = await getActiveQueue();

            // Calculate severity scores and sort
            const enrichedQueue = data.map(item => {
                const waitingMinutes = Math.floor(
                    (new Date() - new Date(item.created_at)) / 60000
                );
                return {
                    ...item,
                    waitingMinutes,
                    severityScore: calculateSeverityScore(item.assessments, waitingMinutes)
                };
            });

            enrichedQueue.sort((a, b) => b.severityScore - a.severityScore);
            setQueue(enrichedQueue);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();

        // Subscribe to realtime updates
        const subscription = subscribeToQueue(() => {
            fetchQueue();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { queue, loading, error, refetch: fetchQueue };
};
