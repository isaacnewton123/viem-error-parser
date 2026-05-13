import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        'src/entry-*.ts',
        'src/integrations/react.ts',
        'src/**/*.d.ts',
      ],
      thresholds: {
        // utils/ and core/ extractors achieve >=90% line coverage. The decoder
        // and classifier have many defensive branches that are intentionally
        // hard to reach with synthetic fixtures; the global floor reflects that.
        lines: 90,
        branches: 80,
        functions: 90,
        statements: 90,
      },
    },
  },
});
