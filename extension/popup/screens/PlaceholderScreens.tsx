/**
 * Placeholder screens - To be implemented based on Figma designs
 */

import { useStore } from '../store';

export function OnboardingSuccessScreen() {
  const { navigate } = useStore();

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Wallet Created!</h2>
      <p className="text-sm text-gray-400 mb-6">
        Your wallet has been created successfully
      </p>
      <button onClick={() => navigate('home')} className="btn-primary">
        Get Started
      </button>
    </div>
  );
}

export function OnboardingImportScreen() {
  const { navigate } = useStore();

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Import Wallet</h2>
      <p className="text-sm text-gray-400 mb-6">
        Enter your 24-word recovery phrase
      </p>
      {/* TODO: Implement 24-word grid from Figma */}
      <button onClick={() => navigate('onboarding-start')} className="btn-secondary">
        Back
      </button>
    </div>
  );
}

export function SendScreen() {
  const { navigate } = useStore();

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Send NOCK</h2>
      <p className="text-sm text-gray-400 mb-6">
        Send transaction (placeholder)
      </p>
      {/* TODO: Implement send form from Figma */}
      <button onClick={() => navigate('home')} className="btn-secondary">
        Back
      </button>
    </div>
  );
}

export function ReceiveScreen() {
  const { navigate, wallet } = useStore();

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Receive NOCK</h2>
      <div className="address-display my-4">
        <div className="label">Your Address:</div>
        <div>{wallet.address}</div>
      </div>
      {/* TODO: Add QR code */}
      <button onClick={() => navigate('home')} className="btn-secondary">
        Back
      </button>
    </div>
  );
}

export function SettingsScreen() {
  const { navigate } = useStore();

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <p className="text-sm text-gray-400 mb-6">
        Settings (placeholder)
      </p>
      {/* TODO: Implement settings from Figma */}
      <button onClick={() => navigate('home')} className="btn-secondary">
        Back
      </button>
    </div>
  );
}
