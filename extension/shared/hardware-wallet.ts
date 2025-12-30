/**
 * Hardware Wallet Manager
 * 
 * Integrates YubiKey (via WebAuthn) with the Iris Vault for hardware-backed security.
 * 
 * Security Model:
 * ===============
 * 
 * Mode 1: PRF Key-Wrapping (Best Security - YubiKey 5.2+)
 * --------------------------------------------------------
 * - YubiKey PRF extension derives a unique encryption key
 * - Master seed is double-encrypted: PRF key wraps the password-derived key
 * - Seed can ONLY be decrypted with physical YubiKey present
 * - Even if password is compromised, attacker needs the YubiKey
 * 
 * Mode 2: WebAuthn 2FA (Good Security - Any FIDO2 Key)
 * ----------------------------------------------------
 * - YubiKey provides hardware-backed user verification
 * - Physical tap required before sensitive operations
 * - Password still protects the seed (existing encryption)
 * - YubiKey adds second factor (something you have)
 * 
 * Operations Protected:
 * - Transaction signing
 * - Viewing recovery phrase
 * - (Optional) Wallet unlock
 */

import {
  HardwareWalletConfig,
  HardwareWalletCredential,
  WebAuthnResult,
  getDefaultHardwareWalletConfig,
  isWebAuthnSupported,
  verifyHardwareWallet,
  encryptWithHardwareKey,
  decryptWithHardwareKey,
} from './webauthn';
import { deriveKeyFromPRF } from './prf-crypto';

// Storage key for hardware wallet config
const HW_CONFIG_KEY = 'hw_wallet_config';

// Storage key for PRF-wrapped seed encryption key
const HW_WRAPPED_KEY = 'hw_wrapped_key';

// ============================================================================
// Types
// ============================================================================

export interface HardwareWalletStatus {
  /** WebAuthn is available in this browser */
  supported: boolean;
  /** Hardware wallet is configured and enabled */
  enabled: boolean;
  /** Number of registered credentials */
  credentialCount: number;
  /** At least one credential supports PRF (key-wrapping mode) */
  prfAvailable: boolean;
  /** Current security mode */
  mode: 'prf-key-wrapping' | 'webauthn-2fa' | 'disabled';
}

export interface VerificationContext {
  /** Human-readable description shown to user */
  description: string;
}

// ============================================================================
// Hardware Wallet Manager
// ============================================================================

export class HardwareWalletManager {
  private config: HardwareWalletConfig | null = null;
  
  /** Cached PRF-derived key (cleared on lock) */
  private prfDerivedKey: CryptoKey | null = null;

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize the hardware wallet manager
   * Loads configuration from storage
   */
  async init(): Promise<void> {
    const stored = await chrome.storage.local.get([HW_CONFIG_KEY]);
    this.config = stored[HW_CONFIG_KEY] as HardwareWalletConfig || getDefaultHardwareWalletConfig();
  }

  /**
   * Get current hardware wallet status
   */
  getStatus(): HardwareWalletStatus {
    const supported = isWebAuthnSupported();
    const enabled = this.config?.enabled ?? false;
    const credentials = this.config?.credentials ?? [];
    const prfAvailable = credentials.some(c => c.prfSupported);

    let mode: HardwareWalletStatus['mode'] = 'disabled';
    if (enabled && credentials.length > 0) {
      mode = prfAvailable ? 'prf-key-wrapping' : 'webauthn-2fa';
    }

    return {
      supported,
      enabled,
      credentialCount: credentials.length,
      prfAvailable,
      mode,
    };
  }

  /**
   * Get the current configuration
   */
  getConfig(): HardwareWalletConfig {
    return this.config ?? getDefaultHardwareWalletConfig();
  }

  /**
   * Get credentials for verification (popup needs these for WebAuthn)
   */
  getCredentials(): HardwareWalletCredential[] {
    return this.config?.credentials ?? [];
  }

  /**
   * Save a credential that was registered in popup
   * WebAuthn requires window context, so registration happens in popup
   */
  async saveCredential(credential: HardwareWalletCredential): Promise<void> {
    const config = this.config ?? getDefaultHardwareWalletConfig();
    
    // Check if credential already exists (by ID) and update it instead of adding duplicate
    const existingIndex = config.credentials.findIndex(
      c => c.credentialId === credential.credentialId
    );
    
    if (existingIndex >= 0) {
      // Update existing credential
      config.credentials[existingIndex] = credential;
    } else {
      // Add new credential
      config.credentials.push(credential);
    }
    
    config.enabled = true;

    await chrome.storage.local.set({ [HW_CONFIG_KEY]: config });
    this.config = config;
  }

  // ==========================================================================
  // Credential Management
  // ==========================================================================

