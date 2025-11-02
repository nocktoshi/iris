import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './extension/manifest.json' with { type: 'json' };

export default defineConfig({
  plugins: [crx({ manifest })],
  root: 'extension',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Disable CSS code splitting to avoid document.* injection in service worker
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Preserve WASM files during build
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.wasm')) {
            // Preserve WASM files in their lib subdirectories
            if (assetInfo.name.includes('nbx_nockchain_types')) {
              return 'lib/nbx-nockchain-types/[name][extname]';
            }
            return 'lib/nbx-crypto/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        // Disable dynamic imports in service worker to avoid document.* injection
        inlineDynamicImports: false,
      }
    }
  },
  assetsInclude: ['**/*.wasm']
});
