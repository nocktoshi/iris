import { useState } from 'react';
import { useStore } from '../store';
import ArrowLeftIcon from '../assets/arrow-left-icon.svg';
import LockIcon from '../assets/lock-icon-yellow.svg';

/**
 * ViewSecretPhraseScreen - Display user's 24-word recovery phrase
 * Shows mnemonic seed phrase with security warnings and reveal functionality
 */
export function ViewSecretPhraseScreen() {
  const { navigate, onboardingMnemonic, setOnboardingMnemonic } = useStore();
  const [isRevealed, setIsRevealed] = useState(false);

  // Get seed phrase from temporary store (set by KeySettingsPasswordScreen)
  const seedPhrase = onboardingMnemonic ? onboardingMnemonic.split(' ') : [];

  function handleBack() {
    // Clear mnemonic from memory when leaving screen
    setOnboardingMnemonic(null);
    navigate('settings');
  }

  function handleReveal() {
    setIsRevealed(true);
  }

  function handleDownloadKeyfile() {
    // TODO: Implement keyfile download
    console.log('Download keyfile');
  }

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 min-h-[64px] bg-white">
        <button
          className="w-8 h-8 flex items-center justify-center p-2 hover:opacity-70 transition-opacity"
          onClick={handleBack}
        >
          <img src={ArrowLeftIcon} alt="Back" className="w-4 h-4" />
        </button>
        <h1 className="font-sans font-medium text-base text-fn-ink tracking-[0.16px] leading-[22px]">
          View secret phrase
        </h1>
        <div className="w-8 h-8" />
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between pt-2 pb-0">
        <div className="px-4 flex flex-col gap-6">
          {/* Title Section */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={LockIcon} alt="Lock" className="w-full h-full" />
            </div>
            <div className="flex flex-col gap-2 text-center w-full">
              <h2 className="font-display font-medium text-2xl text-fn-ink tracking-[-0.48px] leading-7">
                View secret phrase
              </h2>
              <p className="font-sans font-normal text-[13px] text-fn-sub tracking-[0.26px] leading-[18px]">
                Make sure no one is looking at your screen
              </p>
            </div>
          </div>

          {/* Download Keyfile Link */}
          <button
            onClick={handleDownloadKeyfile}
            className="font-sans font-medium text-sm text-fn-ink tracking-[0.14px] leading-[18px] text-center underline hover:opacity-70 transition-opacity"
          >
            Download keyfile
          </button>

          {/* Seed Phrase Grid */}
          <div className="relative flex flex-col gap-2">
            {/* 12 rows of 2 words each */}
            {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((startIndex) => (
              <div key={startIndex} className="flex gap-2">
                {/* Left word */}
                <div className="flex-1 bg-white border border-[#F2F2F0] rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2.5 p-2">
                    <div className="w-7 h-7 bg-[#F2F2F0] rounded flex items-center justify-center flex-shrink-0">
                      <span className="font-sans font-medium text-sm text-fn-ink tracking-[0.14px] leading-[18px]">
                        {startIndex + 1}
                      </span>
                    </div>
                    <span className="font-sans font-medium text-sm text-fn-ink tracking-[0.14px] leading-[18px] flex-1">
                      {seedPhrase[startIndex]}
                    </span>
                  </div>
                </div>

                {/* Right word */}
                <div className="flex-1 bg-white border border-[#F2F2F0] rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2.5 p-2">
                    <div className="w-7 h-7 bg-[#F2F2F0] rounded flex items-center justify-center flex-shrink-0">
                      <span className="font-sans font-medium text-sm text-fn-ink tracking-[0.14px] leading-[18px]">
                        {startIndex + 2}
                      </span>
                    </div>
                    <span className="font-sans font-medium text-sm text-fn-ink tracking-[0.14px] leading-[18px] flex-1">
                      {seedPhrase[startIndex + 1]}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Blur Overlay */}
            {!isRevealed && (
              <div className="absolute inset-0 backdrop-blur-[6px] bg-white/40 border border-[#F2F2F0] rounded-lg" />
            )}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="border-t border-[#EBEBE9] bg-white px-4 py-3">
          <button
            onClick={handleReveal}
            disabled={isRevealed}
            className={`w-full h-12 rounded-lg font-sans font-medium text-sm tracking-[0.14px] leading-[18px] transition-opacity ${
              isRevealed
                ? 'bg-fn-ink/50 text-white cursor-not-allowed'
                : 'bg-fn-ink text-white hover:opacity-90'
            }`}
          >
            {isRevealed ? 'Seed phrase revealed' : 'Show seed phrase'}
          </button>
        </div>
      </div>
    </div>
  );
}
