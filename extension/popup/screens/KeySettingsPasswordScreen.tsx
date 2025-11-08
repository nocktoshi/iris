import { useState } from 'react';
import { useStore } from '../store';
import { send } from '../utils/messaging';
import { INTERNAL_METHODS, ERROR_CODES } from '../../shared/constants';
import FortNockLogo96 from '../assets/fort-nock-logo-96.svg';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeOffIcon } from '../components/icons/EyeOffIcon';

export function KeySettingsPasswordScreen() {
  const { navigate, setOnboardingMnemonic } = useStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await send<{ ok?: boolean; mnemonic?: string; error?: string }>(
        INTERNAL_METHODS.GET_MNEMONIC,
        [password]
      );

      if (result?.error) {
        setError(
          result.error === ERROR_CODES.BAD_PASSWORD
            ? 'Incorrect password'
            : `Error: ${result.error}`
        );
        setPassword('');
      } else if (result?.mnemonic) {
        // Store mnemonic temporarily for viewing
        setOnboardingMnemonic(result.mnemonic);
        navigate('view-secret-phrase');
      }
    } catch (err) {
      setError('Failed to retrieve seed phrase');
      console.error('Failed to get mnemonic:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black overflow-y-auto">
      <div className="flex h-full flex-col justify-between px-4 py-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 w-full">
          <img src={FortNockLogo96} alt="Fort Nock" className="w-24 h-24" />

          <div className="flex flex-col items-center gap-2 w-full">
            <h1 className="m-0 text-2xl font-medium leading-7 tracking-[-0.48px] text-center font-display">
              Key settings
            </h1>
            <p className="m-0 text-[13px] leading-[18px] tracking-[0.26px] text-[#707070] text-center">
              Please re-enter your password to see your keys
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 w-full mt-8">
          <div className="flex flex-col gap-[6px] w-full">
            <label className="text-[13px] leading-[18px] tracking-[0.26px] font-medium">
              Password
            </label>

            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full h-[52px] bg-transparent border border-[#DADAD8] rounded-lg pl-3 pr-10 py-4 outline-none transition-colors text-sm leading-[18px] tracking-[0.14px] font-medium placeholder:text-[#AAAAAA] focus:border-[#FFC413]"
                placeholder="Enter your password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirm();
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center text-[#707070] hover:text-black transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeIcon className="w-4 h-4" />
                ) : (
                  <EyeOffIcon className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full h-12 bg-black text-white rounded-lg text-sm font-medium leading-[18px] tracking-[0.14px] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Confirm'}
          </button>
        </div>

        {/* Warning */}
        <p className="m-0 text-[13px] leading-[18px] tracking-[0.26px] text-[#707070] text-center">
          Warning: Never disclose this key. Anyone with your private keys can steal any assets held
          in your account.
        </p>
      </div>
    </div>
  );
}
