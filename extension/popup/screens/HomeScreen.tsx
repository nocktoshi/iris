import { useState, useLayoutEffect, useRef } from 'react';
import { useStore } from '../store';
import { useTheme } from '../contexts/ThemeContext';
import { truncateAddress } from '../utils/format';
import { send } from '../utils/messaging';
import { INTERNAL_METHODS } from '../../shared/constants';
import type { Account } from '../../shared/types';
import { AccountIcon } from '../components/AccountIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeOffIcon } from '../components/icons/EyeOffIcon';
import { SendPaperPlaneIcon } from '../components/icons/SendPaperPlaneIcon';
import { ReceiveCircleIcon } from '../components/icons/ReceiveCircleIcon';
import { ReceiveArrowIcon } from '../components/icons/ReceiveArrowIcon';
import { SentArrowIcon } from '../components/icons/SentArrowIcon';

import WalletDropdownArrow from '../assets/wallet-dropdown-arrow.svg';
import GreenStatusDot from '../assets/green-status-dot.svg';
import LockIconAsset from '../assets/lock-icon.svg';
import SettingsIconAsset from '../assets/settings-icon.svg';
import TrendUpArrow from '../assets/trend-up-arrow.svg';
import ExplorerIcon from '../assets/explorer-icon.svg';
import PermissionsIcon from '../assets/permissions-icon.svg';
import FeedbackIcon from '../assets/feedback-icon.svg';
import CopyIcon from '../assets/copy-icon.svg';
import SettingsGearIcon from '../assets/settings-gear-icon.svg';
import ArrowUpRightIcon from '../assets/arrow-up-right-icon.svg';

import './HomeScreen.tailwind.css';

