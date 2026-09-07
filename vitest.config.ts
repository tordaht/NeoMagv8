import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // The Playwright smoke test drives a real browser against a built bundle and
    // is run by its own script, not by the unit-test sweep.
    exclude: ['tests/smoke.test.ts', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**', 'src/lang/**', 'src/ml/**'],
      thresholds: { lines: 75, functions: 75, branches: 70, statements: 75 },
    },
  },
});
