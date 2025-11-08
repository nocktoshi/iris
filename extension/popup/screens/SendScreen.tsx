import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { useTheme } from '../contexts/ThemeContext';
import { truncateAddress } from '../utils/format';
import { send } from '../utils/messaging';
import { INTERNAL_METHODS } from '../../shared/constants';
import type { Account } from '../../shared/types';
import { AccountIcon } from '../components/AccountIcon';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import PencilEditIcon from '../assets/pencil-edit-icon.svg';
import InfoIcon from '../assets/info-icon.svg';

function formatInt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function SendScreen() {
  const { theme } = useTheme();
  const { navigate, wallet, syncWallet, setLastTransaction } = useStore();

  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('1');
  const [error, setError] = useState('');

  // Get real accounts from vault
  const accounts = wallet.accounts || [];
  const currentAccount = wallet.currentAccount || accounts[0];
  const currentBalance = wallet.balance;

  // Account switching handler
  async function handleSwitchAccount(index: number) {
    const result = await send<{ ok?: boolean; account?: Account; error?: string }>(
      INTERNAL_METHODS.SWITCH_ACCOUNT,
      [index]
    );

    if (result?.ok && result.account) {
      const updatedWallet = {
        ...wallet,
        currentAccount: result.account,
        address: result.account.address,
      };
      syncWallet(updatedWallet);
    }

    setWalletDropdownOpen(false);
  }

  function handleMaxAmount() {
    setAmount(String(currentBalance));
  }

  function handleCancel() {
    navigate('home');
  }

  function handleContinue() {
    setError('');

    // Validation
    if (!receiverAddress.trim()) {
      setError('Please enter a receiver address');
      return;
    }

    // Basic Nockchain V1 PKH address validation (~60 characters base58)
    const addressLength = receiverAddress.trim().length;
    if (addressLength < 55 || addressLength > 65) {
      setError('Invalid Nockchain address (V1 PKH format expected)');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const feeNum = parseFloat(fee);
    if (!fee || isNaN(feeNum) || feeNum < 0) {
      setError('Please enter a valid fee');
      return;
    }

    if (amountNum + feeNum > currentBalance) {
      setError(`Insufficient balance`);
      return;
    }

    // Store transaction details for review screen
    setLastTransaction({
      txid: '', // Will be generated when actually sent
      amount: amountNum,
      fee: feeNum,
      to: receiverAddress.trim(),
      from: currentAccount?.address,
    });

    navigate('send-review');
  }

  // --- Dropdown sizing/positioning (prevents going off screen) ----------------
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [renderAbove, setRenderAbove] = useState(false);

  useLayoutEffect(() => {
    if (!walletDropdownOpen || !triggerRef.current) return;

    const update = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      const width = r.width;
      const left = r.left;
      const gap = 4;

      // Provisional height (measure if already mounted)
      let menuHeight = 240;
      if (menuRef.current) {
        const mh = menuRef.current.getBoundingClientRect().height;
        if (mh) menuHeight = Math.min(mh, 240);
      }

      const spaceBelow = window.innerHeight - r.bottom - gap;
      const shouldFlip = spaceBelow < menuHeight && r.top > menuHeight;

      const top = shouldFlip ? Math.max(8, r.top - menuHeight - gap) : r.bottom + gap;

      setRenderAbove(!!shouldFlip);
      setMenuStyle({
        position: 'fixed',
        left,
        top,
        width,
        zIndex: 50,
      });
    };

    update();
    // Reposition on scroll/resize while open
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    // Wait one frame to measure actual menu height
    const raf = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      cancelAnimationFrame(raf);
    };
  }, [walletDropdownOpen]);

  // Close on outside click / escape
  useEffect(() => {
    if (!walletDropdownOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setWalletDropdownOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWalletDropdownOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [walletDropdownOpen]);

  // -----------------------------------------------------------------------------

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-4 border-b border-[#EBEBE9]">
        <button
          className="p-2 text-black/80 hover:text-black transition"
          onClick={handleCancel}
          aria-label="Back"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-[16px] font-medium tracking-[0.01em]">Send NOCK</h1>
        <div className="w-7" /> {/* spacer to balance the back button */}
      </header>

      {/* Wallet Selector */}
      <div className="px-4 pt-2">
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            className="w-full border border-[#DADAD8] rounded-lg p-2 pr-4 flex items-center gap-2 hover:border-[#DADAD8] focus:outline-none focus:ring-2 focus:ring-black/10"
            onClick={() => setWalletDropdownOpen(o => !o)}
            aria-haspopup="listbox"
            aria-expanded={walletDropdownOpen}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white grid place-items-center">
              <AccountIcon
                styleId={currentAccount?.iconStyleId}
                color={currentAccount?.iconColor}
                className="w-6 h-6"
              />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[14px] leading-[18px] font-medium tracking-[0.01em]">
                {currentAccount?.name || 'Wallet'}
              </div>
              <div className="text-[13px] leading-[18px] text-[#707070] tracking-[0.02em]">
                {truncateAddress(currentAccount?.address)}
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`text-black transition-transform ${walletDropdownOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path d="M8 10L5 7h6L8 10Z" fill="currentColor" />
            </svg>
          </button>

          {walletDropdownOpen && (
            <div
              ref={menuRef}
              style={menuStyle}
              role="listbox"
              className="bg-white border border-[#DADAD8] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-1 max-h-[240px] overflow-y-auto"
            >
              {accounts.map(account => {
                const isSelected = currentAccount?.index === account.index;
                return (
                  <button
                    key={account.index}
                    role="option"
                    aria-selected={isSelected}
                    className={[
                      'w-full flex items-center gap-2 p-2 rounded-lg transition',
                      'hover:bg-[#F2F2F0]',
                      isSelected ? 'bg-white ring-1 ring-black' : '',
                    ].join(' ')}
                    onClick={() => handleSwitchAccount(account.index)}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white grid place-items-center">
                      <AccountIcon
                        styleId={account.iconStyleId}
                        color={account.iconColor}
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[14px] leading-[18px] font-medium tracking-[0.01em]">
                        {account.name}
                      </div>
                      <div className="text-[13px] leading-[18px] text-[#707070] tracking-[0.02em]">
                        {truncateAddress(account.address)}
                      </div>
                    </div>
                    <div className="ml-auto text-[14px] leading-[18px] font-medium tracking-[0.01em] whitespace-nowrap">
                      {formatInt(currentBalance)} NOCK
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="flex flex-col items-center gap-3 px-4 pt-16 mb-12">
        <input
          type="text"
          inputMode="decimal"
          className="w-full bg-transparent border-0 text-center outline-none font-serif text-[48px] leading-[48px] font-semibold tracking-[-0.036em] text-[#AAAAAA] placeholder-[#AAAAAA]"
          placeholder="100.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <div className="w-full h-px bg-[#DADAD8]" />
        <div className="flex items-center gap-2">
          <div className="text-[12px] leading-4 font-medium tracking-[0.02em] text-[#707070]">
            Balance: {formatInt(currentBalance)} NOCK
          </div>
          <button
            onClick={handleMaxAmount}
            className="rounded-full bg-[#EBEBE9] hover:bg-[#DADAD8] text-[12px] leading-4 font-medium px-[7px] py-[3px] transition"
          >
            Max
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-4">
        {/* Receiver */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] leading-[18px] font-medium tracking-[0.02em]">
            Receiver address
          </label>
          <input
            type="text"
            placeholder="Enter Nockchain address"
            value={receiverAddress}
            onChange={e => setReceiverAddress(e.target.value)}
            className="w-full border border-[#DADAD8] rounded-lg px-4 py-[21px] text-[16px] leading-[22px] font-medium tracking-[0.01em] text-black placeholder-[#AAAAAA] outline-none focus:border-black"
          />
        </div>

        {/* Fee */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[14px] leading-[18px] font-medium">
              Fee
              <img src={InfoIcon} alt="" className="w-4 h-4" />
            </div>
            <div className="bg-[#EBEBE9] rounded-lg pl-2.5 pr-2 py-1.5 flex items-center gap-2">
              <div className="text-[14px] leading-[18px] font-medium text-[#707070]">
                {' '}
                {fee} NOCK{' '}
              </div>
              <img src={PencilEditIcon} alt="Edit" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 p-3 border-t border-[#EBEBE9] mt-auto">
        {error && (
          <div className="px-3 py-2 bg-[#FFE5E3] text-[#D43131] text-[13px] leading-[18px] font-medium rounded-lg">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button
            className="flex-1 rounded-lg px-5 py-3.5 text-[14px] leading-[18px] font-medium bg-[#EBEBE9] hover:bg-[#DADAD8] transition"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-lg px-5 py-3.5 text-[14px] leading-[18px] font-medium bg-[#FFC413] hover:bg-[#F0B900] transition"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
