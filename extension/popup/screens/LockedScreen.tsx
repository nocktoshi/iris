/**
 * Locked Screen - Unlock wallet with password
 */

import { useState } from 'react';
import { INTERNAL_METHODS } from '../../shared/constants';
import { useStore } from '../store';

function send(method: string, params?: any[]): Promise<any> {
  return chrome.runtime.sendMessage({ payload: { method, params } });
}

export function LockedScreen() {
  const [password, setPassword] = useState('');
  const { navigate, syncWallet } = useStore();

  async function handleUnlock() {
    if (!password) {
      alert('Please enter a password');
      return;
    }

    const result = await send(INTERNAL_METHODS.UNLOCK, [password]);

    if (result?.error) {
      alert(`Error: ${result.error}`);
    } else {
      setPassword('');
      syncWallet({ locked: false, address: result.address });
      navigate('home');
    }
  }

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Fort Nock</h2>

      <div>
        <input
          type="password"
          placeholder="Password"
          className="input-field my-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
        />
        <button onClick={handleUnlock} className="btn-primary my-2">
          Unlock
        </button>
      </div>
    </div>
  );
}
