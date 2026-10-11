import { defineConfig } from 'vitest/config';

/**
 * Unit tests only. `test:e2e` uses `vitest.e2e.config.ts`.
 *
 * `resolve.tsconfigPaths` handles the `src/...` aliases declared in tsconfig
 * (`baseUrl: "./"`, `paths: { "*": ["./*"] }`), which Jest never resolved — the
 * old setup could only load those modules through a `virtual: true` mock.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: './coverage',
    },
  },
});