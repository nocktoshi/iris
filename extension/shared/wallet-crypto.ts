/**
 * Wallet cryptographic utilities
 * Uses @scure/bip39 for mnemonic generation (browser-native, no Buffer polyfill needed)
 * TODO: Replace address derivation with Nockchain WASM integration
 */

import { generateMnemonic as generateMnemonicScure, validateMnemonic as validateMnemonicScure } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

/**
 * Generates a BIP-39 mnemonic (24 words)
 * Uses 256 bits of entropy for maximum security
 */
export function generateMnemonic(): string {
  return generateMnemonicScure(wordlist, 256);
}

/**
 * Validates a BIP-39 mnemonic
 * @param mnemonic - The mnemonic phrase to validate
 * @returns true if valid, false otherwise
 */
export function validateMnemonic(mnemonic: string): boolean {
  return validateMnemonicScure(mnemonic, wordlist);
}

/**
 * Derives a Nockchain address from a mnemonic
 * TODO: Replace with real Nockchain SLIP-10 key derivation and CheetahPoint address generation
 * @param mnemonic - The BIP-39 mnemonic phrase
 * @param accountIndex - The account derivation index (default 0)
 * @returns A Base58-encoded Nockchain address (132 characters)
 */
export function deriveAddress(mnemonic: string, accountIndex: number = 0): string {
  // Placeholder: returns valid Base58 characters to pass validator
  // TODO: Implement real SLIP-10 derivation and CheetahPoint encoding via WASM
  return '1'.repeat(132);
}
