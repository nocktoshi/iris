import { useStore } from '../store';
import { useTheme } from '../contexts/ThemeContext';
import ArrowLeftIcon from '../assets/arrow-left-icon.svg';

export function ThemeSettingsScreen() {
  const { navigate } = useStore();
  const { theme, setTheme } = useTheme();

  function handleBack() {
    navigate('settings');
  }
  function handleThemeSelect(newTheme: 'light' | 'dark') {
    setTheme(newTheme);
  }

  const Option = ({
    label,
    selected,
    onClick,
    disabled = false,
  }: {
    label: string;
    selected?: boolean;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-between p-3 rounded-lg transition-colors text-left w-full ${
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:bg-[#E5E5E3] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20'
      }`}
      role="radio"
      aria-checked={!!selected}
    >
      <span className="text-sm font-medium leading-[18px] tracking-[0.14px] flex-1">{label}</span>
      <span
        className={`w-6 h-6 rounded-full border border-[#DADAD8] bg-white flex items-center justify-center shrink-0 transition-all ${
          selected ? 'bg-[#FFC413] border-[#FFC413]' : ''
        }`}
      >
        {selected && <span className="w-3 h-3 rounded-full bg-black" />}
      </span>
    </button>
  );

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 min-h-[64px] bg-white">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-8 h-8 bg-transparent rounded-lg p-2 flex items-center justify-center shrink-0 transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <img src={ArrowLeftIcon} alt="" className="w-4 h-4" />
        </button>
        <h1 className="m-0 text-base font-medium leading-[22px] tracking-[0.16px]">
          Theme settings
        </h1>
        <div className="w-8 h-8 shrink-0" />
      </header>

      {/* Options */}
      <div className="flex flex-col gap-2 px-3 py-2" role="radiogroup" aria-label="Theme">
        <Option
          label="Light"
          selected={theme === 'light'}
          onClick={() => handleThemeSelect('light')}
        />
        <Option
          label="Dark"
          selected={theme === 'dark'}
          onClick={() => handleThemeSelect('dark')}
        />
        {/* System (placeholder) */}
        <Option label="System" selected={false} disabled />
      </div>
    </div>
  );
}
