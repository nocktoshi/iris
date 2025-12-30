/**
 * Locked Screen - Unlock wallet with password or YubiKey
 */

import { useState, useEffect } from 'react';
import { INTERNAL_METHODS, ERROR_CODES } from '../../../shared/constants';
import { useStore } from '../../store';
import { send } from '../../utils/messaging';
import { formatWalletError } from '../../utils/formatWalletError';
import { Alert } from '../../components/Alert';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EyeIcon } from '../../components/icons/EyeIcon';
import { EyeOffIcon } from '../../components/icons/EyeOffIcon';
import { useHardwareWallet } from '../../hooks/useHardwareWallet';
import vectorLeft from '../../assets/vector-left.svg';
import vectorRight from '../../assets/vector-right.svg';
import vectorTopRight from '../../assets/vector-top-right.svg';
import vectorTopRightRotated from '../../assets/vector-top-right-rotated.svg';
import vectorBottomLeft from '../../assets/vector-bottom-left.svg';
import RoseLogo from '../../../icons/rose.svg';

export function LockedScreen() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hardwareRequired, setHardwareRequired] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const { unlockWithHardware } = useHardwareWallet();
  const {
    navigate,
    syncWallet,
    wallet,
    fetchBalance,
    pendingConnectRequest,
    pendingTransactionRequest,
    pendingSignRequest,
    pendingSignRawTxRequest,
  } = useStore();

  // Check if hardware unlock is required
  useEffect(() => {
    async function checkHardwareRequired() {
      const state = await send<{ hardwareRequired?: boolean }>(INTERNAL_METHODS.GET_STATE, []);
      setHardwareRequired(state?.hardwareRequired ?? false);
    }
    checkHardwareRequired();
  }, []);

  // Navigate after successful unlock
  async function onUnlockSuccess(result: {
    address?: string;
    accounts?: Array<{ name: string; address: string; index: number }>;
    currentAccount?: { name: string; address: string; index: number };
  }) {
    const accounts = result.accounts || [];
    const currentAccount = result.currentAccount || accounts[0] || null;

    // Load cached balances from storage
    const { STORAGE_KEYS } = await import('../../../shared/constants');
    const stored = await chrome.storage.local.get([STORAGE_KEYS.CACHED_BALANCES]);
    const cachedBalances = (stored[STORAGE_KEYS.CACHED_BALANCES] || {}) as Record<string, number>;
    const cachedBalance = currentAccount ? (cachedBalances[currentAccount.address] ?? 0) : 0;

    syncWallet({
      ...wallet,
      locked: false,
      address: result.address || null,
      accounts,
      currentAccount,
      balance: cachedBalance,
      availableBalance: cachedBalance,
      accountBalances: cachedBalances,
    });

    // Trigger balance fetch after successful unlock
    fetchBalance();

    // Navigate to pending approval if one exists, otherwise go home
    if (pendingConnectRequest) {
      navigate('connect-approval');
    } else if (pendingTransactionRequest) {
      navigate('approve-transaction');
    } else if (pendingSignRequest) {
      navigate('sign-message');
    } else if (pendingSignRawTxRequest) {
      navigate('approve-sign-raw-tx');
    } else {
      navigate('home');
    }
  }

  async function handleUnlock() {
    // Clear previous errors
    setError('');

    if (!password) {
      setError('Please enter a password');
      return;
    }

    const result = await send<{
      ok?: boolean;
      address?: string;
      accounts?: Array<{ name: string; address: string; index: number }>;
      currentAccount?: { name: string; address: string; index: number };
      error?: string;
    }>(INTERNAL_METHODS.UNLOCK, [password]);

    if (result?.error) {
      // Check if hardware unlock is required
      if (result.error === ERROR_CODES.HARDWARE_REQUIRED) {
        setHardwareRequired(true);
        setError('YubiKey required to unlock. Touch your YubiKey below.');
      } else {
        setError(formatWalletError(result.error));
      }
      setPassword(''); // Clear password on error
    } else {
      setPassword('');
      await onUnlockSuccess(result);
    }
  }

  async function handleHardwareUnlock() {
    setError('');
    setUnlocking(true);

    try {
      const hwResult = await unlockWithHardware();
      
      if (!hwResult.success) {
        setError(hwResult.error || 'Hardware unlock failed');
        setUnlocking(false);
        return;
      }

      // Get updated state after hardware unlock
      const state = await send<{
        address?: string;
        accounts?: Array<{ name: string; address: string; index: number }>;
        currentAccount?: { name: string; address: string; index: number };
      }>(INTERNAL_METHODS.GET_STATE, []);

      await onUnlockSuccess(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hardware unlock failed');
    } finally {
      setUnlocking(false);
    }
  }

  function handleResetWallet() {
    setShowResetConfirm(true);
  }

  async function confirmResetWallet() {
    // Reset the wallet via the background service
    const result = await send<{ ok?: boolean }>(INTERNAL_METHODS.RESET_WALLET, []);

    if (result?.ok) {
      // Navigate to onboarding start
      navigate('onboarding-start');
      setShowResetConfirm(false);
    }
  }

  function cancelResetWallet() {
    setShowResetConfirm(false);
  }

  return (
    <div className="relative w-[357px] h-[600px] bg-[var(--color-bg)] overflow-hidden">
      {/* Decorative vector elements - final positioning */}
      {/* Top-left curved wave */}
      <img
        src={vectorLeft}
        alt=""
        className="absolute left-[-14px] top-[93px] w-[89px] h-[70px]"
        aria-hidden="true"
      />
      {/* Top-right curved line */}
      <img
        src={vectorTopRight}
        alt=""
        className="absolute left-[303px] top-[168px] w-[80px] h-[45px]"
        aria-hidden="true"
      />
      {/* Top-right rotated icon - partially off-screen at top */}
      <img
        src={vectorTopRightRotated}
        alt=""
        className="absolute left-[247px] top-[-19px] w-[63px] h-[67px]"
        style={{ transform: 'rotate(24.65deg)' }}
        aria-hidden="true"
      />
      {/* Bottom-right icon */}
      <img
        src={vectorRight}
        alt=""
        className="absolute left-[287px] top-[395px] w-[49px] h-[79px]"
        aria-hidden="true"
      />
      {/* Bottom-left icon */}
      <img
        src={vectorBottomLeft}
        alt=""
        className="absolute left-[-11px] top-[414px] w-[64px] h-[64px]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col justify-between h-full px-4 py-8 z-10">
        {/* Main content */}
        <div className="flex flex-col gap-8 w-full">
          {/* Logo and heading */}
          <div className="flex flex-col items-center gap-3 w-full">
            <img src={RoseLogo} alt="Rose Wallet" className="w-[104px] h-[104px]" />
            <div className="flex flex-col gap-2 items-center text-center w-full">
              <h1
                className="font-serif font-medium text-[var(--color-text-primary)]"
                style={{
                  fontSize: 'var(--font-size-xl)',
                  lineHeight: 'var(--line-height-relaxed)',
                  letterSpacing: '-0.02em',
                }}
              >
                Rose Wallet
              </h1>
              <p
                className="font-sans text-[var(--color-text-muted)]"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 'var(--line-height-snug)',
                  letterSpacing: '0.02em',
                }}
              >
                Nock On.
              </p>
            </div>
          </div>

          {/* Unlock options */}
          <div className="flex flex-col gap-4 w-full">
            {/* YubiKey unlock - shown when hardware is required */}
            {hardwareRequired && (
              <div className="flex flex-col gap-3 w-full">
                <div className="bg-[var(--color-surface-700)]/30 rounded-lg p-3 flex items-center gap-3">
                  <div className="p-2 bg-[var(--color-primary)]/20 rounded-lg">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[var(--color-primary)]" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="17" cy="12" r="2" />
                      <line x1="6" y1="10" x2="12" y2="10" />
                      <line x1="6" y1="14" x2="10" y2="14" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-sans font-medium text-[var(--color-text-primary)] text-sm">
                      YubiKey Required
                    </p>
                    <p className="font-sans text-[var(--color-text-muted)] text-xs">
                      Touch your YubiKey to unlock
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleHardwareUnlock}
                  disabled={unlocking}
                  className="w-full h-12 px-5 py-[15px] btn-secondary text-[var(--color-bg)] rounded-lg flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 500,
                    lineHeight: 'var(--line-height-snug)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {unlocking ? 'Touch your YubiKey...' : 'Unlock with YubiKey'}
                </button>
              </div>
            )}

            {/* Password unlock - shown when hardware is NOT required */}
            {!hardwareRequired && (
              <>
                <div className="flex flex-col gap-1.5 w-full">
                  <label
                    className="font-sans font-medium text-[var(--color-text-primary)]"
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      lineHeight: 'var(--line-height-snug)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Password
                  </label>
                  <div className="bg-[var(--color-bg)] border border-[var(--color-surface-700)] rounded-lg p-3 flex items-center gap-2.5 h-[52px]">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                      placeholder="Enter your password"
                      autoFocus
                      className="flex-1 bg-transparent font-sans font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none"
                      style={{
                        fontSize: 'var(--font-size-base)',
                        lineHeight: 'var(--line-height-snug)',
                        letterSpacing: '0.01em',
                      }}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Unlock button */}
                <button
                  onClick={handleUnlock}
                  className="w-full h-12 px-5 py-[15px] btn-secondary text-[var(--color-bg)] rounded-lg flex items-center justify-center transition-opacity hover:opacity-90"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 500,
                    lineHeight: 'var(--line-height-snug)',
                    letterSpacing: '0.01em',
                  }}
                >
                  Unlock
                </button>
              </>
            )}

            {/* Error message */}
            {error && <Alert type="error">{error}</Alert>}
          </div>
        </div>

        {/* Bottom text with reset link */}
        <div className="flex flex-col gap-3 items-center text-center w-full">
          <p
            className="font-sans text-[var(--color-text-muted)]"
            style={{
              fontSize: 'var(--font-size-sm)',
              lineHeight: 'var(--line-height-snug)',
              letterSpacing: '0.02em',
            }}
          >
            Can't login? You can delete your current wallet and create a new one
          </p>
          <button
            onClick={handleResetWallet}
            className="font-sans font-medium text-[var(--color-text-primary)] underline hover:opacity-80"
            style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 'var(--line-height-snug)',
              letterSpacing: '0.01em',
            }}
          >
            Reset wallet
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset wallet"
        message="This will delete your current wallet and all data. You will need to create a new wallet or import an existing one."
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={confirmResetWallet}
        onCancel={cancelResetWallet}
        variant="danger"
      />
    </div>
  );
}
