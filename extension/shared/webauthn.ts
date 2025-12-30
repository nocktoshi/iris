/**
 * WebAuthn utilities for YubiKey hardware wallet integration
 * 
 * This module provides WebAuthn/FIDO2 credential management for hardware-backed
 * security. It uses the PRF (Pseudo-Random Function) extension when available
 * to derive encryption keys directly from the YubiKey.
 * 
 * Architecture:
 * - Key-Wrapping: YubiKey PRF derives a key that encrypts the master seed
 * - WebAuthn: YubiKey provides hardware-backed user verification
 * 
 * Security Model:
 * - Private keys never leave the extension (Cheetah signing still in software)
 * - YubiKey provides hardware attestation + physical presence verification
 * - With PRF: seed encryption key is derived from hardware (never stored)
 * - Without PRF: YubiKey provides 2FA before password-based decryption
 */

// ============================================================================
// Types
// ============================================================================

export interface HardwareWalletCredential {
  /** Base64url-encoded credential ID */
  credentialId: string;
  /** User-friendly name for this hardware key */
  name: string;
  /** When the credential was registered */
  registeredAt: number;
  /** Whether PRF extension is supported (for key derivation) */
  prfSupported: boolean;
  /** Transports available (usb, nfc, ble, internal) */
  transports?: AuthenticatorTransport[];
}

export interface HardwareWalletConfig {
  /** Whether hardware wallet is enabled */
  enabled: boolean;
  /** Registered credentials */
  credentials: HardwareWalletCredential[];
}

export interface WebAuthnResult {
  success: boolean;
  error?: string;
  /** PRF output (32 bytes) if available - used for key derivation */
  prfOutput?: Uint8Array;
}

// ============================================================================
// Constants
// ============================================================================

/** Relying Party name shown to users */
const RP_NAME = 'Rose Wallet';

// NOTE: For Chrome extensions, RP ID must be omitted to use the default extension origin.
// Setting an RP ID will cause "The operation is not allowed in this context" error.

/** Challenge size in bytes */
const CHALLENGE_SIZE = 32;

/** PRF salt for seed encryption key derivation */
const PRF_SALT_SEED_KEY = new TextEncoder().encode('iris-wallet-seed-encryption-v1');

// ============================================================================
// Utilities
// ============================================================================

/** Generate cryptographically random bytes */
function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/** Base64url encode */
function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Base64url decode */
function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Check if WebAuthn is supported */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
}

/** Check if platform authenticator (TouchID, Windows Hello) is available */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// ============================================================================
// Credential Registration
// ============================================================================

/**
 * Register a new hardware wallet credential (YubiKey)
 * 
 * This creates a new credential on the YubiKey that can be used for:
 * 1. User verification (physical presence check)
 * 2. PRF-based key derivation (if supported)
 * 
 * @param userId - Unique user identifier (e.g., wallet address hash)
 * @param userName - Display name for the user
 * @param keyName - User-friendly name for this hardware key
 * @returns Credential information or error
 */
