/**
 * YubiKey Settings Screen
 *
 * Allows users to:
 * - Register new YubiKeys
 * - View registered credentials
 * - Test hardware verification
 * - Disable hardware wallet
 *
 * If a YubiKey is configured, it's required for ALL sensitive operations.
 */

import React, { useState } from 'react';
import { useHardwareWallet } from '../hooks/useHardwareWallet';
import { ScreenContainer } from '../components/ScreenContainer';
import { Alert } from '../components/Alert';

// Icons (inline SVG for simplicity)
const YubiKeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="17" cy="12" r="2" />
    <line x1="6" y1="10" x2="12" y2="10" />
    <line x1="6" y1="14" x2="10" y2="14" />
  </svg>
);

export function YubiKeySettingsScreen() {
  const { status, loading, error, register, verify, disable } = useHardwareWallet();

  const [keyName, setKeyName] = useState('');
  const [registering, setRegistering] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle YubiKey registration
  const handleRegister = async () => {
    setRegistering(true);
    setMessage(null);

    const result = await register(keyName || 'YubiKey');

    if (result.success) {
      setMessage({ type: 'success', text: 'YubiKey registered successfully!' });
      setKeyName('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Registration failed' });
    }

    setRegistering(false);
  };

  // Handle test verification
  const handleTestVerify = async () => {
    setVerifying(true);
    setMessage(null);

    const result = await verify('Testing YubiKey verification');

    if (result.success) {
      setMessage({ type: 'success', text: 'Verification successful! YubiKey is working.' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Verification failed' });
    }

    setVerifying(false);
  };

  // Handle disable - requires YubiKey verification first, then password
  const handleStartDisable = async () => {
    setDisabling(true);
    setMessage(null);

    // First, require YubiKey verification
    const hwResult = await verify('Disable hardware wallet protection');
    if (!hwResult.success) {
      setMessage({ type: 'error', text: hwResult.error || 'YubiKey verification required' });
      setDisabling(false);
      return;
    }

    // YubiKey verified, now show password form
    setShowDisableForm(true);
    setDisabling(false);
  };

  const handleConfirmDisable = async () => {
    if (!disablePassword) {
      setMessage({ type: 'error', text: 'Password required to disable hardware wallet' });
      return;
    }

    setDisabling(true);
    setMessage(null);

    const result = await disable(disablePassword);

    if (result.success) {
      setMessage({ type: 'success', text: 'Hardware wallet disabled.' });
      setShowDisableForm(false);
      setDisablePassword('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to disable hardware wallet' });
    }

    setDisabling(false);
  };

  return (
    <ScreenContainer>
      <div className="flex flex-col gap-6 p-4">
        {/* Status Card */}
        <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2 rounded-lg ${status?.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
            >
              <YubiKeyIcon />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">YubiKey Protection</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {status?.enabled
                  ? status?.mode === 'prf-key-wrapping'
                    ? 'Active (Key-Wrapping Mode)'
                    : 'Active (2FA Mode)'
                  : 'Not configured'}
              </p>
            </div>
          </div>

          {status?.enabled && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-[var(--color-background)] rounded-lg p-2">
                <span className="text-[var(--color-text-secondary)]">Keys: </span>
                <span className="text-[var(--color-text)] font-medium">
                  {status.credentialCount}
                </span>
              </div>
              <div className="bg-[var(--color-background)] rounded-lg p-2">
                <span className="text-[var(--color-text-secondary)]">PRF: </span>
                <span
                  className={`font-medium ${status.prfAvailable ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  {status.prfAvailable ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}

          {status?.enabled && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-3">
              YubiKey verification is required for all sensitive operations (transactions, viewing
              recovery phrase).
            </p>
          )}
        </div>

        {/* Message Alert */}
        {message && (
          <Alert type={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
        )}

        {/* Error Alert */}
        {error && !message && <Alert type="error">{error}</Alert>}

        {/* Register New YubiKey */}
        <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
          <h3 className="font-semibold text-[var(--color-text)] mb-3">
            {status?.enabled ? 'Add Another YubiKey' : 'Setup YubiKey'}
          </h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Key name (e.g., 'Primary YubiKey')"
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-secondary)]"
            />

            <button
              onClick={handleRegister}
              disabled={registering || loading}
              className="w-full py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {registering ? 'Touch your YubiKey...' : 'Register YubiKey'}
            </button>

            <p className="text-xs text-[var(--color-text-secondary)]">
              Insert your YubiKey and click the button. Setup requires <strong>two taps</strong>: one
              to create the credential, one to enable encryption. Future unlocks need only one tap.
            </p>
          </div>
        </div>

        {/* Test Verification */}
        {status?.enabled && (
          <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)] mb-3">Test Verification</h3>
            <button
              onClick={handleTestVerify}
              disabled={verifying || loading}
              className="w-full py-2.5 bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium rounded-lg hover:bg-[var(--color-border)] disabled:opacity-50 transition-colors"
            >
              {verifying ? 'Touch your YubiKey...' : 'Test YubiKey'}
            </button>
          </div>
        )}

        {/* Danger Zone */}
        {status?.enabled && (
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <h3 className="font-semibold text-red-400 mb-3">Danger Zone</h3>

            {!showDisableForm ? (
              <>
                <button
                  onClick={handleStartDisable}
                  disabled={loading || disabling}
                  className="w-full py-2.5 bg-red-500/20 text-red-400 font-medium rounded-lg hover:bg-red-500/30 disabled:opacity-50 transition-colors"
                >
                  {disabling ? 'Touch your YubiKey...' : 'Disable Hardware Wallet'}
                </button>
                <p className="text-xs text-red-400/70 mt-2">
                  Requires YubiKey verification and password to disable.
                </p>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  YubiKey verified
                </div>
                <p className="text-sm text-red-400">
                  Now enter your password to re-encrypt the vault.
                </p>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={e => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-red-500/30 rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-red-500/50"
                  disabled={disabling}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDisableForm(false);
                      setDisablePassword('');
                    }}
                    disabled={disabling}
                    className="flex-1 py-2 bg-[var(--color-surface)] text-[var(--color-text)] font-medium rounded-lg hover:bg-[var(--color-surface-hover)] disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDisable}
                    disabled={disabling || !disablePassword}
                    className="flex-1 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {disabling ? 'Disabling...' : 'Confirm Disable'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {!status?.enabled && (
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <h4 className="font-medium text-blue-400 mb-2">Why use a YubiKey?</h4>
            <ul className="text-sm text-[var(--color-text-secondary)] space-y-1.5">
              <li>
                • <strong>Physical security</strong> - Requires physical key presence
              </li>
              <li>
                • <strong>Phishing protection</strong> - Keys are bound to origin
              </li>
              <li>
                • <strong>PIN protection</strong> - Additional layer of security
              </li>
              <li>
                • <strong>Key-wrapping</strong> - Seed encrypted with hardware key
              </li>
            </ul>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}

export default YubiKeySettingsScreen;
