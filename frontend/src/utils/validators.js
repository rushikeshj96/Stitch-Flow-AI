/**
 * Validation rules for common form fields
 */

export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

export function validatePassword(password) {
    // Min 8 chars, 1 uppercase, 1 digit
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

export function validateRequired(value) {
    return value !== null && value !== undefined && String(value).trim().length > 0;
}

export function validateMinLength(value, min) {
    return String(value).trim().length >= min;
}

export function validateMaxLength(value, max) {
    return String(value).trim().length <= max;
}

/**
 * Run multiple validators and return first error message, or null
 */
export function runValidations(value, rules) {
    for (const { validate, message } of rules) {
        if (!validate(value)) return message;
    }
    return null;
}
