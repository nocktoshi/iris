# Fort Nock — MV3 Wallet Demo

A minimal Chrome MV3 extension wallet for Nockchain. This is a **demo implementation** with clean scaffolding and strong patterns, ready for real Nockchain integration.

## Features

- **Secure Vault**: Encrypts 24-word mnemonic with user password using WebCrypto (PBKDF2 + AES-GCM)
- **Provider Injection**: Exposes `window.nockchain` on web pages (EIP-1193 style)
- **Auto-lock**: Configurable auto-lock via Chrome alarms (default 15 minutes)
- **Clean Architecture**: Service worker ⇄ Content script ⇄ Inpage provider pattern
- **Popup UI**: 357×600 interface for Lock/Unlock, Address display, and Send stub

## Project Structure

```
fort-nock/
├── extension/
│   ├── background/        # Service worker (wallet controller)
│   ├── content/           # Content script (bridge)
│   ├── inpage/            # Injected provider (window.nockchain)
│   ├── popup/             # Popup UI (HTML + TS)
│   ├── shared/            # Utilities (crypto, vault, validators)
│   └── manifest.json      # MV3 manifest
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome browser

### Installation

```bash
# Navigate to project folder
cd fort-nock

# Install dependencies
npm install

# Build the extension
npm run build
```

This creates a `dist/` folder with the compiled extension.

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder

The Fort Nock extension icon should appear in your extensions toolbar.

## Usage

### First-time Setup

1. Click the Fort Nock extension icon
2. Click **Create Demo Vault**
   - Enter a password (or leave blank for "demo")
   - A vault is created with a demo 24-word mnemonic
   - Address is displayed (currently a placeholder: 132× '1')

### Unlock/Lock

- **Unlock**: Enter your password and click **Unlock**
- **Lock**: Click **Lock** to secure your wallet
- Auto-lock activates after 15 minutes of inactivity

### Testing the Provider

Visit `https://nockswap.io` (or any site matching content script permissions) and open the browser console:

```javascript
// Request accounts (must be unlocked)
const accounts = await window.nockchain.request({
  method: 'nock_requestAccounts'
});
console.log(accounts); // ['111...111']

// Send transaction (stub)
const tx = await window.nockchain.request({
  method: 'nock_sendTransaction',
  params: [{ to: '1'.repeat(132), amount: '1' }]
});
console.log(tx); // { txid: 'demo-xyz123' }

// Sign message (stub)
const sig = await window.nockchain.request({
  method: 'nock_signMessage',
  params: ['Hello, Nockchain!']
});
console.log(sig); // { signature: 'c2lnbmVkOkhlbGxvLCBOb2NrY2hhaW4h' }
```

## Development

### Build for Development

```bash
# Watch mode (rebuilds on file changes)
npm run dev
```

### Project Commands

- `npm run build` — Build extension for production
- `npm run dev` — Build and watch for changes
- `npm run preview` — Preview build (Vite only)

## Architecture

### Message Flow

```
Web Page (window.nockchain)
  ↓ window.postMessage
Content Script (bridge)
  ↓ chrome.runtime.sendMessage
Service Worker (wallet controller)
  ↓ vault operations
Chrome Storage (encrypted mnemonic)
```

### Security

- **Encryption**: PBKDF2 (200k iterations) + AES-GCM
- **Storage**: Encrypted vault stored in `chrome.storage.local`
- **Permissions**: Minimal (`storage`, `alarms`, `scripting`)
- **Auto-lock**: Configurable timeout with activity tracking

## API Reference

### Provider Methods (`window.nockchain`)

| Method | Params | Description |
|--------|--------|-------------|
| `nock_requestAccounts` | None | Returns array of addresses (when unlocked) |
| `nock_signMessage` | `[message]` | Signs a message (demo stub) |
| `nock_sendTransaction` | `[{to, amount}]` | Sends transaction (demo stub) |

### Internal Methods (Service Worker)

| Method | Params | Description |
|--------|--------|-------------|
| `wallet:setup` | `[password, mnemonic?]` | Creates encrypted vault |
| `wallet:unlock` | `[password]` | Unlocks vault |
| `wallet:lock` | None | Locks vault |
| `wallet:getState` | None | Returns `{locked, address}` |
| `wallet:setAutoLock` | `[minutes]` | Sets auto-lock timeout |

## TODOs (Post-Demo)

- [ ] Replace demo mnemonic/address with **real BIP-39** and Nockchain key derivation
- [ ] Implement **real RPC** for transaction broadcasting
- [ ] Add **transaction history** and **fee/nonce handling**
- [ ] Implement **Send/Receive flows** in popup
- [ ] Add **nockswap.io sign-in** methods
- [ ] Consider **offscreen document** for WebSocket if needed
- [ ] Add **unit tests** for validators and crypto utilities

## Testing

### Manual Testing Checklist

- [ ] Create vault with password
- [ ] Lock and unlock successfully
- [ ] Auto-lock after timeout (wait 15 min or adjust `autoLockMinutes`)
- [ ] Provider injection on nockswap.io
- [ ] `nock_requestAccounts` returns address when unlocked
- [ ] `nock_requestAccounts` throws LOCKED when locked
- [ ] `nock_sendTransaction` validates address format
- [ ] Send stub returns transaction ID

### Automated Tests

Add tests for:

- `validators.ts`: Address format validation
- `webcrypto.ts`: Encryption/decryption roundtrip
- `vault.ts`: Setup, unlock, lock flows

## License

Demo project for Nockchain wallet development.
