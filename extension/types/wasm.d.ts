/**
 * Type declarations for WASM modules
 * TypeScript can't find the .d.ts files when importing .js extensions
 * with moduleResolution: "bundler", so we declare them here
 */

/// <reference path="@nockchain/rose-wasm/rose_wasm.d.ts" />

declare module '@nockchain/rose-wasm/rose_wasm.js' {
  export * from '@nockchain/rose-wasm/rose_wasm';
  import init from '@nockchain/rose-wasm/rose_wasm';
  export default init;
}
