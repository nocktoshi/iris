/**
 * React hook for hardware wallet (YubiKey) integration
 *
 * WebAuthn requires a window context (popup), not service worker (background).
 * This hook calls WebAuthn APIs directly, then sends results to background for storage.
 *
 * If a YubiKey is configured, it's required for ALL sensitive operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { send } from '../utils/messaging';
import { INTERNAL_METHODS } from '../../shared/constants';
import {
  registerHardwareWallet,
  verifyHardwareWallet,
  isWebAuthnSupported,
  type HardwareWalletCredential,
} from '../../shared/webauthn';

// ============================================================================
// Types
// ============================================================================

export interface HardwareWalletStatus {
  supported: boolean;
  enabled: boolean;
  credentialCount: number;
  prfAvailable: boolean;
  mode: 'prf-key-wrapping' | 'webauthn-2fa' | 'disabled';
}

export interface UseHardwareWalletReturn {
  /** Current status */
  status: HardwareWalletStatus | null;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh status from background */
  refresh: () => Promise<void>;
  /** Register a new YubiKey */
  register: (keyName?: string) => Promise<{ success: boolean; error?: string; prfEnabled?: boolean }>;
  /** Unlock vault with hardware key (for hardware-protected wallets) */
  unlockWithHardware: () => Promise<{ success: boolean; error?: string }>;
  /** Verify with hardware wallet - returns PRF output if available */
  verify: (description: string) => Promise<{ success: boolean; error?: string; prfOutput?: Uint8Array }>;
  /** Remove a credential */
  removeCredential: (credentialId: string) => Promise<void>;
  /** Disable hardware wallet (requires password to re-encrypt vault) */
  disable: (password: string) => Promise<{ success: boolean; error?: string }>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useHardwareWallet(): UseHardwareWalletReturn {
  const [status, setStatus] = useState<HardwareWalletStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch status from background
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await send<{ ok?: boolean; message: string; status: HardwareWalletStatus }>(
        INTERNAL_METHODS.HW_GET_STATUS,
        []
      );
      if (!result?.ok) {
        setError(result.message);
      } else {
        setStatus(result.status);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get hardware wallet status');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load status on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Register a new YubiKey - WebAuthn runs in popup, then save to background
  // If PRF is supported, also enables hardware encryption on the vault
  const register = useCallback(
    async (keyName?: string) => {
      try {
        setLoading(true);
        setError(null);

        // Check WebAuthn support in popup context
        if (!isWebAuthnSupported()) {
          const errMsg = 'WebAuthn is not supported in this browser';
          setError(errMsg);
          return { success: false, error: errMsg };
        }

        // Get wallet address from background
        const stateResult = await send<{ address?: string }>(INTERNAL_METHODS.GET_STATE, []);
        const walletAddress = stateResult?.address;
        if (!walletAddress) {
          const errMsg = 'No wallet address available. Please unlock your wallet first.';
          setError(errMsg);
          return { success: false, error: errMsg };
        }

        // Call WebAuthn in popup context (has window)
        const regResult = await registerHardwareWallet(
          walletAddress,
          `Rose Wallet (${walletAddress.slice(0, 8)}...)`,
          keyName || 'YubiKey'
        );

        if ('error' in regResult) {
          setError(regResult.error);
          return { success: false, error: regResult.error };
        }

        console.log('[HardwareWallet] Credential registered, prfSupported:', regResult.credential.prfSupported);
        
        // WebAuthn PRF only returns output during assertion (verification), not registration.
        // This is a spec limitation - we must do a second verification to get the PRF key.
        let prfOutput = regResult.prfOutput; // Will be undefined per WebAuthn spec
        let prfEnabled = false;

        // PRF requires verification step (second YubiKey tap) to get encryption key
        if (!prfOutput && regResult.credential.prfSupported) {
          console.log('[HardwareWallet] Step 2: Verify to get PRF encryption key...');
          const verifyResult = await verifyHardwareWallet(
            regResult.credential,
            'Enable hardware encryption'
          );
          console.log('[HardwareWallet] Verification result:', verifyResult.success, 'prfOutput:', !!verifyResult.prfOutput);
          prfOutput = verifyResult.prfOutput;
        }

        // If we have PRF output, enable vault encryption
        if (prfOutput) {
          const encryptResult = await send<{ ok?: boolean; message: string }>(
            INTERNAL_METHODS.HW_ENABLE_VAULT_ENCRYPTION,
            [Array.from(prfOutput)]
          );
          console.log('[HardwareWallet] Vault encryption result:', encryptResult);

          if (encryptResult?.ok) {
            prfEnabled = true;
            regResult.credential.prfSupported = true;
          } else {
            console.warn('[HardwareWallet] Failed to enable vault encryption:', encryptResult?.message);
          }
        }

        // Save credential to background storage (with updated prfSupported if needed)
        const saveResult = await send<{ ok?: boolean; message: string }>(
          INTERNAL_METHODS.HW_SAVE_CREDENTIAL,
          [regResult.credential]
        );

        if (!saveResult?.ok) {
          setError(saveResult.message);
          return { success: false, error: saveResult.message };
        }

        await refresh();
        return { success: true, prfEnabled };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  // Unlock vault with hardware key (YubiKey PRF) - for hardware-protected wallets
  const unlockWithHardware = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isWebAuthnSupported()) {
        const errMsg = 'WebAuthn is not supported in this browser';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      // Get credentials from background
      const credsResult = await send<{
        ok?: boolean;
        message: string;
        credentials: HardwareWalletCredential[];
      }>(INTERNAL_METHODS.HW_GET_CREDENTIALS, []);

      if (!credsResult?.ok || !credsResult.credentials?.length) {
        const errMsg = credsResult?.message || 'No hardware wallet credentials found';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      // Find a PRF-capable credential
      const prfCredential = credsResult.credentials.find(c => c.prfSupported);
      if (!prfCredential) {
        const errMsg = 'No PRF-capable hardware key found';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      // Verify with YubiKey to get PRF output
      const verifyResult = await verifyHardwareWallet(prfCredential, 'Unlock wallet');
      if (!verifyResult.success || !verifyResult.prfOutput) {
        const errMsg = verifyResult.error || 'Hardware verification failed';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      // Send PRF output to background to unlock vault
      const unlockResult = await send<{
        ok?: boolean;
        error?: string;
        address?: string;
        accounts?: unknown[];
      }>(INTERNAL_METHODS.HW_UNLOCK, [Array.from(verifyResult.prfOutput)]);

      if (!unlockResult?.ok) {
        const errMsg = unlockResult?.error || 'Hardware unlock failed';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Hardware unlock failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify with hardware wallet - WebAuthn runs in popup, returns PRF output if available
  const verify = useCallback(async (description: string): Promise<{ success: boolean; error?: string; prfOutput?: Uint8Array }> => {
    try {
      setLoading(true);
      setError(null);

      // Check WebAuthn support
      if (!isWebAuthnSupported()) {
        const errMsg = 'WebAuthn is not supported in this browser';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      // Get credentials from background
      const credsResult = await send<{
        ok?: boolean;
        message: string;
        credentials: HardwareWalletCredential[];
      }>(INTERNAL_METHODS.HW_GET_CREDENTIALS, []);

      if (!credsResult?.ok || !credsResult.credentials?.length) {
        const errMsg = credsResult?.message || 'No hardware wallet credentials found';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      // Try PRF-capable credentials first, then fall back to others
      const sortedCredentials = [...credsResult.credentials].sort(
        (a, b) => (b.prfSupported ? 1 : 0) - (a.prfSupported ? 1 : 0)
      );

      for (const credential of sortedCredentials) {
        const verifyResult = await verifyHardwareWallet(credential, description);
        if (verifyResult.success) {
          return { success: true, prfOutput: verifyResult.prfOutput };
        }
      }

      const errMsg = 'Hardware wallet verification failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove a credential
  const removeCredential = useCallback(
    async (credentialId: string) => {
      try {
        setLoading(true);
        await send(INTERNAL_METHODS.HW_REMOVE_CREDENTIAL, [credentialId]);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove credential');
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  // Disable hardware wallet (requires password to re-encrypt vault with current state)
  const disable = useCallback(
    async (password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        const result = await send<{ ok?: boolean; message?: string }>(INTERNAL_METHODS.HW_DISABLE, [
          password,
        ]);

        if (!result?.ok) {
          const errMsg = result?.message || 'Failed to disable hardware wallet';
          setError(errMsg);
          return { success: false, error: errMsg };
        }

        await refresh();
        return { success: true };
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to disable hardware wallet';
        setError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  return {
    status,
    loading,
    error,
    refresh,
    register,
    unlockWithHardware,
    verify,
    removeCredential,
    disable,
  };
}
