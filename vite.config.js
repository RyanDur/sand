/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'sand',
      fileName: 'sand',
    },
  },
  test: {
    globals: true,
    coverage: {
      exclude: ['src/development', 'setupTests.ts', 'src/index.ts', '**/types*/**'],
    }
  },
});
