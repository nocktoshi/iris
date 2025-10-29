/* tslint:disable */
/* eslint-disable */
/**
 * Derive master key from seed bytes
 */
export function deriveMasterKey(seed: Uint8Array): WasmExtendedKey;
/**
 * Derive master key from BIP39 mnemonic phrase
 */
export function deriveMasterKeyFromMnemonic(mnemonic: string, passphrase?: string | null): WasmExtendedKey;
/**
 * Sign a digest (hash) with a private key
 *
 * This is the critical signing function needed for transactions.
 * The digest should be the TIP5 hash of the transaction data.
 */
export function signDigest(private_key_bytes: Uint8Array, digest_bytes: Uint8Array): any;
/**
 * Verify a signature against a digest and public key
 */
export function verifySignature(public_key_bytes: Uint8Array, digest_bytes: Uint8Array, signature_json: string): boolean;
/**
 * Compute TIP5 hash of data
 */
export function tip5Hash(data: Uint8Array): Uint8Array;
export class WasmExtendedKey {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Derive a child key at the given index
   */
  deriveChild(index: number): WasmExtendedKey;
  readonly private_key: Uint8Array | undefined;
  readonly public_key: Uint8Array;
  readonly chain_code: Uint8Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmextendedkey_free: (a: number, b: number) => void;
  readonly wasmextendedkey_private_key: (a: number) => [number, number];
  readonly wasmextendedkey_public_key: (a: number) => [number, number];
  readonly wasmextendedkey_chain_code: (a: number) => [number, number];
  readonly wasmextendedkey_deriveChild: (a: number, b: number) => [number, number, number];
  readonly deriveMasterKey: (a: number, b: number) => number;
  readonly deriveMasterKeyFromMnemonic: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly signDigest: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly verifySignature: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
  readonly tip5Hash: (a: number, b: number) => [number, number, number, number];
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
