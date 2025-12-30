import { useState } from 'react';
import { useStore } from '../store';
import { send } from '../utils/messaging';
import { INTERNAL_METHODS } from '../../shared/constants';
import RoseLogo96 from '../assets/iris-logo-96.svg';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeOffIcon } from '../components/icons/EyeOffIcon';
import { formatWalletError } from '../utils/formatWalletError';
import { useHardwareWallet } from '../hooks/useHardwareWallet';

export function KeySettingsPasswordScreen() {
  const { navigate, setOnboardingMnemonic } = useStore();
  const { status: hwStatus, verify: verifyHardware } = useHardwareWallet();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleBack() {
    navigate('settings');
  }

  async function handleConfirm() {
    // In hardware mode, password is optional (YubiKey is required)
    // In password mode, password is required
    if (!hwStatus?.enabled && !password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let prfOutputArray: number[] | undefined;

      // If hardware wallet is configured, require YubiKey verification
      if (hwStatus?.enabled) {
        const hwResult = await verifyHardware('View recovery phrase');
        if (!hwResult.success) {
          setError(hwResult.error || 'YubiKey verification required to view recovery phrase');
          setIsLoading(false);
          return;
        }
        // Get PRF output for hardware mode verification
        if (hwResult.prfOutput) {
          prfOutputArray = Array.from(hwResult.prfOutput);
        }
      }

      // Pass password and PRF output to getMnemonic
      // - Password mode uses password for verification
      // - Hardware mode uses PRF output for verification
      const result = await send<{ ok?: boolean; mnemonic?: string; error?: string }>(
        INTERNAL_METHODS.GET_MNEMONIC,
        [password, prfOutputArray]
      );

      if (result?.error) {
        setError(formatWalletError(result.error));
        setPassword('');
      } else if (result?.mnemonic) {
        // Store mnemonic temporarily for viewing
        setOnboardingMnemonic(result.mnemonic);
        navigate('view-secret-phrase');
      }
    } catch (err) {
      setError('Failed to retrieve secret phrase');
      console.error('Failed to get mnemonic:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="w-[357px] h-[600px] flex flex-col overflow-y-auto"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 min-h-[64px]"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-8 h-8 p-2 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2"
          style={{ backgroundColor: 'transparent', color: 'var(--color-text-primary)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-800)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="m-0 text-base font-medium leading-[22px] tracking-[0.16px]">Key settings</h1>
        <div className="w-8 h-8" />
      </header>

      <div className="flex flex-1 flex-col justify-between px-4 py-8">
        {/* Content */}
        <div className="flex flex-col items-center gap-3 w-full">
          <img src={RoseLogo96} alt="Rose" className="w-24 h-24" />

          <p
            className="m-0 text-[13px] leading-[18px] tracking-[0.26px] text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {hwStatus?.enabled
              ? 'Touch your YubiKey to verify and see your keys'
              : 'Please re-enter your password to see your keys'}
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 w-full mt-8">
          {/* Hardware mode indicator */}
          {hwStatus?.enabled && (
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
                <p className="font-sans font-medium text-[var(--color-text-primary)] text-sm m-0">
                  YubiKey Required
                </p>
                <p className="font-sans text-[var(--color-text-muted)] text-xs m-0">
                  Hardware verification required to view keys
                </p>
              </div>
            </div>
          )}

          {/* Password field - only shown in password mode */}
          {!hwStatus?.enabled && (
            <div className="flex flex-col gap-[6px] w-full">
              <label className="text-[13px] leading-[18px] tracking-[0.26px] font-medium">
                Password
              </label>

              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full h-[52px] bg-transparent rounded-lg pl-3 pr-10 py-4 outline-none transition-colors text-sm leading-[18px] tracking-[0.14px] font-medium"
                  style={{
                    border: '1px solid var(--color-surface-700)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleConfirm();
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-surface-700)')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeIcon className="w-4 h-4" />
                  ) : (
                    <EyeOffIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs" style={{ color: 'var(--color-red)' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full h-12 rounded-lg text-sm font-medium leading-[18px] tracking-[0.14px] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)', color: '#000' }}
          >
            {isLoading ? 'Touch YubiKey...' : hwStatus?.enabled ? 'Verify with YubiKey' : 'Confirm'}
          </button>
        </div>

        {/* Warning */}
        <p
          className="m-0 text-[13px] leading-[18px] tracking-[0.26px] text-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Warning: Never disclose this key. Anyone with your private keys can steal any assets held
          in your account.
        </p>
      </div>
    </div>
  );
}
