# YubiKey Integration for Rose Wallet

## Overview

This integrates YubiKey hardware security keys with Rose Wallet using WebAuthn/FIDO2. It provides hardware-backed security for protecting your wallet's sensitive operations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Rose Wallet Extension                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌───────────────────┐    ┌──────────────────┐  │
│  │   Vault.ts   │───▶│ HardwareWallet.ts │───▶│   WebAuthn.ts    │  │
│  │ (seed store) │    │   (background)    │    │ (popup context)  │  │
│  └──────────────┘    └───────────────────┘    └──────────────────┘  │
│         │                     │                        │             │
│         ▼                     ▼                        ▼             │
│  ┌──────────────┐    ┌───────────────────┐    ┌──────────────────┐  │
│  │ AES-GCM      │    │ Credential        │    │ navigator.       │  │
│  │ Encryption   │    │ Storage           │    │ credentials API  │  │
│  └──────────────┘    └───────────────────┘    └──────────────────┘  │
│                                                        │             │
└────────────────────────────────────────────────────────┼─────────────┘
                                                         │
                                                         ▼
                                               ┌──────────────────┐
                                               │    YubiKey 5     │
                                               │   (USB/NFC)      │
                                               └──────────────────┘
```

## Security Modes

### Mode 1: PRF Key-Wrapping (YubiKey 5.2+)

**Best Security** - The YubiKey's PRF (Pseudo-Random Function) extension derives a unique encryption key that directly encrypts the vault.

```
                              ┌─────────────────┐
                              │  Physical       │
                              │  YubiKey        │
                              └────────┬────────┘
                                       │
                                       ▼
┌─────────────┐               ┌─────────────────┐
│ Vault       │◀──────────────│  PRF-Derived    │
│ (hwCipher)  │   AES-GCM     │  AES-256 Key    │
└─────────────┘               └─────────────────┘
```

**Security Properties:**
- YubiKey is REQUIRED to decrypt - password alone cannot unlock
- PRF output is unique per credential and never leaves the YubiKey
- Even if vault is exfiltrated, attacker needs physical YubiKey

### Mode 2: WebAuthn 2FA (Any FIDO2 Key)

**Good Security** - Falls back to this mode if PRF is not supported. YubiKey provides hardware-backed user verification before sensitive operations.

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────┐
│  User Password  │────▶│  Vault Decrypt   │────▶│  Operation    │
└─────────────────┘     └──────────────────┘     └───────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  YubiKey     │
                        │  Verification│
                        └──────────────┘
```

**Security Properties:**
- Physical presence required (tap the key)
- PIN verification (optional)
- Protection against remote attacks

## Protected Operations

If a YubiKey is configured, it provides two levels of protection:

### Unlock (PRF Mode)
- **YubiKey required to decrypt vault** on first unlock

### Sensitive Operations (Always Required)
Even while the wallet is unlocked, YubiKey verification is required for:

| Operation | Description |
|-----------|-------------|
| Sign Transaction | YubiKey tap required before signing any transaction |
| View Recovery Phrase | YubiKey tap required before showing mnemonic |

