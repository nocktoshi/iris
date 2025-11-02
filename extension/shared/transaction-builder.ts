/**
 * Transaction Builder
 * High-level API for constructing Nockchain transactions
 */

import initCryptoWasm, { signDigest, tip5Hash } from '../lib/nbx-crypto/nbx_crypto.js';
import initTxWasm, {
  WasmSeed,
  WasmSpend,
  WasmNote,
  WasmInput,
  WasmRawTx,
} from '../lib/nbx-nockchain-types/nbx_nockchain_types.js';

let cryptoWasmInitialized = false;
let txWasmInitialized = false;

/**
 * Ensure crypto WASM is initialized
 */
async function ensureCryptoWasmInit(): Promise<void> {
  if (!cryptoWasmInitialized) {
    // In service worker context, provide explicit WASM URL
    // Must pass as object to avoid deprecated parameter warning
    const cryptoWasmUrl = chrome.runtime.getURL('lib/nbx-crypto/nbx_crypto_bg.wasm');
    await initCryptoWasm({ module_or_path: cryptoWasmUrl });
    cryptoWasmInitialized = true;
  }
}

/**
 * Ensure transaction WASM is initialized
 */
async function ensureTxWasmInit(): Promise<void> {
  if (!txWasmInitialized) {
    // In service worker context, provide explicit WASM URL
    // Must pass as object to avoid deprecated parameter warning
    const txWasmUrl = chrome.runtime.getURL('lib/nbx-nockchain-types/nbx_nockchain_types_bg.wasm');
    await initTxWasm({ module_or_path: txWasmUrl });
    txWasmInitialized = true;
  }
}

/**
 * Note data from RPC balance query
 */
export interface Note {
  version: number;
  originPage: bigint;
  timelockMin?: bigint;
  timelockMax?: bigint;
  nameFirst: Uint8Array;
  nameLast: Uint8Array;
  lockPubkeys: Uint8Array[];
  lockKeysRequired: bigint;
  sourceHash: Uint8Array;
  sourceIsCoinbase: boolean;
  assets: number; // amount in nicks
}

/**
 * Payment output specification
 */
export interface PaymentOutput {
  recipientPubkey: Uint8Array; // 97 bytes
  amount: number; // nicks
  relativeLockMin?: bigint;
  relativeLockMax?: bigint;
}

/**
 * Transaction parameters
 */
export interface TransactionParams {
  /** Notes (UTXOs) to spend */
  notes: Note[];
  /** Payment outputs */
  outputs: PaymentOutput[];
  /** Transaction fee in nicks */
  fee: number;
  /** Private key for signing (32 bytes) */
  privateKey: Uint8Array;
  /** Public key for signature (97 bytes) */
  publicKey: Uint8Array;
}

/**
 * Constructed transaction ready for broadcast
 */
export interface ConstructedTransaction {
  /** Transaction ID (40 bytes) */
  txId: Uint8Array;
  /** Total fees */
  totalFees: number;
  /** Serialized transaction bytes (placeholder - needs RPC format) */
  serialized: Uint8Array;
  /** Number of inputs */
  inputCount: number;
}

/**
 * Build a complete Nockchain transaction
 *
 * @param params - Transaction parameters
 * @returns Constructed transaction ready for broadcast
 */
