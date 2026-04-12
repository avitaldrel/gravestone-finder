/**
 * Normalizes a row identifier to uppercase letter format.
 *
 * Accepts:
 * - Letters: "A", "a", "AA" -> "A", "A", "AA"
 * - Numbers: 1, "1", "26", "27" -> "A", "A", "Z", "AA"
 *
 * Throws Error for invalid inputs (empty, zero, negative, special chars).
 */
export function normalizeRowLabel(input: string | number): string {
  const str = String(input).trim();

  if (str === "") {
    throw new Error(`Invalid row identifier: "${input}"`);
  }

  // Check if input is purely alphabetic
  const upper = str.toUpperCase();
  if (/^[A-Z]+$/.test(upper)) {
    return upper;
  }

  // Try to parse as a positive integer
  const num = Number(str);
  if (Number.isInteger(num) && num > 0) {
    return numberToLetters(num);
  }

  throw new Error(`Invalid row identifier: "${input}"`);
}

/**
 * Converts a positive integer to spreadsheet-style column letters.
 * 1 -> A, 2 -> B, ..., 26 -> Z, 27 -> AA, 28 -> AB, ...
 */
function numberToLetters(n: number): string {
  let result = "";
  let remaining = n;

  while (remaining > 0) {
    remaining -= 1;
    result = String.fromCharCode(65 + (remaining % 26)) + result;
    remaining = Math.floor(remaining / 26);
  }

  return result;
}
