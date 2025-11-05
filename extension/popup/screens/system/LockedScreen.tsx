/**
 * Locked Screen - Unlock wallet with password
 */

import { useState } from "react";
import { INTERNAL_METHODS, ERROR_CODES } from "../../../shared/constants";
import { useStore } from "../../store";
import { send } from "../../utils/messaging";
import { Alert } from "../../components/Alert";
import logoSvg from "../../assets/iris-logo.svg";

export function LockedScreen() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { navigate, syncWallet, wallet } = useStore();

  async function handleUnlock() {
    // Clear previous errors
    setError("");

    if (!password) {
      setError("Please enter a password");
      return;
    }

    const result = await send<{
      ok?: boolean;
      address?: string;
      accounts?: Array<{ name: string; address: string; index: number }>;
      currentAccount?: { name: string; address: string; index: number };
      error?: string;
    }>(INTERNAL_METHODS.UNLOCK, [password]);

    if (result?.error) {
      setError(
        result.error === ERROR_CODES.BAD_PASSWORD
          ? "Incorrect password"
          : `Error: ${result.error}`
      );
      setPassword(""); // Clear password on error
    } else {
      setPassword("");
      const accounts = result.accounts || [];
      const currentAccount = result.currentAccount || accounts[0] || null;
      syncWallet({
        locked: false,
        address: result.address || null,
        accounts,
        currentAccount,
        balance: wallet.balance || 0,
      });
      navigate("home");
    }
  }

  function handleResetWallet() {
    // TODO: Implement reset wallet confirmation dialog
    if (
      confirm(
        "This will delete your current wallet and all data. Are you sure?"
      )
    ) {
      // Clear storage and restart onboarding
      chrome.storage.local.clear(() => {
        window.location.reload();
      });
    }
  }

  return (
    <div className="relative w-[357px] h-[600px] bg-[var(--color-bg)]">
      <div className="flex flex-col justify-between h-full px-4 py-8">
        {/* Main content */}
        <div className="flex flex-col gap-8 w-full">
          {/* Logo and heading */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-24 h-24">
              <img src={logoSvg} alt="Iris Logo" className="w-full h-full" />
            </div>
            <div className="flex flex-col gap-2 items-center text-center w-full">
              <h1
                className="font-serif font-medium text-[var(--color-text-primary)]"
                style={{
                  fontSize: "var(--font-size-xl)",
                  lineHeight: "var(--line-height-relaxed)",
                  letterSpacing: "-0.02em",
                }}
              >
                Welcome back
              </h1>
              <p
                className="font-sans text-[var(--color-text-muted)]"
                style={{
                  fontSize: "var(--font-size-sm)",
                  lineHeight: "var(--line-height-snug)",
                  letterSpacing: "0.02em",
                }}
              >
                Your safe wallet for Nockchain
              </p>
            </div>
          </div>

          {/* Password input and unlock button */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1.5 w-full">
              <label
                className="font-sans font-medium text-[var(--color-text-primary)]"
                style={{
                  fontSize: "var(--font-size-sm)",
                  lineHeight: "var(--line-height-snug)",
                  letterSpacing: "0.02em",
                }}
              >
                Password
              </label>
              <div className="bg-[var(--color-bg)] border border-[var(--color-surface-700)] rounded-lg p-3 flex items-center gap-2.5 h-[52px]">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="Enter your password"
                  autoFocus
                  className="flex-1 bg-transparent font-sans font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none"
                  style={{
                    fontSize: "var(--font-size-base)",
                    lineHeight: "var(--line-height-snug)",
                    letterSpacing: "0.01em",
                  }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 2L14 14M8 5.6C9.32548 5.6 10.4 6.67452 10.4 8C10.4 8.27624 10.3534 8.54144 10.2678 8.78886M8 10.4C6.67452 10.4 5.6 9.32548 5.6 8C5.6 7.72375 5.64663 7.45854 5.73223 7.21111M8 4C10.2091 4 12.0367 5.26206 13.105 6.72097C13.4066 7.1526 13.4066 7.7474 13.105 8.17903C12.539 8.96336 11.8343 9.65648 11.0337 10.1991M8 12C5.79089 12 3.96327 10.7379 2.89491 9.27903C2.59338 8.8474 2.59338 8.2526 2.89491 7.82097C3.46115 7.03662 4.16571 6.34354 4.96632 5.80084"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 5.6C9.32548 5.6 10.4 6.67452 10.4 8C10.4 9.32548 9.32548 10.4 8 10.4C6.67452 10.4 5.6 9.32548 5.6 8C5.6 6.67452 6.67452 5.6 8 5.6Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M8 4C10.2091 4 12.0367 5.26206 13.105 6.72097C13.4066 7.1526 13.4066 7.7474 13.105 8.17903C12.0367 9.63794 10.2091 10.88 8 10.88C5.79089 10.88 3.96327 9.63794 2.89491 8.17903C2.59338 7.7474 2.59338 7.1526 2.89491 6.72097C3.96327 5.26206 5.79089 4 8 4Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && <Alert type="error">{error}</Alert>}

            {/* Unlock button */}
            <button
              onClick={handleUnlock}
              className="w-full h-12 px-5 py-[15px] bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-lg flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--font-size-base)",
                fontWeight: 500,
                lineHeight: "var(--line-height-snug)",
                letterSpacing: "0.01em",
              }}
            >
              Unlock
            </button>
          </div>
        </div>

        {/* Bottom text with reset link */}
        <div className="flex flex-col gap-3 items-center text-center w-full">
          <p
            className="font-sans text-[var(--color-text-muted)]"
            style={{
              fontSize: "var(--font-size-sm)",
              lineHeight: "var(--line-height-snug)",
              letterSpacing: "0.02em",
            }}
          >
            Can't login? You can delete your current wallet and create a new one
          </p>
          <button
            onClick={handleResetWallet}
            className="font-sans font-medium text-[var(--color-text-primary)] underline hover:opacity-80"
            style={{
              fontSize: "var(--font-size-base)",
              lineHeight: "var(--line-height-snug)",
              letterSpacing: "0.01em",
            }}
          >
            Reset wallet
          </button>
        </div>
      </div>
    </div>
  );
}
