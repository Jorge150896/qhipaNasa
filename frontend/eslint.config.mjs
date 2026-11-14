import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
const banned = (patterns, message) => ['error', { patterns: [{ group: patterns, message }] }];
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'next-env.d.ts', 'coverage/**']),
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': banned(
        [
          'react',
          'react/*',
          'next',
          'next/*',
          '@/presentation/**',
          '@/data/**',
          '@/infrastructure/**',
          '@/di/**',
        ],
        'Domain debe permanecer independiente de frameworks y capas externas.',
      ),
    },
  },
  {
    files: ['src/presentation/**/use*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': banned(
        ['@/data/**', '@/infrastructure/**', '@/di/**', 'next/navigation'],
        'Los hooks reciben casos de uso ya compuestos y no navegan.',
      ),
    },
  },
  {
    files: ['src/presentation/**/*View.tsx', 'src/presentation/**/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': banned(
        ['@/domain/**', '@/data/**', '@/infrastructure/**', '@/di/**', 'next/navigation'],
        'Las Views solo reciben modelos presentables y callbacks.',
      ),
    },
  },
  {
    files: ['src/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': banned(
        ['@/data/**', '@/presentation/**', '@/di/**'],
        'Infrastructure no depende de presentación, data ni composición.',
      ),
    },
  },
  {
    files: ['src/data/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': banned(
        ['@/presentation/**', '@/di/**', 'react', 'next/*'],
        'Data implementa contratos de dominio sin depender de la UI.',
      ),
    },
  },
]);