export async function registerHardwareWallet(
  userId: string,
  userName: string,
  keyName: string = 'YubiKey'
): Promise<{ credential: HardwareWalletCredential; prfOutput?: Uint8Array } | { error: string }> {
  if (!isWebAuthnSupported()) {
    return { error: 'WebAuthn is not supported in this browser' };
  }

  try {
    const challenge = randomBytes(CHALLENGE_SIZE) as BufferSource;
    const userIdBytes = new TextEncoder().encode(userId);

    // Create credential options
    const createOptions: CredentialCreationOptions = {
      publicKey: {
        challenge,
        rp: {
          name: RP_NAME,
          // id omitted for Chrome extension compatibility
        },
        user: {
          id: userIdBytes,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256 (P-256)
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          // Prefer cross-platform authenticators (YubiKey) over platform (TouchID)
          authenticatorAttachment: 'cross-platform',
          // Require user verification (PIN or biometric on YubiKey)
          userVerification: 'required',
          // We want a resident credential for easier discovery
          residentKey: 'preferred',
          requireResidentKey: false,
        },
        timeout: 120000, // 2 minutes for YubiKey setup
        attestation: 'none', // We don't need attestation for this use case
        extensions: {
          // Request PRF extension for key derivation (YubiKey 5.2+)
          prf: {
            eval: {
              first: PRF_SALT_SEED_KEY,
            },
          },
        },
      },
    };

    // Create credential
    const credential = (await navigator.credentials.create(createOptions)) as PublicKeyCredential;

    if (!credential) {
      return { error: 'Credential creation was cancelled or failed' };
    }

    const response = credential.response as AuthenticatorAttestationResponse;

    // Check if PRF is supported and if PRF output is available
    const extensionResults = credential.getClientExtensionResults();
    console.log('[WebAuthn] Registration extension results:', JSON.stringify(extensionResults));
    
    // PRF support can be indicated by prf.enabled or prf.results existing
    const prfSupported = 
      extensionResults?.prf?.enabled === true || 
      extensionResults?.prf?.results !== undefined;

    // Try to get PRF output during registration (some authenticators support this)
    let prfOutput: Uint8Array | undefined;
    if (extensionResults?.prf?.results?.first) {
      prfOutput = new Uint8Array(extensionResults.prf.results.first as ArrayBuffer);
      console.log('[WebAuthn] Got PRF output during registration, length:', prfOutput.length);
    }

    // Get transports if available
    let transports: AuthenticatorTransport[] | undefined;
    if ('getTransports' in response && typeof response.getTransports === 'function') {
      transports = response.getTransports() as AuthenticatorTransport[];
    }

    const hwCredential: HardwareWalletCredential = {
      credentialId: base64urlEncode(new Uint8Array(credential.rawId)),
      name: keyName,
      registeredAt: Date.now(),
      prfSupported,
      transports,
    };

    return { credential: hwCredential, prfOutput };
  } catch (err) {
    console.error('[WebAuthn] Registration error:', err);
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
          return { error: 'User cancelled the operation or hardware key not recognized' };
        case 'InvalidStateError':
          return { error: 'A credential already exists for this user on this device' };
        case 'NotSupportedError':
          return { error: 'The hardware key does not support the required features' };
        case 'SecurityError':
          return { error: 'The operation is not allowed in this context (check origin)' };
        default:
          return { error: `WebAuthn error: ${err.message}` };
      }
    }
    return { error: `Registration failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ============================================================================
// Credential Verification
// ============================================================================

/**
 * Verify user presence with hardware wallet
 * 
 * This requires the user to tap their YubiKey and optionally enter a PIN.
 * If PRF is supported, it also returns a derived key that can be used
 * for seed encryption.
 * 
 * @param credential - The registered credential to verify with
 * @param purpose - Human-readable purpose (shown in some authenticators)
 * @returns Verification result with optional PRF output
 */
export async function verifyHardwareWallet(
  credential: HardwareWalletCredential,
  purpose: string = 'wallet operation'
): Promise<WebAuthnResult> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: 'WebAuthn is not supported' };
  }

  try {
    const challenge = randomBytes(CHALLENGE_SIZE) as BufferSource;
    const credentialId = base64urlDecode(credential.credentialId) as BufferSource;

    // Always request PRF - the authenticator will simply ignore if not supported
    const getOptions: CredentialRequestOptions = {
      publicKey: {
        challenge,
        // rpId omitted for Chrome extension compatibility
        allowCredentials: [
          {
            type: 'public-key',
            id: credentialId,
            transports: credential.transports,
          },
        ],
        userVerification: 'required',
        timeout: 60000, // 1 minute
        extensions: {
          prf: {
            eval: {
              first: PRF_SALT_SEED_KEY,
            },
          },
        },
      },
    };

    const assertion = (await navigator.credentials.get(getOptions)) as PublicKeyCredential;

    if (!assertion) {
      return { success: false, error: 'Verification was cancelled or failed' };
    }

    // Always check for PRF output (don't rely on prfSupported flag)
    let prfOutput: Uint8Array | undefined;
    const extensionResults = assertion.getClientExtensionResults();
    console.log('[WebAuthn] Verification extension results:', JSON.stringify(extensionResults));
    
    if (extensionResults?.prf?.results?.first) {
      prfOutput = new Uint8Array(extensionResults.prf.results.first as ArrayBuffer);
      console.log('[WebAuthn] Got PRF output, length:', prfOutput.length);
    }

    return { success: true, prfOutput };
  } catch (err) {
    console.error('[WebAuthn] Verification error:', err);
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
          return { success: false, error: 'User cancelled or hardware key not recognized' };
        case 'SecurityError':
          return { success: false, error: 'Security error - check if origin is allowed' };
        case 'AbortError':
          return { success: false, error: 'Operation was aborted' };
        default:
          return { success: false, error: `WebAuthn error: ${err.message}` };
      }
    }
    return {
      success: false,
      error: `Verification failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ============================================================================
// Key Derivation
// ============================================================================

/**
 * Encrypt data with a hardware-derived key
 * 
 * @param key - AES-GCM key from deriveKeyFromPRF (in prf-crypto.ts)
 * @param data - Data to encrypt
 * @returns Encrypted data with IV prepended
 */
export async function encryptWithHardwareKey(
  key: CryptoKey,
  data: Uint8Array
): Promise<Uint8Array> {
  const iv = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, data as BufferSource);

  // Prepend IV to ciphertext
  const result = new Uint8Array(iv.length + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), iv.length);
  return result;
}

/**
 * Decrypt data with a hardware-derived key
 * 
 * @param key - AES-GCM key from deriveKeyFromPRF
 * @param encryptedData - Data to decrypt (IV prepended)
 * @returns Decrypted data
 */
export async function decryptWithHardwareKey(
  key: CryptoKey,
  encryptedData: Uint8Array
): Promise<Uint8Array> {
  const iv = encryptedData.slice(0, 12);
  const ciphertext = encryptedData.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new Uint8Array(plaintext);
}

// ============================================================================
// Default Configuration
// ============================================================================

export function getDefaultHardwareWalletConfig(): HardwareWalletConfig {
  return {
    enabled: false,
    credentials: [],
  };
}

