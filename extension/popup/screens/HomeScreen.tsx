/**
 * Home Screen - Main wallet view showing balance and actions
 */

import { INTERNAL_METHODS } from '../../shared/constants';
import { useStore } from '../store';

function send(method: string, params?: any[]): Promise<any> {
  return chrome.runtime.sendMessage({ payload: { method, params } });
}

export function HomeScreen() {
  const { wallet, navigate, syncWallet } = useStore();

  async function handleLock() {
    await send(INTERNAL_METHODS.LOCK);
    syncWallet({ locked: true, address: wallet.address });
    navigate('locked');
  }

  return (
    <div className="w-[357px] h-[600px] p-4">
      <h2 className="text-xl font-semibold mb-4">Fort Nock</h2>

      <div className="address-display">
        <div className="label">Address:</div>
        <div>{wallet.address || '(none)'}</div>
      </div>

      <div className="my-4">
        <div className="text-sm text-gray-400 mb-2">Balance</div>
        <div className="text-3xl font-bold">0.00 NOCK</div>
      </div>

      <div className="grid grid-cols-2 gap-2 my-4">
        <button onClick={() => navigate('send')} className="btn-primary">
          Send
        </button>
        <button onClick={() => navigate('receive')} className="btn-secondary">
          Receive
        </button>
      </div>

      <button onClick={() => navigate('settings')} className="btn-secondary my-2">
        Settings
      </button>

      <button onClick={handleLock} className="btn-secondary my-2">
        Lock
      </button>
    </div>
  );
}
