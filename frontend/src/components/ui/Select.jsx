import React from 'react';

/**
 * Accessible Select primitive.
 *
 * @param {{ label, hint, error, options }} props + all native select attrs
 */
export const Select = React.forwardRef(function Select(
    { label, hint, error, options = [], placeholder, className = '', id, children, ...props },
    ref
) {
    const selectId = id || React.useId();

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={selectId} className="label">{label}</label>
            )}
            <select
                ref={ref}
                id={selectId}
                className={`${error ? 'input-error' : 'input'} ${className} cursor-pointer`}
                aria-invalid={!!error}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(opt =>
                    typeof opt === 'string'
                        ? <option key={opt} value={opt}>{opt}</option>
                        : <option key={opt.value} value={opt.value}>{opt.label}</option>
                )}
                {children}
            </select>
            {hint && !error && <p className="hint">{hint}</p>}
            {error && <p className="error-msg" role="alert">{error}</p>}
        </div>
    );
});

export default Select;
