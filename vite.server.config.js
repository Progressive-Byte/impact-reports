import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    ssr: 'server/index.js',
    outDir: 'dist/server',
    sourcemap: true,
    rollupOptions: {
      output: {
        format: 'esm',
      },
    },
  },
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, './server'),
    },
  },
});
