import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { send } from '../utils/messaging';
import { INTERNAL_METHODS } from '../../shared/constants';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';

// Icons
import WalletStyle1 from '../assets/wallet-icon-style-1.svg';
import WalletStyle2 from '../assets/wallet-icon-style-2.svg';
import WalletStyle3 from '../assets/wallet-icon-style-3.svg';
import WalletStyle4 from '../assets/wallet-icon-style-4.svg';
import WalletStyle5 from '../assets/wallet-icon-style-5.svg';
import WalletStyle6 from '../assets/wallet-icon-style-6.svg';
import WalletStyle7 from '../assets/wallet-icon-style-7.svg';
import WalletStyle8 from '../assets/wallet-icon-style-8.svg';
import WalletStyle9 from '../assets/wallet-icon-style-9.svg';
import WalletStyle10 from '../assets/wallet-icon-style-10.svg';
import WalletStyle11 from '../assets/wallet-icon-style-11.svg';
import WalletStyle12 from '../assets/wallet-icon-style-12.svg';
import WalletStyle13 from '../assets/wallet-icon-style-13.svg';
import WalletStyle14 from '../assets/wallet-icon-style-14.svg';
import WalletStyle15 from '../assets/wallet-icon-style-15.svg';

export function WalletStylingScreen() {
  const { navigate, wallet, syncWallet } = useStore();

  // Get current account
  const currentAccount = wallet.currentAccount || wallet.accounts[0];

  // Load initial values from current account or use defaults
  const [selectedStyle, setSelectedStyle] = useState(currentAccount?.iconStyleId || 1);
  const [selectedColor, setSelectedColor] = useState(currentAccount?.iconColor || '#FFC413');
  const [svgContent, setSvgContent] = useState<string>('');

  const iconStyles = [
    { id: 1, icon: WalletStyle1 },
    { id: 2, icon: WalletStyle2 },
    { id: 3, icon: WalletStyle3 },
    { id: 4, icon: WalletStyle4 },
    { id: 5, icon: WalletStyle5 },
    { id: 6, icon: WalletStyle6 },
    { id: 7, icon: WalletStyle7 },
    { id: 8, icon: WalletStyle8 },
    { id: 9, icon: WalletStyle9 },
    { id: 10, icon: WalletStyle10 },
    { id: 11, icon: WalletStyle11 },
    { id: 12, icon: WalletStyle12 },
    { id: 13, icon: WalletStyle13 },
    { id: 14, icon: WalletStyle14 },
    { id: 15, icon: WalletStyle15 },
  ];

  const colors = [
    '#FFC413',
    '#EF5A2C',
    '#7B00FF',
    '#CE8A1D',
    '#96B839',
    '#228937',
    '#47AE9D',
    '#2CCEEF',
    '#EF2C2F',
    '#EF2CB1',
    '#3C2CEF',
    '#2C9AEF',
    '#2C6AEF',
  ];

  // Sync state when current account changes
  useEffect(() => {
    if (currentAccount) {
      setSelectedStyle(currentAccount.iconStyleId || 1);
      setSelectedColor(currentAccount.iconColor || '#FFC413');
    }
  }, [currentAccount?.index]);

  // Load and modify SVG based on selected style and color
  useEffect(() => {
    const selectedIcon = iconStyles.find(s => s.id === selectedStyle);
    if (!selectedIcon) return;

    fetch(selectedIcon.icon)
      .then(res => res.text())
      .then(text => {
        // Replace CSS var `--fill-0` with the chosen color
        const modifiedSvg = text.replace(/var\(--fill-0,\s*#[A-Fa-f0-9]{6}\)/g, selectedColor);
        setSvgContent(modifiedSvg);
      })
      .catch(err => console.error('Failed to load SVG:', err));
  }, [selectedStyle, selectedColor]);

  // Persist styling changes
  async function handleStyleChange(styleId: number) {
    if (!currentAccount) return;

    setSelectedStyle(styleId);

    const result = await send<{ ok?: boolean; error?: string }>(
      INTERNAL_METHODS.UPDATE_ACCOUNT_STYLING,
      [currentAccount.index, styleId, selectedColor]
    );

    if (result?.ok) {
      // Update wallet state
      const updatedAccounts = wallet.accounts.map(acc =>
        acc.index === currentAccount.index
          ? { ...acc, iconStyleId: styleId, iconColor: selectedColor }
          : acc
      );
      const updatedCurrentAccount = { ...currentAccount, iconStyleId: styleId, iconColor: selectedColor };

      syncWallet({
        ...wallet,
        accounts: updatedAccounts,
        currentAccount: updatedCurrentAccount,
      });
    } else if (result?.error) {
      console.error('Failed to update styling:', result.error);
    }
  }

  async function handleColorChange(color: string) {
    if (!currentAccount) return;

    setSelectedColor(color);

    const result = await send<{ ok?: boolean; error?: string }>(
      INTERNAL_METHODS.UPDATE_ACCOUNT_STYLING,
      [currentAccount.index, selectedStyle, color]
    );

    if (result?.ok) {
      // Update wallet state
      const updatedAccounts = wallet.accounts.map(acc =>
        acc.index === currentAccount.index
          ? { ...acc, iconStyleId: selectedStyle, iconColor: color }
          : acc
      );
      const updatedCurrentAccount = { ...currentAccount, iconStyleId: selectedStyle, iconColor: color };

      syncWallet({
        ...wallet,
        accounts: updatedAccounts,
        currentAccount: updatedCurrentAccount,
      });
    } else if (result?.error) {
      console.error('Failed to update styling:', result.error);
    }
  }

  function handleBack() {
    navigate('wallet-settings');
  }

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 min-h-[64px] bg-white">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-8 h-8 p-2 flex items-center justify-center rounded-lg transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <h1 className="m-0 text-base font-medium leading-[22px] tracking-[0.16px]">Styling</h1>
        <div className="w-8 h-8" />
      </header>

      {/* Content */}
      <div className="flex flex-col gap-4 h-[536px] pt-4 items-center">
        {/* Preview */}
        <div className="flex items-center justify-center shrink-0">
          <div className="w-24 h-24 block" dangerouslySetInnerHTML={{ __html: svgContent }} />
        </div>

        {/* Selection grid */}
        <div className="flex gap-3 px-4 py-3 flex-1 w-full min-h-0">
          {/* Icon styles */}
          <div className="flex-1 bg-[#F2F2F0] border border-[#F2F2F0] rounded-lg p-2 overflow-y-auto min-w-0">
            <div className="grid grid-cols-3 gap-2">
              {iconStyles.map(style => {
                const selected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleStyleChange(style.id)}
                    className={`flex items-center justify-center p-2 bg-white border rounded-lg transition-colors hover:bg-[#F8F8F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
                      selected ? 'border-black' : 'border-transparent'
                    } aspect-square`}
                    aria-pressed={selected}
                  >
                    <img src={style.icon} alt={`Style ${style.id}`} className="w-10 h-10" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color options */}
          <div className="shrink-0 bg-[#F2F2F0] border border-[#F2F2F0] rounded-lg p-2 overflow-y-auto">
            <div className="flex flex-col gap-2 items-center">
              {colors.map(color => {
                const selected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={`w-12 h-12 flex items-center justify-center bg-white border rounded-lg p-0 transition-colors hover:bg-[#F8F8F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
                      selected ? 'border-black' : 'border-transparent'
                    }`}
                    aria-label={`Color ${color}`}
                    aria-pressed={selected}
                  >
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
