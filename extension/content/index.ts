/**
 * Content Script: Bridge between page and service worker
 * Injects the inpage provider and relays messages
 */

import { MESSAGE_TARGETS } from '../shared/constants';

// Inject inpage provider (runs in page context)
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inpage/index.js');
script.type = 'module';
(document.head || document.documentElement).prepend(script);
script.remove();

/**
 * Bridge page <-> Service Worker
 * Listens for messages from the injected provider and forwards to SW
 */
window.addEventListener('message', async (evt: MessageEvent) => {
  const data = evt.data;

  // Filter messages: must be for us and from the page
  if (!data || data.target !== MESSAGE_TARGETS.WALLET_BRIDGE || evt.source !== window) {
    return;
  }

  // Forward to service worker and relay response back to page
  const reply = await chrome.runtime.sendMessage(data);
  window.postMessage(
    {
      target: MESSAGE_TARGETS.WALLET_BRIDGE,
      id: data.id,
      reply
    },
    '*'
  );
});
