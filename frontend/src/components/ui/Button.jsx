import React from 'react';

const variants = {
    default: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    destructive: 'btn-destructive',
    outline: 'btn-outline-primary',
};

const sizes = {
    sm: 'h-8  px-3   text-xs gap-1.5',
    md: 'h-10 px-4   text-sm gap-2',
    lg: 'h-11 px-5   text-base gap-2',
    icon: 'h-9  w-9    p-0',
};

/**
 * Primitive button — wraps CSS `.btn` classes.
 *
 * @param {{ variant, size, loading, children, className }} props
 */
export const Button = React.forwardRef(function Button(
    { variant = 'default', size = 'md', loading, children, className = '', disabled, ...props },
    ref
) {
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`btn ${variants[variant] ?? variants.default} ${sizes[size] ?? sizes.md} ${className}`}
            {...props}
        >
            {loading && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            {children}
        </button>
    );
});

export default Button;
