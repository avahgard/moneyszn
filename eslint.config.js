import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.test-builds/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
      },
    },
  },
  {
    files: ['scripts/sw-template.js'],
    languageOptions: {
      globals: {
        config: 'readonly',
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
      },
    },
  },
);
