import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import manifest from './manifest.json';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    viteStaticCopy({
      targets: [
        {
          src: 'public/_locales',
          dest: '.',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
