/**
 * PRF-based crypto utilities for hardware wallet integration
 *
 * This module contains ONLY the key derivation and encryption/decryption
 * functions that can safely run in both popup and service worker contexts.
 * NO browser-specific APIs (window, document, navigator.credentials) are used.
 *
 * The WebCrypto API (crypto.subtle) IS available in service workers.
 */

/**
 * Derive an AES-GCM key from PRF output
 *
 * When PRF is available, this derives a 256-bit AES key from the
 * YubiKey's PRF output. This key can be used to encrypt/decrypt
 * the master seed, providing true hardware-backed key protection.
 *
 * @param prfOutput - 32-byte PRF output from verifyHardwareWallet
 * @returns AES-GCM CryptoKey for encryption/decryption
 */
export async function deriveKeyFromPRF(prfOutput: Uint8Array): Promise<CryptoKey> {
  // Use HKDF to derive a proper AES key from the PRF output
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    prfOutput as BufferSource,
    'HKDF',
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode('iris-wallet-aes-key-v1'),
      info: new TextEncoder().encode('seed-encryption'),
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true, // extractable - allows session persistence for auto-lock timeout
    ['encrypt', 'decrypt']
  );

  return aesKey;
}

