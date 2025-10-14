/**
 * Onboarding Start Screen - Create new or import wallet
 */

import { useStore } from '../store';

export function OnboardingStartScreen() {
  const { navigate } = useStore();

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Welcome to Fort Nock</h2>

      <p className="text-sm text-gray-400 mb-6">
        A secure wallet for Nockchain
      </p>

      <button
        onClick={() => navigate('onboarding-create')}
        className="btn-primary my-2"
      >
        Create New Wallet
      </button>

      <button
        onClick={() => navigate('onboarding-import')}
        className="btn-secondary my-2"
      >
        Import Existing Wallet
      </button>
    </div>
  );
}
