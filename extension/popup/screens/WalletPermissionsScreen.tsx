import { useStore } from '../store';
import { useState, useEffect } from 'react';
import { STORAGE_KEYS, INTERNAL_METHODS } from '../../shared/constants';
import { send } from '../utils/messaging';
import FortNockLogo from '../assets/fort-nock-logo.svg';
import CloseIcon from '../assets/close-x-icon.svg';

export function WalletPermissionsScreen() {
  const { navigate } = useStore();
  const [approvedOrigins, setApprovedOrigins] = useState<string[]>([]);

  useEffect(() => {
    loadApprovedOrigins();
  }, []);

  async function loadApprovedOrigins() {
    const stored = await chrome.storage.local.get([STORAGE_KEYS.APPROVED_ORIGINS]);
    const origins = stored[STORAGE_KEYS.APPROVED_ORIGINS] || [];
    setApprovedOrigins(origins);
  }

  function handleClose() {
    navigate('settings');
  }

  async function handleRevoke(origin: string) {
    try {
      await send(INTERNAL_METHODS.REVOKE_ORIGIN, [{ origin }]);
      await loadApprovedOrigins();
    } catch (error) {
      console.error('Failed to revoke origin:', error);
    }
  }

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 min-h-[64px] bg-white">
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <img src={FortNockLogo} alt="Fort Nock" className="w-6 h-6" />
        </div>
        <h1 className="m-0 text-base font-medium leading-[22px] tracking-[0.16px]">
          Wallet permissions
        </h1>
        <button
          type="button"
          onClick={handleClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 shrink-0"
          aria-label="Close"
        >
          <img src={CloseIcon} alt="" className="w-4 h-4" />
        </button>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-2 h-[536px] overflow-y-auto">
        <div className="flex flex-col gap-2 px-4 py-2">
          {approvedOrigins && approvedOrigins.length > 0 ? (
            approvedOrigins.map(origin => (
              <div
                key={origin}
                className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-[#F2F2F0]"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {/* Site icon placeholder (first letter) */}
                    <div className="w-5 h-5 flex items-center justify-center text-[12px] font-semibold text-[#707070]">
                      {origin.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-sm font-medium leading-[18px] tracking-[0.14px] truncate">
                    {origin}
                  </span>
                </div>

                <button
                  type="button"
                  title="Revoke permissions"
                  onClick={() => handleRevoke(origin)}
                  className="w-8 h-8 bg-[#FFE5E3] rounded-lg flex items-center justify-center p-1.5 transition-colors hover:bg-[#FFD0CC] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 shrink-0"
                >
                  <img
                    src={CloseIcon}
                    alt="Revoke"
                    className="w-4 h-4 filter [filter:brightness(0)_saturate(100%)_invert(29%)_sepia(96%)_saturate(2447%)_hue-rotate(347deg)_brightness(92%)_contrast(93%)]"
                  />
                </button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center text-center px-4 py-10">
              <p className="m-0 text-sm font-normal leading-[18px] tracking-[0.14px] text-[#707070]">
                No connected sites
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
