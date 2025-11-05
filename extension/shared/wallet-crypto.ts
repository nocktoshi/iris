/**
 * Wallet cryptographic utilities
 * Integrates Nockchain WASM bindings
 */

import {
  generateMnemonic as generateMnemonicScure,
  validateMnemonic as validateMnemonicScure,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import init, {
  deriveMasterKeyFromMnemonic,
} from "../lib/nbx-crypto/nbx_crypto.js";
import { publicKeyToPKH } from "./address-encoding";

let wasmInitialized = false;

/**
 * Ensures WASM module is initialized
 * Must be called before using any WASM functions
 */
async function ensureWasmInit() {
  if (!wasmInitialized) {
    // In service worker context, provide explicit WASM URL
    // Must pass as object to avoid deprecated parameter warning
    const cryptoWasmUrl = chrome.runtime.getURL('lib/nbx-crypto/nbx_crypto_bg.wasm');
    await init({ module_or_path: cryptoWasmUrl });
    wasmInitialized = true;
  }
}

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
 * Derives a Nockchain v1 PKH address from a mnemonic using SLIP-10 derivation
 * @param mnemonic - The BIP-39 mnemonic phrase
 * @param accountIndex - The account derivation index (default 0)
 * @returns A Base58-encoded Nockchain v1 PKH address (~60 characters)
 */
export async function deriveAddress(
  mnemonic: string,
  accountIndex: number = 0
): Promise<string> {
  await ensureWasmInit();

  // Derive master key from mnemonic
  const masterKey = deriveMasterKeyFromMnemonic(mnemonic, "");

  // Derive child key at account index
  const childKey = masterKey.deriveChild(accountIndex);

  // Get the public key hash (PKH) for v1 addresses
  // v1 uses TIP5 hash of the public key, base58 encoded
  const address = publicKeyToPKH(childKey.public_key);

  // Clean up WASM memory
  childKey.free();
  masterKey.free();

  return address;
}
