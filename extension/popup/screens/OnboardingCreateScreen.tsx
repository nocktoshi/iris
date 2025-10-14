/**
 * Onboarding Create Screen - Set password and create wallet
 */

import { useState } from 'react';
import { INTERNAL_METHODS } from '../../shared/constants';
import { useStore } from '../store';

function send(method: string, params?: any[]): Promise<any> {
  return chrome.runtime.sendMessage({ payload: { method, params } });
}

export function OnboardingCreateScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { navigate, syncWallet } = useStore();

  async function handleCreate() {
    if (!password) {
      alert('Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    const result = await send(INTERNAL_METHODS.SETUP, [password]);

    if (result?.error) {
      alert(`Error: ${result.error}`);
    } else {
      // TODO: Show mnemonic for backup before completing
      syncWallet({ locked: false, address: result.address });
      navigate('onboarding-success');
    }
  }

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Create Wallet</h2>

      <p className="text-sm text-gray-400 mb-6">
        Choose a strong password to encrypt your wallet
      </p>

      <input
        type="password"
        placeholder="Password"
        className="input-field my-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="input-field my-2"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
      />

      <button onClick={handleCreate} className="btn-primary my-2">
        Create Wallet
      </button>

      <button onClick={() => navigate('onboarding-start')} className="btn-secondary my-2">
        Back
      </button>
    </div>
  );
}
