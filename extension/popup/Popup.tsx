/**
 * Popup UI: Main React component for wallet interactions
 */

import { useState, useEffect } from 'react';
import { INTERNAL_METHODS, PROVIDER_METHODS } from '../shared/constants';

/**
 * Send a message to the service worker
 */
function send(method: string, params?: any[]): Promise<any> {
  return chrome.runtime.sendMessage({ payload: { method, params } });
}

export function Popup() {
  const [locked, setLocked] = useState(true);
  const [address, setAddress] = useState<string>('');
  const [password, setPassword] = useState('');

  /**
   * Load wallet state on mount
   */
  useEffect(() => {
    loadState();
  }, []);

  /**
   * Fetch and update wallet state
   */
  async function loadState() {
    const state = await send(INTERNAL_METHODS.GET_STATE);
    setLocked(state.locked);
    setAddress(state.address || '(none)');
  }

  /**
   * Handle unlock button click
   */
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
      await loadState();
    }
  }

  /**
   * Handle setup button click
   */
  async function handleSetup() {
    if (!password) {
      alert('Please enter a password');
      return;
    }

    const result = await send(INTERNAL_METHODS.SETUP, [password]);

    if (result?.error) {
      alert(`Error: ${result.error}`);
    } else {
      alert(`Vault created!\nAddress: ${result.address}\nPassword: ${password}`);
      setPassword('');
      await loadState();
    }
  }

  /**
   * Handle lock button click
   */
  async function handleLock() {
    await send(INTERNAL_METHODS.LOCK);
    await loadState();
  }

  /**
   * Handle send button click
   */
  async function handleSend() {
    // TODO: Add proper UI for recipient address and amount input
    // For now, sends placeholder transaction to test flow
    const result = await send(PROVIDER_METHODS.SEND_TRANSACTION, [
      { to: '1'.repeat(132), amount: '1' }
    ]);

    if (result?.txid) {
      alert(`Transaction sent!\nTxID: ${result.txid}`);
    } else if (result?.error) {
      alert(`Error: ${result.error}`);
    }
  }

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Fort Nock</h2>

      {locked ? (
        <div id="locked">
          <input
            id="password"
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
          <button onClick={handleSetup} className="btn-secondary my-2">
            Create Wallet
          </button>
        </div>
      ) : (
        <div id="unlocked">
          <div className="address-display">
            <div className="label">Address:</div>
            <div id="addr">{address}</div>
          </div>
          <button onClick={handleSend} className="btn-primary my-2">
            Send
          </button>
          <button onClick={handleLock} className="btn-secondary my-2">
            Lock
          </button>
        </div>
      )}
    </div>
  );
}
