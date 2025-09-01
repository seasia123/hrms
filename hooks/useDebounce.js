import { useEffect, useRef } from 'react';

const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);

    const debouncedFunction = (...args) => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    };

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return debouncedFunction;
};

export default useDebounce;
