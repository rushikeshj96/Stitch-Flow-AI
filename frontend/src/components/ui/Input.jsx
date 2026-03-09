import React from 'react';

/**
 * Primitive Input.
 *
 * @param {{ label, hint, error, leftIcon, rightIcon }} props + all native input attrs
 */
export const Input = React.forwardRef(function Input(
    { label, hint, error, leftIcon: LeftIcon, rightIcon: RightIcon, className = '', id, ...props },
    ref
) {
    const inputId = id || React.useId();

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="label">
                    {label}
                </label>
            )}
            <div className="relative">
                {LeftIcon && (
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                        <LeftIcon className="h-4 w-4" />
                    </span>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`${error ? 'input-error' : 'input'} ${LeftIcon ? 'pl-10' : ''} ${RightIcon ? 'pr-10' : ''} ${className}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />
                {RightIcon && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                        <RightIcon className="h-4 w-4" />
                    </span>
                )}
            </div>
            {hint && !error && (
                <p id={`${inputId}-hint`} className="hint">{hint}</p>
            )}
            {error && (
                <p id={`${inputId}-error`} className="error-msg" role="alert">{error}</p>
            )}
        </div>
    );
});

export default Input;
