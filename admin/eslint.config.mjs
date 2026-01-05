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
      '.next/**',
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
      'next-env.d.ts'
    ]
  },
  ...compat.config({
    extends: ['next', 'next/core-web-vitals', 'next/typescript'],
    plugins: ['prettier'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'import/no-unresolved': 0,
      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.js', '.ts', '.jsx', '.tsx']
        }
      ],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
          '': 'never'
        }
      ],
      'import/prefer-default-export': 0,
      'no-underscore-dangle': 0,
      'no-unused-vars': 0,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react/require-default-props': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'no-param-reassign': 'off',
      'prettier/prettier': 'error'
    }
  })
];

export default eslintConfig;