This provides convenience (don't need YubiKey for simple balance checks) while protecting critical operations.

## Files

| File | Purpose |
|------|---------|
| `shared/webauthn.ts` | WebAuthn/FIDO2 API wrapper (runs in popup) |
| `shared/prf-crypto.ts` | PRF key derivation (runs in background) |
| `shared/hardware-wallet.ts` | Credential storage manager (background) |
| `popup/hooks/useHardwareWallet.ts` | React hook for registration & verification |
| `popup/screens/YubiKeySettingsScreen.tsx` | Settings UI for YubiKey management |

## Usage

### Registering a YubiKey (React Hook)

Registration must happen in the popup context (has `window`). The hook handles:
1. WebAuthn credential creation (single PIN prompt)
2. PRF key derivation (if supported)
3. Vault encryption with hardware key
4. Credential storage in background

```tsx
import { useHardwareWallet } from '../hooks/useHardwareWallet';

function YubiKeySetup() {
  const { status, loading, error, register } = useHardwareWallet();

  const handleRegister = async () => {
    const result = await register('My YubiKey');
    if (result.success) {
      console.log('YubiKey registered!', result.prfEnabled ? 'PRF enabled' : '2FA only');
    } else {
      console.error('Registration failed:', result.error);
    }
  };

  return (
    <button onClick={handleRegister} disabled={loading}>
      {loading ? 'Touch your YubiKey...' : 'Add YubiKey'}
    </button>
  );
}
```

### Unlocking with Hardware Key

When vault is hardware-encrypted (v2), use `unlockWithHardware`:

```tsx
const { unlockWithHardware, status } = useHardwareWallet();

const handleUnlock = async () => {
  // Check if hardware unlock is required
  if (status?.mode === 'prf-key-wrapping') {
    const result = await unlockWithHardware('Unlock wallet');
    if (!result.success) {
      console.error('Hardware unlock failed:', result.error);
      return;
    }
    // Wallet is now unlocked
  }
};
```

### Verifying Before Sensitive Operations

```tsx
const { verify, status } = useHardwareWallet();

const handleSign = async () => {
  // If YubiKey is configured, require verification
  if (status?.enabled) {
    const result = await verify('Sign transaction to nock1abc...');
    if (!result.success) {
      alert('YubiKey verification required');
      return;
    }
  }
  // Proceed with signing...
};
```

### Full Example Component

```tsx
import { useHardwareWallet } from '../hooks/useHardwareWallet';

function SecuritySettings() {
  const {
    status,
    loading,
    error,
    register,
    verify,
    removeCredential,
    disable,
  } = useHardwareWallet();

  return (
    <div>
      <h2>Hardware Security</h2>
      
      {status?.enabled ? (
        <>
          <p>✅ YubiKey active ({status.mode})</p>
          <p>{status.credentialCount} key(s) registered</p>
          <button onClick={disable}>Remove All Keys</button>
        </>
      ) : (
        <>
          <p>No hardware key configured</p>
          <button onClick={() => register('YubiKey')} disabled={loading}>
            {loading ? 'Touch your YubiKey...' : 'Add YubiKey'}
          </button>
        </>
      )}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## Browser Compatibility

| Browser | WebAuthn | PRF Extension |
|---------|----------|---------------|
| Chrome 67+ | ✅ | ✅ (Chrome 109+) |
| Firefox 60+ | ✅ | ❌ |
| Safari 14+ | ✅ | ✅ (Safari 16.4+) |
| Edge 79+ | ✅ | ✅ (Edge 109+) |

## YubiKey Compatibility

| YubiKey Model | WebAuthn | PRF Support |
|---------------|----------|-------------|
| YubiKey 5 (5.2+) | ✅ | ✅ |
| YubiKey 5 (<5.2) | ✅ | ❌ |
| YubiKey Bio | ✅ | ✅ |
| YubiKey 4 | ✅ | ❌ |
| Security Key | ✅ | ❌ |

## Limitations

1. **No Direct Cheetah Signing**: YubiKey cannot perform Cheetah curve signatures directly (custom curve). Signing is done in software after hardware verification.

2. **Popup Context Required**: WebAuthn APIs (`navigator.credentials`) only work in the popup, not the background service worker. The architecture handles this by running WebAuthn in popup and sending results to background.

3. **Chrome Extension RP ID**: For Chrome extensions, the Relying Party ID is automatically set to the extension origin. This is handled by omitting the `rp.id` field.

4. **No U2F Fallback**: This implementation uses WebAuthn only, not legacy U2F.

5. **Two Taps During Setup**: WebAuthn PRF only returns output during assertion (verification), not during credential creation. Initial setup requires two YubiKey taps: one for registration, one for encryption key. Subsequent unlocks need only one tap.

## Future Enhancements

1. **Native Messaging Host**: For full PIV access and hardware-based key storage
2. **Multi-YubiKey Support**: Already supported - register multiple keys as backup
3. **Recovery Flow**: What happens if YubiKey is lost
4. **Attestation Verification**: Verify YubiKey authenticity

## Security Considerations

1. **Origin Binding**: WebAuthn credentials are bound to the extension origin
2. **User Verification**: Always request `userVerification: 'required'`
3. **Credential Storage**: Only store credential ID, never private material
4. **PIN Brute Force**: YubiKey has built-in retry lockout
5. **Vault Encryption**: When PRF is enabled, vault upgrades to v2 with `hwCipher` - password alone cannot decrypt

## Testing

```bash
# Run extension in development mode
npm run dev

# Navigate to Settings > Hardware Wallet
# Register a YubiKey and test verification
```

## Vault Encryption Flow

Initial setup requires **two YubiKey taps** (WebAuthn limitation):

```
Step 1: Registration (tap #1)
┌──────────────────┐     ┌─────────────────┐
│  Create          │────▶│  Credential ID  │  (prf.enabled: true)
│  Credential      │     │  + PRF Support  │  (no PRF output yet)
└──────────────────┘     └─────────────────┘

Step 2: Verification (tap #2)
┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Verify with     │────▶│  PRF Output     │────▶│  HKDF Derive     │
│  Credential      │     │  (32 bytes)     │     │  AES-256 Key     │
└──────────────────┘     └─────────────────┘     └──────────────────┘
                                                          │
                                                          ▼
┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Vault v2        │◀────│  AES-GCM        │◀────│  Vault Payload   │
│  (hwCipher)      │     │  Encrypt        │     │  (mnemonic, etc) │
└──────────────────┘     └─────────────────┘     └──────────────────┘
```

**Future unlocks** only need **one tap** (verification to get PRF key).

The vault structure after YubiKey setup:
```json
{
  "version": 2,
  "kdf": { "..." },
  "cipher": { "..." },      // Password-encrypted (backup)
  "hwCipher": { "..." }     // Hardware-encrypted (PRIMARY)
}
```

## Troubleshooting

**"NotAllowedError"**: User cancelled or timeout. Try again with key ready.

**"InvalidStateError"**: Credential already exists. Remove and re-register.

**"NotSupportedError"**: YubiKey doesn't support required features.

**"The operation is not allowed in this context"**: WebAuthn must run in popup, not background.

**No PRF support**: YubiKey firmware < 5.2 or browser doesn't support PRF extension.

**Vault still v1 after setup**: Check console for PRF detection. Registration must succeed with `prfEnabled: true`.

**Two PIN prompts during setup**: This is expected. The WebAuthn spec only returns PRF output during assertion (verification), not during credential creation. Setup requires: (1) create credential, (2) verify to get encryption key. Future unlocks only need one tap.

