/**
 * Validates if the input is a valid 5-digit US zip code
 * @param zipCode The zip code string to validate
 * @returns Boolean indicating if the zip code is valid
 */
export function isValidZipCode(zipCode: string): boolean {
  return /^\d{5}$/.test(zipCode);
}
