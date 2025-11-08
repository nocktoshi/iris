import { useStore } from '../store';
import FortNockLogo from '../assets/fort-nock-logo.svg';
import ThemeIcon from '../assets/theme-icon.svg';
import KeyIcon from '../assets/key-icon.svg';
import ClockIcon from '../assets/clock-icon.svg';
import ArrowRightIcon from '../assets/arrow-right-icon.svg';
import CloseIcon from '../assets/close-x-icon.svg';
import AboutIcon from '../assets/settings-gear-icon.svg';

export function SettingsScreen() {
  const { navigate } = useStore();

  function handleClose() {
    navigate('home');
  }
  function handleThemeSettings() {
    navigate('theme-settings');
  }
  function handleKeySettings() {
    navigate('key-settings');
  }
  function handleLockTime() {
    navigate('lock-time');
  }
  function handleAbout() {
    navigate('about');
  }

  const Row = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
    >
      <div className="flex items-center gap-2.5 flex-1">
        <div className="w-8 h-8 bg-[#EBEBE9] rounded-lg flex items-center justify-center shrink-0">
          <img src={icon} alt="" className="w-5 h-5 object-contain" />
        </div>
        <span className="text-sm font-medium leading-[18px] tracking-[0.14px] text-black">
          {label}
        </span>
      </div>
      <div className="w-4 h-4 p-1 shrink-0">
        <img src={ArrowRightIcon} alt="" className="w-4 h-4" />
      </div>
    </button>
  );

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 min-h-[64px] bg-white">
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <img src={FortNockLogo} alt="Fort Nock" className="w-6 h-6" />
        </div>
        <h1 className="m-0 text-base font-medium leading-[22px] tracking-[0.16px]">Settings</h1>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 shrink-0"
        >
          <img src={CloseIcon} alt="" className="w-4 h-4" />
        </button>
      </header>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 h-[536px]">
        {/* Menu */}
        <div className="flex flex-col gap-2 px-3 py-2">
          <Row icon={ThemeIcon} label="Theme settings" onClick={handleThemeSettings} />
          <Row icon={KeyIcon} label="Key settings" onClick={handleKeySettings} />
          <Row icon={ClockIcon} label="Lock time" onClick={handleLockTime} />
          <Row icon={AboutIcon} label="About" onClick={handleAbout} />
        </div>

        {/* Footer */}
        <div className="px-4">
          <div className="flex flex-col items-center justify-center gap-2 py-4 border-t border-[#EBEBE9]">
            <p className="m-0 text-[12px] leading-4 tracking-[0.24px] text-[#707070] text-center">
              Version 1.0.0
            </p>
            <p className="m-0 text-[12px] leading-4 tracking-[0.24px] text-[#707070] text-center">
              Extension ID: nock_wallet_v1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
