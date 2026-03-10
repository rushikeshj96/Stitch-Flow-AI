import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounced search hook for API search calls.
 * @param {Function} searchFn - Service function to call
 * @param {number}   delay    - Debounce delay in ms (default 400ms)
 */
export function useSearch(searchFn, delay = 400) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const result = await searchFn(query);
                setResults(result || []);
            } catch { setResults([]); }
            finally { setLoading(false); }
        }, delay);
        return () => clearTimeout(timerRef.current);
    }, [query, delay]);

    const clear = useCallback(() => { setQuery(''); setResults([]); }, []);

    return { query, setQuery, results, loading, clear };
}
