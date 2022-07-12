import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: './src/index.js',
      name: 'CemPluginHybrids',
      fileName: 'cem-plugin-hybrids',
    },
    rollupOptions: {
      external: ['typescript'],
    }
  },
});
