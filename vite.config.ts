import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { readFileSync, writeFileSync, cpSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import manifest from './extension/manifest.json' with { type: 'json' };

export default defineConfig({
  plugins: [
    crx({ manifest }),
    // Fix for @crxjs/vite-plugin stripping icon fields
    {
      name: 'fix-manifest-icons',
      writeBundle() {
        const manifestPath = resolve(__dirname, 'dist/manifest.json');
        const builtManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

        // Add back the icons that @crxjs strips
        builtManifest.icons = {
          '16': 'icons/icon16.png',
          '32': 'icons/icon32.png',
          '48': 'icons/icon48.png',
          '128': 'icons/icon128.png',
        };

        builtManifest.action.default_icon = {
          '16': 'icons/icon16.png',
          '32': 'icons/icon32.png',
          '48': 'icons/icon48.png',
          '128': 'icons/icon128.png',
        };

        writeFileSync(manifestPath, JSON.stringify(builtManifest, null, 2));
      },
    },
    // Copy font files from @fontsource packages
    {
      name: 'copy-fonts',
      writeBundle() {
        const fontsDir = resolve(__dirname, 'dist/assets/files');
        if (!existsSync(fontsDir)) {
          mkdirSync(fontsDir, { recursive: true });
        }

        // Copy Inter font files
        const interFiles = resolve(__dirname, 'node_modules/@fontsource/inter/files');
        if (existsSync(interFiles)) {
          cpSync(interFiles, fontsDir, { recursive: true });
        }

        // Copy Lora font files
        const loraFiles = resolve(__dirname, 'node_modules/@fontsource/lora/files');
        if (existsSync(loraFiles)) {
          cpSync(loraFiles, fontsDir, { recursive: true });
        }
      },
    },
  ],
  root: 'extension',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Disable CSS code splitting to avoid document.* injection in service worker
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Preserve WASM files during build
        assetFileNames: assetInfo => {
          if (assetInfo.name?.endsWith('.wasm')) {
            // Preserve WASM files in their lib subdirectories
            if (assetInfo.name.includes('iris_wasm')) {
              return 'lib/iris-wasm/[name][extname]';
            }
            return 'lib/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        // Disable dynamic imports in service worker to avoid document.* injection
        inlineDynamicImports: false,
      },
    },
  },
  assetsInclude: ['**/*.wasm', '**/*.woff', '**/*.woff2'],
});
