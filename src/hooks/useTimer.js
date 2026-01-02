import { useState, useEffect, useRef } from 'react';
import { formatElapsedTime } from '../utils/calculations.js';

export function useTimer() {
    const [activeTimers, setActiveTimers] = useState({});
    const [currentTime, setCurrentTime] = useState(new Date());
    const timerIntervalRef = useRef(null);

    const startTimer = (goalId) => {
        const startTimestamp = Date.now();
        setActiveTimers(prev => ({
            ...prev,
            [goalId]: startTimestamp
        }));
    };

    const stopTimer = (goalId) => {
        const startTimestamp = activeTimers[goalId];
        if (startTimestamp) {
            const duration = Date.now() - startTimestamp;
            setActiveTimers(prev => {
                const newTimers = { ...prev };
                delete newTimers[goalId];
                return newTimers;
            });
            return duration;
        }
        return 0;
    };

    const getElapsedTime = (goalId) => {
        const startTimestamp = activeTimers[goalId];
        if (!startTimestamp) return 0;
        return Date.now() - startTimestamp;
    };

    // Timer update effect
    useEffect(() => {
        if (Object.keys(activeTimers).length > 0) {
            timerIntervalRef.current = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);
            return () => {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
            };
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    }, [activeTimers]);

    // Current time update for display
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        activeTimers,
        startTimer,
        stopTimer,
        getElapsedTime,
        formatElapsedTime: (goalId) => formatElapsedTime(getElapsedTime(goalId))
    };
}

