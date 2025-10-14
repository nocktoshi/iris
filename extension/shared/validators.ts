/**
 * Validators for Nockchain addresses and other data
 */

/**
 * Validates a Nockchain address
 * Format: Base58 encoded, exactly 132 characters
 */
export const isNockAddress = (s: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]{132}$/.test((s || '').trim());
};
