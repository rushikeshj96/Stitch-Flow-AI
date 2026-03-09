import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Generic async operation hook.
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} options   - { successMsg, errorMsg, onSuccess, onError }
 */
export function useAsync(asyncFn, options = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await asyncFn(...args);
            setData(result);
            if (options.successMsg) toast.success(options.successMsg);
            if (options.onSuccess) options.onSuccess(result);
            return result;
        } catch (err) {
            const message = err?.message || options.errorMsg || 'Something went wrong';
            setError(message);
            toast.error(message);
            if (options.onError) options.onError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [asyncFn, options.successMsg, options.errorMsg]);

    const reset = useCallback(() => { setData(null); setError(null); }, []);

    return { loading, error, data, execute, reset };
}
