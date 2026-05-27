import { STATUS_CODES } from "http";

/**
 * Standard API response handler
 * @param {object} res - Express response object
 * @param {number|Error} codeOrError - HTTP status code or Error instance
 * @param {string} [msg] - Custom message (overrides default)
 * @param {any} [data] - Payload data
 * @param {object} [extra] - Additional fields to merge (e.g., { errorCode: 'USER_001' })
 * @returns {object} Express response
 */
const respond = (res, codeOrError, msg, data, extra = {}) => {
  // Handle error object
  let code = codeOrError;
  let message = msg;
  if (codeOrError instanceof Error) {
    code = codeOrError.statusCode || 500;
    message = message || codeOrError.message;
  }

  // Determine success based on status code family
  const isSuccess = code >= 200 && code < 300;
  const success = isSuccess;

  // Get default message from http.STATUS_CODES or fallback
  let defaultMsg = STATUS_CODES[code];
  if (!defaultMsg) defaultMsg = "Unknown Status Code";

  // Special handling for 204 No Content – must have no body
  if (code === 204) {
    return res.status(204).send();
  }

  const payload = {
    success,
    msg: message ?? defaultMsg,
    ...extra,
  };
  if (data !== undefined) payload.data = data;

  return res.status(code).json(payload);
};

export default respond;
