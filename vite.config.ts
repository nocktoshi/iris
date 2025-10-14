import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './extension/manifest.json' with { type: 'json' };

export default defineConfig({
  plugins: [crx({ manifest })],
  root: 'extension',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
