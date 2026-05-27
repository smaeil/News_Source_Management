/**
 * Email validation – checks format only.
 * Does not verify domain existence.
 */
export const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  email = email.trim();
  if (email.length === 0) return false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Password validation – strong but not overly restrictive.
 * Minimum 8 characters, at least one uppercase, one lowercase, one digit.
 * Special characters are optional (users can add them for extra strength).
 */
export const isValidPassword = (password) => {
  if (typeof password !== "string") return false;
  if (password.length < 8) return false;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);

  return hasUpper && hasLower && hasDigit;
};
