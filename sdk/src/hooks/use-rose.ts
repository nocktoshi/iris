import { useEffect, useMemo, useState } from 'react';
import { NockchainProvider } from '../provider.js';
import initWasm, { GrpcClient } from '@nockchain/rose-wasm/rose_wasm.js';

const ROSE_SDK_WASM_INIT_KEY = '__nockchain_rose_sdk_wasm_init_promise__';
const ROSE_SDK_PROVIDER_KEY = '__nockchain_rose_sdk_provider__';

/**
 * Initialize Rose WASM once per page load.
 * Uses globalThis so React StrictMode + Vite HMR won't accidentally re-init.
 */
type WasmInit = ReturnType<typeof initWasm>;

function ensureWasmInitializedOnce(): WasmInit {
  const g = globalThis as typeof globalThis & Record<string, unknown>;

  const existing = g[ROSE_SDK_WASM_INIT_KEY];
  if (existing && existing instanceof Promise) {
    return (existing as WasmInit).catch(err => {
      if (g[ROSE_SDK_WASM_INIT_KEY] === existing) {
        delete g[ROSE_SDK_WASM_INIT_KEY];
      }
      throw err;
    }) as WasmInit;
  }

  const p = initWasm().catch(err => {
    if (g[ROSE_SDK_WASM_INIT_KEY] === p) {
      delete g[ROSE_SDK_WASM_INIT_KEY];
    }
    throw err;
  }) as WasmInit;

  g[ROSE_SDK_WASM_INIT_KEY] = p;
  return p;
}

function getProviderOnce(): NockchainProvider {
  const g = globalThis as typeof globalThis & Record<string, unknown>;
  const existing = g[ROSE_SDK_PROVIDER_KEY];
  if (existing instanceof NockchainProvider) return existing;

  const provider = new NockchainProvider();
  g[ROSE_SDK_PROVIDER_KEY] = provider;
  return provider;
}

export type UseRoseStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useRose({ rpcUrl = 'https://rpc.nockbox.org' }: { rpcUrl?: string } = {}) {
  const [provider, setProvider] = useState<NockchainProvider | null>(null);
  const [rpcClient, setRpcClient] = useState<GrpcClient | null>(null);
  const [status, setStatus] = useState<UseRoseStatus>('idle');
  const [error, setError] = useState<unknown>(null);

  const options = useMemo(() => ({ rpcUrl }), [rpcUrl]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    ensureWasmInitializedOnce()
      .then(() => {
        if (cancelled) return;
        setProvider(getProviderOnce());
        setRpcClient(new GrpcClient(options.rpcUrl));
        setStatus('ready');
      })
      .catch(err => {
        if (cancelled) return;
        setError(err);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [options]);

  return {
    provider,
    rpcClient,
    wasm: initWasm,
    status,
    error,
    isReady: status === 'ready',
  };
}