export async function buildTransaction(
  params: TransactionParams
): Promise<ConstructedTransaction> {
  // Initialize both WASM modules
  await ensureCryptoWasmInit();
  await ensureTxWasmInit();

  const { notes, outputs, fee, privateKey, publicKey } = params;

  // Validate inputs
  if (notes.length === 0) {
    throw new Error('At least one note (UTXO) is required');
  }
  if (outputs.length === 0) {
    throw new Error('At least one output is required');
  }
  if (privateKey.length !== 32) {
    throw new Error('Private key must be 32 bytes');
  }
  if (publicKey.length !== 97) {
    throw new Error('Public key must be 97 bytes');
  }

  // Calculate total available from notes
  const totalAvailable = notes.reduce((sum, note) => sum + note.assets, 0);
  const totalOutputs = outputs.reduce((sum, out) => sum + out.amount, 0);

  if (totalAvailable < totalOutputs + fee) {
    throw new Error(
      `Insufficient funds: have ${totalAvailable} nicks, need ${totalOutputs + fee} (${totalOutputs} outputs + ${fee} fee)`
    );
  }

  // Create inputs array
  const inputs: WasmInput[] = [];

  for (const note of notes) {
    // Convert Note to WasmNote
    const wasmNote = new WasmNote(
      note.version,
      note.originPage,
      note.timelockMin ?? null,
      note.timelockMax ?? null,
      note.nameFirst,
      note.nameLast,
      note.lockPubkeys,
      note.lockKeysRequired,
      note.sourceHash,
      note.sourceIsCoinbase,
      note.assets
    );

    // Create seeds (outputs) for this spend
    // For simplicity, we'll create all outputs in the first spend
    // (More sophisticated builders might distribute across multiple spends)
    const seeds: WasmSeed[] = [];

    if (inputs.length === 0) {
      // First input - add all payment outputs
      for (const output of outputs) {
        // Parent hash = note name (first part)
        const seed = output.relativeLockMin !== undefined || output.relativeLockMax !== undefined
          ? WasmSeed.newWithTimelock(
              output.recipientPubkey,
              output.amount,
              note.nameFirst,
              output.relativeLockMin ?? null,
              output.relativeLockMax ?? null
            )
          : new WasmSeed(
              output.recipientPubkey,
              output.amount,
              note.nameFirst
            );
        seeds.push(seed);
      }
    }

    // Create spend
    const spend = new WasmSpend(seeds, fee);

    // Sign the spend
    const digest = spend.getSigningDigest();
    const signature = signDigest(privateKey, digest);
    spend.addSignature(publicKey, signature);

    // Create input linking note to spend
    const input = new WasmInput(wasmNote, spend);
    inputs.push(input);
  }

  // Assemble complete transaction
  const tx = new WasmRawTx(inputs);

  return {
    txId: tx.getTxId(),
    totalFees: tx.getTotalFees(),
    serialized: tx.serialize(),
    inputCount: tx.getInputCount(),
  };
}

/**
 * Create a simple payment transaction (single recipient)
 *
 * @param note - UTXO to spend
 * @param recipientPubkey - Recipient's public key (97 bytes)
 * @param amount - Amount to send in nicks
 * @param changePubkey - Your public key for change (97 bytes)
 * @param fee - Transaction fee in nicks
 * @param privateKey - Your private key (32 bytes)
 * @param publicKey - Your public key (97 bytes)
 * @returns Constructed transaction
 */
export async function buildPayment(
  note: Note,
  recipientPubkey: Uint8Array,
  amount: number,
  changePubkey: Uint8Array,
  fee: number,
  privateKey: Uint8Array,
  publicKey: Uint8Array
): Promise<ConstructedTransaction> {
  const totalNeeded = amount + fee;

  if (note.assets < totalNeeded) {
    throw new Error(
      `Insufficient funds in note: have ${note.assets} nicks, need ${totalNeeded}`
    );
  }

  const outputs: PaymentOutput[] = [
    // Payment to recipient
    {
      recipientPubkey,
      amount,
    },
  ];

  // Add change output if there's any left
  const change = note.assets - totalNeeded;
  if (change > 0) {
    outputs.push({
      recipientPubkey: changePubkey,
      amount: change,
    });
  }

  return buildTransaction({
    notes: [note],
    outputs,
    fee,
    privateKey,
    publicKey,
  });
}

/**
 * Estimate transaction size in bytes (for fee estimation)
 * This is a rough estimate - actual size depends on serialization format
 *
 * @param inputCount - Number of inputs
 * @param outputCount - Number of outputs
 * @returns Estimated size in bytes
 */
export function estimateTransactionSize(
  inputCount: number,
  outputCount: number
): number {
  // Rough estimates based on typical sizes:
  // - Each input: ~200 bytes (note data + signature)
  // - Each output: ~150 bytes (seed data)
  // - Transaction overhead: ~100 bytes
  return 100 + (inputCount * 200) + (outputCount * 150);
}

/**
 * Calculate recommended fee based on transaction size
 *
 * @param inputCount - Number of inputs
 * @param outputCount - Number of outputs
 * @param feePerByte - Fee per byte in nicks (default: 1 nick/byte)
 * @returns Recommended fee in nicks
 */
export function calculateRecommendedFee(
  inputCount: number,
  outputCount: number,
  feePerByte: number = 1
): number {
  const size = estimateTransactionSize(inputCount, outputCount);
  return size * feePerByte;
}
