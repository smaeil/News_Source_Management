/**
 * Returns true if email is valid, false otherwise.
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Returns true if password is at least 8 chars and contains a number.
 */
export const isValidPassword = (password) => {
    // Check length AND check for at least one digit (\d)
    const passwordRegex = /^(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};