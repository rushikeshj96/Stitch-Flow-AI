import { useState, useCallback } from 'react';

/**
 * Pagination state hook.
 * @param {number} defaultPageSize - Items per page
 */
export function usePagination(defaultPageSize = 10) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [total, setTotal] = useState(0);

    const totalPages = Math.ceil(total / pageSize);

    const goTo = useCallback((p) => setPage(Math.max(1, Math.min(p, totalPages))), [totalPages]);
    const nextPage = useCallback(() => goTo(page + 1), [page, goTo]);
    const prevPage = useCallback(() => goTo(page - 1), [page, goTo]);
    const reset = useCallback(() => setPage(1), []);

    return { page, pageSize, total, totalPages, setTotal, setPageSize, goTo, nextPage, prevPage, reset };
}