/** HomeScreen */
export function HomeScreen() {
  const { navigate, wallet, syncWallet } = useStore();
  const { theme } = useTheme();

  const [balanceHidden, setBalanceHidden] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isTransactionsStuck, setIsTransactionsStuck] = useState(false);

  useLayoutEffect(() => {
    const el = headerRef.current;
    const container = scrollContainerRef.current;
    const updateHeaderHeight = () => {
      const h = el?.offsetHeight ?? 0;
      container?.style.setProperty('--header-h', `${h}px`);
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  // Detect when transactions section is stuck at top
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 64;
      const balanceSectionHeight = 140;
      // When scrolled past the balance section, snap to full width
      const isStuck = container.scrollTop >= balanceSectionHeight;
      setIsTransactionsStuck(isStuck);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Get accounts from vault
  const accounts = wallet.accounts || [];
  const currentAccount = wallet.currentAccount || accounts[0];

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

  // Account creation handler
  async function handleAddAccount() {
    const result = await send<{ ok?: boolean; account?: Account; error?: string }>(
      INTERNAL_METHODS.CREATE_ACCOUNT,
      []
    );

    if (result?.ok && result.account) {
      const updatedWallet = {
        ...wallet,
        accounts: [...wallet.accounts, result.account],
        currentAccount: result.account,
        address: result.account.address,
      };
      syncWallet(updatedWallet);
    } else if (result?.error) {
      alert(`Failed to create account: ${result.error}`);
    }

    setWalletDropdownOpen(false);
  }

  const balance = wallet.balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const usdValue = '0.00'; // TODO: Get from real price feed when available
  const percentChange = '0.00'; // TODO: Get from real price feed when available
  const walletName = currentAccount?.name || 'Wallet';
  const walletAddress = truncateAddress(currentAccount?.address);
  const fullAddress = currentAccount?.address || '';

  const transactions = [
    {
      date: '28 Oct 2025',
      items: [
        {
          type: 'receive' as const,
          from: '89dF3w...sw5Lvw',
          amount: '+100 NOCK',
          usdValue: '7.42$',
        },
        {
          type: 'receive' as const,
          from: '89dF3w...sw5Lvw',
          amount: '+100 NOCK',
          usdValue: '7.42$',
        },
      ],
    },
    {
      date: '25 Oct 2025',
      items: [
        { type: 'sent' as const, from: '89dF3w...sw5Lvw', amount: '-200 NOCK', usdValue: '14.84$' },
      ],
    },
    {
      date: '21 Oct 2025',
      items: [
        { type: 'sent' as const, from: '89dF3w...sw5Lvw', amount: '-200 NOCK', usdValue: '14.84$' },
      ],
    },
  ];

  return (
    <div className="w-[357px] h-[600px] bg-fn-bg text-fn-ink overflow-hidden relative">
      {/* Scroll container */}
      <div ref={scrollContainerRef} className="relative h-full overflow-y-auto scroll-thin">
        {/* Sticky header */}
        <header
          ref={headerRef}
          className="sticky top-0 z-40 bg-fn-bg/95 backdrop-blur supports-[backdrop-filter]:bg-fn-bg/80"
        >
          <div className="px-4 py-3 flex items-center justify-between min-h-[64px]">
            <button
              className="flex items-center gap-2"
              onClick={() => setWalletDropdownOpen(o => !o)}
              aria-label="Wallet menu"
            >
              <div className="relative h-10 w-10 rounded-tile bg-white grid place-items-center">
                <AccountIcon
                  styleId={currentAccount?.iconStyleId}
                  color={currentAccount?.iconColor}
                  className="h-6 w-6"
                />
                <img
                  src={GreenStatusDot}
                  alt="Active"
                  className="absolute -bottom-px -right-0.5 h-2 w-2"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="font-sans text-[14px] font-medium leading-[18px] tracking-[0.14px] flex items-center gap-1">
                  {walletName}
                  <img src={WalletDropdownArrow} alt="" className="h-3 w-3" />
                </div>
                <div className="font-sans text-[13px] leading-[18px] tracking-[0.26px] text-fn-sub flex items-center gap-2">
                  <span className="truncate">{walletAddress}</span>
                  <button
                    className="shrink-0 opacity-70 hover:opacity-40"
                    onClick={e => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(fullAddress);
                    }}
                    aria-label="Copy address"
                  >
                    <img src={CopyIcon} alt="" className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 rounded-tile hover:bg-black/5 grid place-items-center"
                onClick={() => navigate('locked')}
              >
                <img src={LockIconAsset} alt="Lock" className="h-5 w-5" />
              </button>
              <button
                className="h-8 w-8 rounded-tile hover:bg-black/5 grid place-items-center"
                onClick={() => setSettingsDropdownOpen(o => !o)}
              >
                <img src={SettingsIconAsset} alt="Settings" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Wallet dropdown */}
        {walletDropdownOpen && (
          <>
            <div
              className="fixed inset-0 bg-fn-overlayLight z-50"
              onClick={() => setWalletDropdownOpen(false)}
            />
            <div className="fixed top-[64px] left-2 right-2 bg-white border border-[#DADAD8] rounded-xl shadow-lg z-50 max-h-[400px] overflow-y-auto">
              <div className="p-2">
                {accounts.map(account => (
                  <button
                    key={account.index}
                    onClick={() => handleSwitchAccount(account.index)}
                    className={`wallet-dropdown-item w-full flex items-center gap-2 p-2 rounded-tile border ${
                      currentAccount?.index === account.index
                        ? 'border-black'
                        : 'border-transparent'
                    } hover:bg-[#E5E5E3]`}
                  >
                    <div className="h-10 w-10 rounded-tile bg-white grid place-items-center">
                      <AccountIcon
                        styleId={account.iconStyleId}
                        color={account.iconColor}
                        className="h-6 w-6"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[14px] leading-[18px] font-medium">{account.name}</div>
                      <div className="text-[13px] leading-[18px] text-fn-sub tracking-[0.26px]">
                        {truncateAddress(account.address)}
                      </div>
                    </div>
                    <div className="wallet-balance text-[14px] font-medium whitespace-nowrap">
                      {wallet.balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      NOCK
                    </div>
                    <div
                      className="wallet-settings-icon h-10 w-10 rounded-tile bg-[#DADAD8] hidden items-center justify-center"
                      onClick={e => {
                        e.stopPropagation();
                        setWalletDropdownOpen(false);
                        navigate('wallet-settings');
                      }}
                    >
                      <img src={SettingsGearIcon} alt="Settings" className="h-5 w-5" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="h-px bg-fn-bg" />
              <div className="p-2">
                <button
                  className="w-full h-12 bg-black text-white font-medium rounded-lg"
                  onClick={handleAddAccount}
                >
                  Add account
                </button>
              </div>
            </div>
          </>
        )}

        {/* Settings dropdown */}
        {settingsDropdownOpen && (
          <>
            <div
              className="fixed inset-0 bg-fn-overlay z-50"
              onClick={() => setSettingsDropdownOpen(false)}
            />
            <div className="fixed top-[64px] right-2 w-[245px] bg-white border border-fn-lineMuted rounded-lgx p-2 z-50 flex flex-col gap-1">
              <DropdownItem icon={ExplorerIcon} label="View on explorer" onClick={() => {}} />
              <DropdownItem
                icon={PermissionsIcon}
                label="Wallet permissions"
                onClick={() => {
                  setSettingsDropdownOpen(false);
                  navigate('wallet-permissions');
                }}
              />
              <DropdownItem
                icon={SettingsIconAsset}
                label="Settings"
                onClick={() => {
                  setSettingsDropdownOpen(false);
                  navigate('settings');
                }}
              />
              <div className="h-px bg-fn-bg my-1" />
              <DropdownItem icon={FeedbackIcon} label="Wallet feedback" onClick={() => {}} />
            </div>
          </>
        )}

        {/* Sticky balance block (lower z) */}
        <div className="sticky top-[var(--header-h)] z-10 px-4 pt-1 bg-fn-bg">
          <div className="mb-3">
            <div className="flex items-baseline gap-[6px]">
              <div className="font-display font-semibold text-[36px] leading-[40px] tracking-[-0.72px]">
                {balanceHidden ? '••••••' : balance}
              </div>
              <div className="font-display text-[24px] leading-[28px] tracking-[-0.48px] text-[#707070]">
                NOCK
              </div>
              <button
                className="ml-1 text-black/40 hover:text-black/60"
                onClick={() => setBalanceHidden(b => !b)}
                aria-label="Toggle balance visibility"
              >
                {balanceHidden ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="mt-1 text-[13px] font-medium leading-[18px] text-fn-green flex items-center gap-1">
              <img src={TrendUpArrow} alt="" className="h-4 w-4" />
              <span>{balanceHidden ? '••••• •••••' : `${usdValue}$ (${percentChange}%)`}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              className="rounded-card bg-fn-yellow shadow-card flex flex-col items-start justify-center gap-4 p-3 font-sans text-[14px] font-medium transition-all hover:opacity-90 active:scale-[0.98]"
              onClick={() => navigate('send')}
            >
              <SendPaperPlaneIcon className="h-5 w-5" />
              Send
            </button>
            <button
              className="rounded-card bg-white border border-fn-line shadow-card flex flex-col items-start justify-center gap-4 p-3 font-sans text-[14px] font-medium transition-all hover:bg-[#F8F8F8] active:scale-[0.98]"
              onClick={() => navigate('receive')}
            >
              <ReceiveCircleIcon className="h-5 w-5" />
              Receive
            </button>
          </div>
        </div>

        {/* Transactions sheet that scrolls OVER actions (higher z) */}
        <section
          className={`relative z-20 bg-white shadow-card rounded-xl transition-all duration-300 ${
            isTransactionsStuck ? '' : 'mx-2 mt-4'
          }`}
        >
          {/* Sticky header inside the sheet (matches scroll state 2) */}
          <div className="sticky top-[var(--header-h)] z-10 px-4 py-3 bg-white border-b border-black/10 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[14px] font-medium">Recent Transactions</h2>
              <button className="text-[12px] font-medium border border-black rounded-full pl-[10px] pr-[14px] py-[5px] hover:bg-black/5 flex items-center gap-[4px]">
                <img src={ArrowUpRightIcon} alt="" className="h-[12px] w-[12px]" />
                View all
              </button>
            </div>
          </div>

          {/* Groups */}
          <div className="px-4 pb-6">
            {transactions.map((group, idx) => (
              <div key={idx} className={idx === 0 ? 'pt-4' : 'pt-4 border-t border-black/10'}>
                <div className="font-display font-medium text-[14px] leading-[18px] tracking-[0.14px] text-black/50 mb-3">
                  {group.date}
                </div>
                <div className="divide-y divide-black/5">
                  {group.items.map((t, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 py-3 rounded-lg hover:bg-black/[0.03] px-2 -mx-2"
                      onClick={() => navigate('tx-details')}
                    >
                      <div className="h-10 w-10 rounded-full bg-black/8 grid place-items-center text-black/70">
                        {t.type === 'receive' ? (
                          <ReceiveArrowIcon className="h-4 w-4" />
                        ) : (
                          <SentArrowIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[14px] font-medium">
                          {t.type === 'receive' ? 'Receive' : 'Sent'}
                        </div>
                        <div className="text-[12px] text-black/50">From {t.from}</div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-[14px] font-medium ${t.type === 'receive' ? 'text-fn-green' : 'text-fn-ink'}`}
                        >
                          {t.amount}
                        </div>
                        <div className="text-[12px] text-black/50">{t.usdValue}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-6" />
      </div>
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 p-2 rounded-tile hover:bg-[#E5E5E3] text-left"
    >
      <div className="h-8 w-8 rounded-tile bg-[#EBEBE9] grid place-items-center">
        <img src={icon} className="h-5 w-5" alt="" />
      </div>
      <span className="text-[14px] font-medium">{label}</span>
    </button>
  );
}
