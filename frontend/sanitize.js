/**
 * Strips HTML tags and trims whitespace.
 * Use on all user-supplied strings before sending to the API.
 */
export function sanitizeString(str = "") {
  return str
    .replace(/<[^>]*>/g, "")   // strip HTML tags
    .replace(/[<>'"]/g, "")    // strip remaining dangerous chars
    .trim();
}

/**
 * Sanitizes every string value in a flat object.
 */
export function sanitizeForm(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "string" ? sanitizeString(v) : v,
    ])
  );
}

/**
 * Validates a 10-digit Indian phone number.
 */
export function isValidPhone(phone = "") {
  return /^\d{10}$/.test(phone.replace(/\s/g, ""));
}

/**
 * Validates a 6-digit Indian pincode.
 */
export function isValidPincode(pin = "") {
  return /^\d{6}$/.test(pin);
}

/**
 * Basic email check.
 */
export function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}