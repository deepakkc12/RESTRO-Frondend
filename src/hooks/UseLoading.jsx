import { useState, useCallback } from 'react';

export const useLoading = (defaultTimeout = 5000) => {
    const [isLoading, setIsLoading] = useState(false);

    const start = useCallback(() => {
        setIsLoading(true);

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, defaultTimeout);

        return () => {
            clearTimeout(timer);
            setIsLoading(false);
        };
    }, [defaultTimeout]);

    const stop = useCallback(() => {
        setIsLoading(false);
    }, []);

    return {
        isLoading,
        start,
        stop
    };
};