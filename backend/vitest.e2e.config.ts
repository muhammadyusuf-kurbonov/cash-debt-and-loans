import { defineConfig } from 'vitest/config';

/**
 * End-to-end tests. Boots the real Nest app, so these need a reachable
 * database — `app.e2e-spec.ts` imports `AppModule`.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: false,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});