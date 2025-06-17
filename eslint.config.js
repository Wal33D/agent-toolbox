const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.config({
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    env: {
      node: true,
      es2021: true,
    },
  }),
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
];
