import { useStore } from '../store';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import FortNockLogo40 from '../assets/fort-nock-logo-40.svg';
import ArrowRightIcon from '../assets/arrow-right-icon.svg';

export function TransactionDetailsScreen() {
  const { navigate } = useStore();

  // TODO: wire up real data
  const transactionType: 'sent' | 'receive' = 'sent';
  const amount = '2,500';
  const usdValue = '$250.00';
  const status: 'Confirmed' | 'Pending' | 'Failed' = 'Confirmed';
  const fromAddress = '89dF3w...w5Lvw';
  const toAddress = '89dF3w...w5Lvw';
  const networkFee = '1 NOCK';
  const total = '2501 NOCK';
  const totalUsd = '$250.10';
  const transactionId = '0x1234...5678';

  function handleBack() {
    navigate('home');
  }
  function handleViewExplorer() {
    console.log('View on explorer');
  }
  function handleCopyTransactionId() {
    navigator.clipboard.writeText(transactionId);
  }
  function handleActivityLog() {
    console.log('Toggle activity log');
  }

  const statusColor =
    status === 'Confirmed'
      ? 'text-[#369929]'
      : status === 'Pending'
        ? 'text-[#CE8A1D]'
        : 'text-[#D43131]';

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 min-h-[64px] bg-white">
        <button
          type="button"
          onClick={handleBack}
          className="w-8 h-8 flex items-center justify-center p-2 rounded-lg transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          aria-label="Back"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <h1 className="m-0 text-base font-medium leading-[22px] tracking-[0.16px]">
          {transactionType === 'sent' ? 'Sent' : 'Received'}
        </h1>
        <div className="w-8 h-8" />
      </header>

      {/* Content */}
      <div className="flex flex-col gap-2 h-[536px] bg-white overflow-y-auto">
        <div className="flex flex-col gap-8 px-4 py-2">
          {/* Amount Section */}
          <div className="flex flex-col items-center gap-3">
            <img src={FortNockLogo40} alt="Fort Nock" className="w-10 h-10" />
            <div className="flex flex-col items-center gap-0.5 text-center">
              <h2 className="m-0 font-[Lora] text-[36px] font-semibold leading-10 tracking-[-0.72px]">
                {transactionType === 'sent' ? '-' : '+'}
                {amount} <span className="text-[#707070]">NOCK</span>
              </h2>
              <p className="m-0 text-[13px] font-medium leading-[18px] tracking-[0.26px]">
                {usdValue}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="flex flex-col gap-2">
            {/* Status */}
            <div className="bg-[#F2F2F0] rounded-lg px-3 py-5">
              <div className="flex items-center justify-between text-sm font-medium leading-[18px] tracking-[0.14px]">
                <div className="text-black">Status</div>
                <div className={`whitespace-nowrap ${statusColor}`}>{status}</div>
              </div>
            </div>

            {/* From / To */}
            <div className="bg-[#F2F2F0] rounded-lg p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="text-sm font-medium leading-[18px] tracking-[0.14px]">From</div>
                  <div className="text-[13px] leading-[18px] tracking-[0.26px] text-[#707070] truncate">
                    {fromAddress}
                  </div>
                </div>
                <div className="p-1 shrink-0">
                  <img src={ArrowRightIcon} alt="" className="w-4 h-4" />
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="text-sm font-medium leading-[18px] tracking-[0.14px]">To</div>
                  <div className="text-[13px] leading-[18px] tracking-[0.26px] text-[#707070] truncate">
                    {toAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Fee and Total */}
            <div className="bg-[#F2F2F0] rounded-lg px-3 py-3 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm font-medium leading-[18px] tracking-[0.14px]">
                <div className="text-[#000] opacity-70">Network fee</div>
                <div className="text-[#707070] whitespace-nowrap">{networkFee}</div>
              </div>
              <div className="h-px w-full bg-[#EBEBE9]" />
              <div className="flex items-center justify-between text-sm font-medium leading-[18px] tracking-[0.14px]">
                <div className="text-black">Total</div>
                <div className="flex flex-col items-end gap-1 w-[75px]">
                  <div className="text-black whitespace-nowrap">{total}</div>
                  <div className="text-[13px] leading-[18px] tracking-[0.26px] text-[#707070] whitespace-nowrap">
                    {totalUsd}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleViewExplorer}
                className="flex-1 py-[7px] px-3 bg-transparent border border-[#DADAD8] rounded-full text-sm font-medium leading-[18px] tracking-[0.14px] transition-colors hover:bg-[#F8F8F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 whitespace-nowrap"
              >
                View on explorer
              </button>
              <button
                type="button"
                onClick={handleCopyTransactionId}
                className="flex-1 py-[7px] px-3 bg-transparent border border-[#DADAD8] rounded-full text-sm font-medium leading-[18px] tracking-[0.14px] transition-colors hover:bg-[#F8F8F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 whitespace-nowrap"
              >
                Copy transaction ID
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <button
            type="button"
            onClick={handleActivityLog}
            className="flex items-center justify-between p-3 bg-[#EBEBE9] rounded-lg transition-colors hover:bg-[#E0E0DE] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            <div className="text-sm font-medium leading-[18px] tracking-[0.14px]">Activity log</div>
            <div className="text-[20px] leading-none">+</div>
          </button>
        </div>
      </div>
    </div>
  );
}