  /**
   * Remove a registered credential
   */
  async removeCredential(credentialId: string): Promise<void> {
    if (!this.config) return;

    this.config.credentials = this.config.credentials.filter(
      c => c.credentialId !== credentialId
    );

    // Disable if no credentials left
    if (this.config.credentials.length === 0) {
      this.config.enabled = false;
    }

    await chrome.storage.local.set({ [HW_CONFIG_KEY]: this.config });
  }

  // ==========================================================================
  // Verification
  // ==========================================================================

  /**
   * Check if hardware verification is required
   * If a YubiKey is configured, require it for all sensitive operations
   */
  isVerificationRequired(): boolean {
    return this.config?.enabled === true && this.config.credentials.length > 0;
  }

  /**
   * Verify user with hardware wallet
   * 
   * Prompts user to tap their YubiKey and verifies the response.
   * If PRF is available, also derives and caches the encryption key.
   * 
   * @param context - What operation is being protected
   * @returns Success/failure with optional PRF output
   */
  async verify(context: VerificationContext): Promise<WebAuthnResult> {
    if (!this.config?.enabled || this.config.credentials.length === 0) {
      return { success: true }; // No hardware wallet configured
    }

    // Try each credential until one succeeds
    for (const credential of this.config.credentials) {
      const result = await verifyHardwareWallet(credential, context.description);
      
      if (result.success) {
        // Cache PRF-derived key if available
        if (result.prfOutput) {
          this.prfDerivedKey = await deriveKeyFromPRF(result.prfOutput);
        }
        return result;
      }
    }

    return { success: false, error: 'No valid hardware wallet found' };
  }

  // ==========================================================================
  // PRF Key-Wrapping
  // ==========================================================================

  /**
   * Check if PRF key-wrapping is available
   */
  isPRFAvailable(): boolean {
    return this.config?.credentials.some(c => c.prfSupported) ?? false;
  }

  /**
   * Get the cached PRF-derived key
   * Available after successful verify() with PRF-enabled credential
   */
  getPRFDerivedKey(): CryptoKey | null {
    return this.prfDerivedKey;
  }

  /**
   * Wrap a key with PRF-derived encryption
   * 
   * This encrypts a password-derived key with the PRF key,
   * requiring the YubiKey to decrypt it later.
   * 
   * @param passwordKey - The password-derived encryption key
   * @returns Wrapped key data for storage
   */
  async wrapKeyWithPRF(passwordKey: CryptoKey): Promise<Uint8Array | null> {
    if (!this.prfDerivedKey) {
      return null;
    }

    // Export the password key to raw format
    const keyData = await crypto.subtle.exportKey('raw', passwordKey);
    const keyBytes = new Uint8Array(keyData);

    // Encrypt with PRF-derived key
    return encryptWithHardwareKey(this.prfDerivedKey, keyBytes);
  }

  /**
   * Unwrap a PRF-protected key
   * 
   * Requires prior successful verify() with PRF-enabled credential.
   * 
   * @param wrappedKey - The PRF-wrapped key data
   * @returns The unwrapped password-derived key
   */
  async unwrapKeyWithPRF(wrappedKey: Uint8Array): Promise<CryptoKey | null> {
    if (!this.prfDerivedKey) {
      return null;
    }

    try {
      // Decrypt with PRF-derived key
      const keyBytes = await decryptWithHardwareKey(this.prfDerivedKey, wrappedKey);

      // Re-import as AES-GCM key
      return crypto.subtle.importKey(
        'raw',
        new Uint8Array(keyBytes),
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (err) {
      console.error('[HardwareWallet] Failed to unwrap key:', err);
      return null;
    }
  }

  /**
   * Store PRF-wrapped key
   */
  async storeWrappedKey(wrappedKey: Uint8Array): Promise<void> {
    await chrome.storage.local.set({
      [HW_WRAPPED_KEY]: Array.from(wrappedKey),
    });
  }

  /**
   * Load PRF-wrapped key
   */
  async loadWrappedKey(): Promise<Uint8Array | null> {
    const stored = await chrome.storage.local.get([HW_WRAPPED_KEY]);
    if (stored[HW_WRAPPED_KEY]) {
      return stored[HW_WRAPPED_KEY] as Uint8Array;
    }
    return null;
  }

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  /**
   * Clear cached keys (call on vault lock)
   */
  lock(): void {
    this.prfDerivedKey = null;
  }

  /**
   * Disable hardware wallet entirely
   */
  async disable(): Promise<void> {
    this.config = getDefaultHardwareWalletConfig();
    this.prfDerivedKey = null;
    await chrome.storage.local.remove([HW_CONFIG_KEY, HW_WRAPPED_KEY]);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const hardwareWallet = new HardwareWalletManager();

