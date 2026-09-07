import { defineConfig } from 'vite';

// The app is a plain multi-module ES app; `index.html` at the repo root is the
// single entry point so GitHub Pages keeps working from `dist/`.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      output: {
        // Keep the charting library out of the main chunk so the simulation
        // starts painting before it finishes downloading.
        manualChunks: (id: string) => (id.includes('chart.js') ? 'charts' : undefined),
      },
    },
  },
  server: { port: 3000 },
});
