/* tslint:disable */
/* eslint-disable */
/**
 * WASM-compatible Input wrapper (links a Note to a Spend)
 */
export class WasmInput {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create an input by linking a note (UTXO) to a spend
   */
  constructor(note: WasmNote, spend: WasmSpend);
  /**
   * Get the input's value (amount from the note)
   */
  readonly value: number;
  /**
   * Get the fee from the spend
   */
  readonly fee: number;
}
/**
 * WASM-compatible Note wrapper (represents a UTXO)
 */
export class WasmNote {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create a note from its constituent parts
   *
   * This is typically constructed from data received via RPC query.
   *
   * Arguments:
   * - version: 0, 1, or 2
   * - origin_page: block height where note was created (u64)
   * - timelock_min: minimum timelock block height (or null for none)
   * - timelock_max: maximum timelock block height (or null for none)
   * - name_first: 40 bytes (first digest of name)
   * - name_last: 40 bytes (last digest of name)
   * - lock_pubkeys: JavaScript Array of Uint8Arrays (each 97 bytes)
   * - lock_keys_required: how many signatures needed (for multisig)
   * - source_hash: 40 bytes (hash of source transaction)
   * - source_is_coinbase: boolean
   * - assets: amount in nicks
   */
  constructor(version: number, origin_page: bigint, timelock_min: bigint | null | undefined, timelock_max: bigint | null | undefined, name_first: Uint8Array, name_last: Uint8Array, lock_pubkeys: any[], lock_keys_required: bigint, source_hash: Uint8Array, source_is_coinbase: boolean, assets: number);
  /**
   * Get the note's name (first part) as 40 bytes
   */
  getNameFirst(): Uint8Array;
  /**
   * Get the note's name (last part) as 40 bytes
   */
  getNameLast(): Uint8Array;
  /**
   * Get the note's amount
   */
  readonly assets: number;
}
/**
 * WASM-compatible RawTx wrapper (complete transaction)
 */
export class WasmRawTx {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create a complete transaction from inputs
   *
   * This calculates the transaction ID and aggregates fees/timelocks
   */
  constructor(inputs: WasmInput[]);
  /**
   * Get the transaction ID (40 bytes)
   */
  getTxId(): Uint8Array;
  /**
   * Get total fees for this transaction
   */
  getTotalFees(): number;
  /**
   * Get number of inputs
   */
  getInputCount(): number;
  /**
   * Serialize transaction to bytes for network broadcast
   *
   * Returns the transaction serialized in the network wire format
   * TODO: Implement proper network serialization format
   */
  serialize(): Uint8Array;
}
/**
 * WASM-compatible Seed wrapper
 */
export class WasmSeed {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create a simple seed (payment to a single pubkey)
   *
   * Arguments:
   * - recipient_pubkey: 97 bytes
   * - amount: amount in nicks (smallest unit)
   * - parent_hash: 40 bytes (5 belts × 8 bytes)
   */
  constructor(recipient_pubkey: Uint8Array, amount: number, parent_hash: Uint8Array);
  /**
   * Create a seed with timelock
   */
  static newWithTimelock(recipient_pubkey: Uint8Array, amount: number, parent_hash: Uint8Array, relative_min?: bigint | null, relative_max?: bigint | null): WasmSeed;
  /**
   * Get the hash of this seed (for debugging)
   */
  getHash(): Uint8Array;
  /**
   * Get the amount
   */
  readonly amount: number;
}
/**
 * WASM-compatible Spend wrapper
 */
export class WasmSpend {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create a new spend (unsigned)
   *
   * Takes an array of WasmSeed objects and a fee amount
   */
  constructor(seeds: WasmSeed[], fee: number);
  /**
   * Get the signing digest for this spend
   *
   * Returns 40 bytes (5 belts) that should be signed with the private key
   */
  getSigningDigest(): Uint8Array;
  /**
   * Add a signature to this spend
   *
   * Arguments:
   * - public_key: 97 bytes
   * - signature_json: JSON string with format {"chal": "...", "sig": "..."}
   */
  addSignature(public_key: Uint8Array, signature_json: string): void;
  /**
   * Sign this spend with a private key (convenience method)
   *
   * This is equivalent to calling getSigningDigest, signing externally,
   * and then calling addSignature.
   */
  sign(private_key_bytes: Uint8Array): void;
  /**
   * Get number of signatures
   */
  signatureCount(): number;
  /**
   * Get the fee amount
   */
  readonly fee: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmseed_free: (a: number, b: number) => void;
  readonly wasmseed_new: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly wasmseed_newWithTimelock: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: bigint) => [number, number, number];
  readonly wasmseed_amount: (a: number) => number;
  readonly wasmseed_getHash: (a: number) => [number, number];
  readonly __wbg_wasmspend_free: (a: number, b: number) => void;
  readonly wasmspend_new: (a: number, b: number, c: number) => number;
  readonly wasmspend_getSigningDigest: (a: number) => [number, number];
  readonly wasmspend_addSignature: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly wasmspend_sign: (a: number, b: number, c: number) => [number, number];
  readonly wasmspend_signatureCount: (a: number) => number;
  readonly wasmspend_fee: (a: number) => number;
  readonly __wbg_wasmnote_free: (a: number, b: number) => void;
  readonly wasmnote_new: (a: number, b: bigint, c: number, d: bigint, e: number, f: bigint, g: number, h: number, i: number, j: number, k: number, l: number, m: bigint, n: number, o: number, p: number, q: number) => [number, number, number];
  readonly wasmnote_getNameFirst: (a: number) => [number, number];
  readonly wasmnote_getNameLast: (a: number) => [number, number];
  readonly __wbg_wasminput_free: (a: number, b: number) => void;
  readonly wasminput_new: (a: number, b: number) => number;
  readonly wasminput_value: (a: number) => number;
  readonly wasminput_fee: (a: number) => number;
  readonly __wbg_wasmrawtx_free: (a: number, b: number) => void;
  readonly wasmrawtx_new: (a: number, b: number) => [number, number, number];
  readonly wasmrawtx_getTxId: (a: number) => [number, number];
  readonly wasmrawtx_getTotalFees: (a: number) => number;
  readonly wasmrawtx_getInputCount: (a: number) => number;
  readonly wasmrawtx_serialize: (a: number) => [number, number, number, number];
  readonly wasmnote_assets: (a: number) => number;
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_alloc: () => number;
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
