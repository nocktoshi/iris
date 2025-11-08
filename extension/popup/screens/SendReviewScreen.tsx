import { useStore } from '../store';
import { truncateAddress } from '../utils/format';
import { AccountIcon } from '../components/AccountIcon';
import FortNockLogo40 from '../assets/fort-nock-logo-40.svg';
import ArrowLeftIcon from '../assets/arrow-left-icon.svg';
import ArrowRightIcon from '../assets/arrow-right-icon.svg';

export function SendReviewScreen() {
  const { navigate, wallet, lastTransaction } = useStore();

  // If no transaction data, go back to send screen
  if (!lastTransaction) {
    navigate('send');
    return null;
  }

  const currentAccount = wallet.currentAccount;

  // Format amounts for display
  const amount = lastTransaction.amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const usdValue = '$0.00'; // TODO: Get from real price feed
  const fromAddress = truncateAddress(lastTransaction.from);
  const toAddress = truncateAddress(lastTransaction.to);
  const networkFee = `${lastTransaction.fee} NOCK`;

  function handleBack() {
    navigate('send');
  }
  function handleCancel() {
    navigate('send');
  }
  function handleSend() {
    console.log('Sending transaction...');
    navigate('send-submitted');
  }

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 min-h-[64px] bg-white">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-8 h-8 rounded-lg p-2 flex items-center justify-center transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <img src={ArrowLeftIcon} alt="" className="w-4 h-4" />
        </button>
        <h1 className="m-0 text-base font-medium leading-[22px] tracking-[0.16px]">Review</h1>
        <div className="w-8 h-8" />
      </header>

      {/* Content */}
      <div className="flex flex-col justify-between h-[536px] bg-white">
        <div className="flex flex-col gap-8 px-4 py-2">
          {/* Amount Section */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-white grid place-items-center">
              <AccountIcon
                styleId={currentAccount?.iconStyleId}
                color={currentAccount?.iconColor}
                className="w-6 h-6"
              />
            </div>
            <div className="flex flex-col items-center gap-0.5 w-full text-center">
              <h2 className="m-0 font-[Lora] text-[36px] font-semibold leading-10 tracking-[-0.72px]">
                {amount} <span className="text-[#707070]">NOCK</span>
              </h2>
              <p className="m-0 text-[13px] font-medium leading-[18px] tracking-[0.26px] text-[#707070]">
                {usdValue}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2 w-full">
            {/* From/To */}
            <div className="bg-[#F2F2F0] rounded-lg p-3 flex items-center gap-2.5">
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="text-sm font-medium leading-[18px] tracking-[0.14px]">From</div>
                <div className="text-[13px] leading-[18px] tracking-[0.26px] text-[#707070] truncate">
                  {fromAddress}
                </div>
              </div>
              <div className="p-1 shrink-0">
                <img src={ArrowRightIcon} alt="" className="h-4 w-auto" />
              </div>
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="text-sm font-medium leading-[18px] tracking-[0.14px]">To</div>
                <div className="text-[13px] leading-[18px] tracking-[0.26px] text-[#707070] truncate">
                  {toAddress}
                </div>
              </div>
            </div>

            {/* Network fee */}
            <div className="bg-[#F2F2F0] rounded-lg px-3 py-5">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm font-medium leading-[18px] tracking-[0.14px]">
                  Network fee
                </div>
                <div className="text-sm font-medium leading-[18px] tracking-[0.14px] whitespace-nowrap">
                  {networkFee}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 py-3 border-t border-[#EBEBE9]">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 h-12 inline-flex items-center justify-center rounded-lg text-sm font-medium leading-[18px] tracking-[0.14px] bg-[#EBEBE9] text-black transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="flex-1 h-12 inline-flex items-center justify-center rounded-lg text-sm font-medium leading-[18px] tracking-[0.14px] bg-black text-white transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
