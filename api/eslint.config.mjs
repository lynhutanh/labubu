import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      '*.min.css',
      'yarn.lock',
      'package-lock.json',
      '.env*',
      'public/**',
      '*.log',
      'migrations/**'
    ]
  },
  {
    files: ['src/**/*.ts'],
    ...compat.config({
      plugins: ['@typescript-eslint', 'prettier'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-unused-vars': 'off',
        'prefer-const': 'error',
        'no-var': 'error',
        'prettier/prettier': 'error'
      }
    })[0]
  }
];

export default eslintConfig;
