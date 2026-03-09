/**
 * Format a date string or Date object
 * @param {string|Date} date
 * @param {string}      format - 'short' | 'long' | 'relative'
 */
export function formatDate(date, format = 'short') {
    if (!date) return '—';
    const d = new Date(date);
    if (format === 'relative') {
        const diff = Date.now() - d.getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'Just now';
        if (min < 60) return `${min}m ago`;
        const hrs = Math.floor(min / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }
    if (format === 'long') {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format a number as Indian Rupees
 */
export function formatCurrency(amount) {
    if (amount == null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Truncate a string to a max length
 */
export function truncate(str, maxLength = 50) {
    if (!str) return '';
    return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
}

/**
 * Get initials from a full name
 */
export function getInitials(name = '') {
    return name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

/**
 * Debounce a function
 */
export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Generate a random avatar color based on a string
 */
export function avatarColor(name = '') {
    const colors = ['#d946ef', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
}
