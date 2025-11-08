import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { send } from '../utils/messaging';
import { INTERNAL_METHODS } from '../../shared/constants';
import { AccountIcon } from '../components/AccountIcon';
import CloseIcon from '../assets/close-x-icon.svg';
import UserAccountIcon from '../assets/user-account-icon.svg';
import ThemeIcon from '../assets/theme-icon.svg';
import ArrowRightIcon from '../assets/arrow-right-icon.svg';
import CopyIcon from '../assets/copy-icon.svg';
import TrashBinIcon from '../assets/trash-bin-icon.svg';
import CheckmarkIcon from '../assets/checkmark-pencil-icon.svg';

export function WalletSettingsScreen() {
  const { navigate, wallet, syncWallet } = useStore();

  // Get current account from vault
  const currentAccount = wallet.currentAccount || wallet.accounts[0];
  const walletName = currentAccount?.name || 'Wallet';
  const walletAddress = currentAccount?.address || '';

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(walletName);
  const [copySuccess, setCopySuccess] = useState(false);

  // TODO: Get actual creation date from storage/metadata when available
  const walletCreatedDate = 'November 1, 2025 at 09:48';

  // Keep editedName in sync with current account name
  useEffect(() => {
    setEditedName(walletName);
  }, [walletName]);

  function handleClose() {
    navigate('home');
  }
  function handleStyling() {
    navigate('wallet-styling');
  }
  function handleEditName() {
    setIsEditingName(true);
    setEditedName(walletName);
  }

  async function handleSaveName() {
    if (!editedName.trim() || !currentAccount) {
      setIsEditingName(false);
      return;
    }

    // Call the vault to rename the account
    const result = await send<{ ok?: boolean; error?: string }>(
      INTERNAL_METHODS.RENAME_ACCOUNT,
      [currentAccount.index, editedName.trim()]
    );

    if (result?.ok) {
      // Update wallet state with new name
      const updatedAccounts = wallet.accounts.map(acc =>
        acc.index === currentAccount.index ? { ...acc, name: editedName.trim() } : acc
      );
      const updatedCurrentAccount = { ...currentAccount, name: editedName.trim() };

      syncWallet({
        ...wallet,
        accounts: updatedAccounts,
        currentAccount: updatedCurrentAccount,
      });

      setIsEditingName(false);
    } else if (result?.error) {
      alert(`Failed to rename account: ${result.error}`);
      setIsEditingName(false);
    }
  }
  function handleNameInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditedName(e.target.value);
  }
  function handleNameInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditedName(walletName);
    }
  }
  async function handleCopyAddress() {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }
  function handleRemoveWallet() {
    console.log('Remove wallet');
  }

  const addressStart = walletAddress.slice(0, 6);
  const addressMiddle = walletAddress.slice(6, -5);
  const addressEnd = walletAddress.slice(-5);

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 min-h-[64px] bg-white">
        <div className="w-8 h-8 flex items-center justify-center">
          <AccountIcon
            styleId={currentAccount?.iconStyleId}
            color={currentAccount?.iconColor}
            className="w-6 h-6"
          />
        </div>

        <h1 className="m-0 text-base font-medium leading-[22px] tracking-[0.16px]">{walletName}</h1>

        <button
          type="button"
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          aria-label="Close"
        >
          <img src={CloseIcon} alt="" className="w-4 h-4" />
        </button>
      </header>

      {/* Content */}
      <div className="flex flex-col justify-between h-[536px] bg-white">
        <div className="flex flex-col gap-4 px-4 py-2">
          {/* Settings Options */}
          <div className="flex flex-col gap-2">
            {/* Account Name */}
            <div className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-[#F2F2F0]">
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#EBEBE9]">
                  <img src={UserAccountIcon} alt="Account" className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium leading-[18px] tracking-[0.14px]">
                  Account name
                </div>
              </div>

              {isEditingName ? (
                <div className="flex items-center gap-2 border border-[#DADAD8] rounded-lg px-2 py-1.5">
                  <input
                    type="text"
                    value={editedName}
                    onChange={handleNameInputChange}
                    onKeyDown={handleNameInputKeyDown}
                    autoFocus
                    maxLength={30}
                    className="min-w-[100px] max-w-[150px] bg-transparent outline-none text-sm font-medium leading-[18px] tracking-[0.14px] text-black placeholder:text-[#707070]"
                    placeholder="Wallet name"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-1 rounded transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                    aria-label="Save name"
                  >
                    <img src={CheckmarkIcon} alt="" className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEditName}
                  className="flex items-center gap-2 border border-[#DADAD8] rounded-lg px-2.5 py-1.5 transition-colors hover:bg-[#F2F2F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                >
                  <span className="text-sm font-medium leading-[18px] tracking-[0.14px] whitespace-nowrap">
                    {walletName}
                  </span>
                </button>
              )}
            </div>

            {/* Styling */}
            <button
              type="button"
              onClick={handleStyling}
              className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-[#F2F2F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#EBEBE9]">
                  <img src={ThemeIcon} alt="Styling" className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium leading-[18px] tracking-[0.14px]">Styling</div>
              </div>
              <div className="p-1">
                <img src={ArrowRightIcon} alt="" className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Address Box */}
          <div className="flex flex-col items-center gap-5 px-3 pt-5 pb-3 bg-[#F2F2F0] rounded-lg">
            <div className="text-sm font-medium leading-[18px] tracking-[0.14px] text-center break-words w-full" style={{ wordBreak: 'break-all' }}>
              {addressStart}
              <span className="text-[#707070]">{addressMiddle}</span>
              {addressEnd}
            </div>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center justify-center gap-[6px] py-[7px] pl-3 pr-4 bg-transparent border border-black rounded-full text-sm font-medium leading-[18px] tracking-[0.14px] transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              <img src={CopyIcon} alt="" className="w-4 h-4 shrink-0" />
              {copySuccess ? 'Copied!' : 'Copy address'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2 px-2 rounded-lg bg-white">
            <div className="text-[12px] leading-4 tracking-[0.24px] text-[#707070] flex-1">
              Wallet created in {walletCreatedDate}
            </div>
            <div className="flex items-center justify-center rounded-lg py-2 px-3">
              <AccountIcon
                styleId={currentAccount?.iconStyleId}
                color={currentAccount?.iconColor}
                className="w-4 h-4"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveWallet}
            className="flex items-center justify-between gap-2 py-2 pl-3 pr-2 bg-[#FFE5E3] rounded-lg transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            <div className="text-sm font-medium leading-[18px] tracking-[0.14px] text-left text-[#D43131] flex-1">
              Remove wallet
            </div>
            <div className="flex items-center justify-center rounded-lg py-1.5 px-2 bg-[#FFE5E3]">
              <img src={TrashBinIcon} alt="" className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
