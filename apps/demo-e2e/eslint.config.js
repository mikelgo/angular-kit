const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.js');
const js = require('@eslint/js');
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});
module.exports = [
  ...baseConfig,
  ...compat.extends('plugin:cypress/recommended'),
  {
    files: ['apps/demo-e2e/**/*.ts', 'apps/demo-e2e/**/*.tsx', 'apps/demo-e2e/**/*.js', 'apps/demo-e2e/**/*.jsx'],
    rules: {},
  },
  {
    files: ['apps/demo-e2e/src/plugins/index.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
    },
  },
];
