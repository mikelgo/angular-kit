/**
 * Coerce a value to a number.
 * The value is typically a string.
 * @param value
 * @param fallback - a fallback value to use if the value is not a number
 */
export function coerceNumber(value: unknown): number;
export function coerceNumber<D>(value: unknown, fallback: D): number | D;
export function coerceNumber(value: unknown, fallbackValue = 0) {
  return isNumberValue(value) ? Number(value) : fallbackValue;
}

/**
 * Check if value is a number
 */
function isNumberValue(value: unknown): boolean {
  return !isNaN(parseFloat(value as never)) && !isNaN(Number(value));
}
