/**
 * Address encoding utilities for Nockchain
 * Converts public keys to base58-encoded addresses
 */

import { base58 } from '@scure/base';

/**
 * Converts a public key to a Nockchain address
 * In Nockchain, an address is the base58-encoded public key
 *
 * @param publicKey - The 97-byte public key from WASM
 * @returns A 132-character base58-encoded address
 */
export function publicKeyToAddress(publicKey: Uint8Array): string {
  if (publicKey.length !== 97) {
    throw new Error(`Invalid public key length: ${publicKey.length}, expected 97`);
  }

  // Nockchain addresses are base58-encoded public keys
  const address = base58.encode(publicKey);

  // Validate the result is 132 characters
  if (address.length !== 132) {
    throw new Error(`Invalid address length: ${address.length}, expected 132`);
  }

  return address;
}

/**
 * Decodes a Nockchain address back to a public key
 *
 * @param address - The 132-character base58-encoded address
 * @returns The 97-byte public key
 */
export function addressToPublicKey(address: string): Uint8Array {
  if (address.length !== 132) {
    throw new Error(`Invalid address length: ${address.length}, expected 132`);
  }

  const publicKey = base58.decode(address);

  if (publicKey.length !== 97) {
    throw new Error(`Decoded public key has invalid length: ${publicKey.length}, expected 97`);
  }

  return publicKey;
}
