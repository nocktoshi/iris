import { useStore } from '../store';
import FortNockLogo96 from '../assets/fort-nock-logo-96.svg';
import ArrowLeftIcon from '../assets/arrow-left-icon.svg';

/**
 * AboutScreen
 */
export function AboutScreen() {
  const { navigate } = useStore();

  function handleBack() {
    navigate('settings');
  }

  function handlePrivacyPolicy() {
    window.open('https://example.com/privacy', '_blank');
  }

  function handleTermsOfUse() {
    window.open('https://example.com/terms', '_blank');
  }

  function handleVisitWebsite() {
    window.open('https://example.com', '_blank');
  }

  return (
    <div className="w-[357px] h-[600px] flex flex-col bg-white text-black overflow-y-auto font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 min-h-[64px] bg-white">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-8 h-8 p-2 flex items-center justify-center rounded-lg flex-shrink-0 cursor-pointer transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <img src={ArrowLeftIcon} alt="" className="w-4 h-4" />
        </button>

        <h1 className="m-0 text-base font-medium leading-[22px] tracking-[0.16px]">About</h1>

        <div className="w-8 h-8 flex-shrink-0" />
      </header>

      {/* Content */}
      <div className="flex flex-col items-center gap-6 px-4 py-2 h-[536px]">
        <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
          <img src={FortNockLogo96} alt="Fort Nock" className="w-24 h-24" />
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-1">
          <p className="m-0 text-base font-medium leading-[22px] tracking-[0.16px] text-center">
            Iris Version 1.0.0
          </p>
          <p className="m-0 text-[13px] leading-[18px] tracking-[0.26px] text-[#707070] text-center">
            Extension ID: nock_wallet_v1
          </p>
        </div>

        <div className="w-full h-px bg-[#EBEBE9]" />

        <div className="w-full flex flex-col gap-3">
          <h2 className="m-0 text-sm font-medium leading-[18px] tracking-[0.14px] text-[#707070]">
            Links
          </h2>

          <div className="w-full flex flex-col gap-4">
            <button
              type="button"
              onClick={handlePrivacyPolicy}
              className="text-left bg-transparent p-0 text-base font-medium leading-[22px] tracking-[0.16px] underline underline-offset-2 transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              Privacy policy
            </button>

            <button
              type="button"
              onClick={handleTermsOfUse}
              className="text-left bg-transparent p-0 text-base font-medium leading-[22px] tracking-[0.16px] underline underline-offset-2 transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              Terms of use
            </button>

            <button
              type="button"
              onClick={handleVisitWebsite}
              className="text-left bg-transparent p-0 text-base font-medium leading-[22px] tracking-[0.16px] underline underline-offset-2 transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              Visit our website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
