/**
 * ESLint configuration is a bit harsh to understand at first, it's made of several
 * plugins and config extensions, what makes it flexible but complex. Let's clarify
 * it's building blocks:
 *
 * - eslint:recommended: inbuilt sets of recommended rules for ESLint
 *
 * ◼ @typescript-eslint/parser: Integration between TS and ESLint. In short, it ships
 * a specific ESLint parser that replaces its default parser and makes ESLint
 * understand TypeScript.
 * ◼ @typescript-eslint/eslint-plugin: Adds specific Typescript linting rules to
 * run in ESLint.
 *  - @typescript-eslint: load clause to load this plugin.
 *  - plugin:@typescript-eslint/recommended: preset clause with recommended rules
 *    for TypeScript.
 * ◼ eslint-plugin-prettier: Runs Prettier as an ESLint rule and reports differences
 * as individual ESLint issues
 *  - prettier = load clause to load this plugin.
 *  - plugin:prettier/recommended = preset clause shipped with eslint-plugin-prettier
 *    to setup the plugin itself and eslint-config-prettier as well. It activates
 *    'prettier' preset clause underneath, no need to write both.
 * ◼ eslint-config-prettier: Disable all formatting-related ESLint rules, and let
 * Prettier take care of formatting.
 *  - prettier: preset clause to disable rules that might conflict with prettier
 *    formatting. Since version 8, this single clause takes care of other plugins
 *    (https://github.com/prettier/eslint-config-prettier/blob/main/CHANGELOG.md#version-800-2021-02-21)
 * ◼ eslint-plugin-react: A set of React specific linting rules for ESLint.
 *  - plugin:react/recommended = preset clause with recommended React rules.
 *
 * IMPORTANT: The order of the preset clauses matters!
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    // Core rules. REMEMBER: Do not enable formatting-related rules, that's a prettier business.
    eqeqeq: ['warn', 'smart'],
    radix: 'off',
    'default-case': 'warn',
    'dot-notation': 'off',
    'guard-for-in': 'warn',
    'no-bitwise': 'warn',
    'no-caller': 'warn',
    'no-console': ['warn', { allow: ['log', 'error', 'info'] }],
    'no-debugger': 'warn', // [eslint:recommended] Downgraded to warn
    'no-empty': 'warn', // [eslint:recommended] Downgraded to warn
    'no-eval': 'warn',
    'no-fallthrough': 'warn',
    'no-labels': 'warn',
    'no-new-wrappers': 'warn',
    'no-redeclare': 'warn',
    'no-restricted-properties': 'off',
    'no-shadow': 'off',
    'no-unused-expressions': 'off',
    'no-use-before-define': 'off',
    'no-duplicate-imports': 'warn', // [added]
    'no-nested-ternary': 'warn', // [added]
    // Prettier rules (eslint-plugin-prettier)
    'prettier/prettier': 'warn', // [eslint-plugin-prettier] Downgraded to warn
  },
  // Generic section for JS files
  overrides: [
    // Specific override section for TS/TSX files
    {
      files: '**/*.+(ts|tsx)',
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // Lint also specific subprojects by adding its tsconfig here
        project: [
          './tsconfig.json',
          './cypress/tsconfig.json',
          './mock-server/tsconfig.json',
          './mock-na-console/tsconfig.json',
        ],
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['@typescript-eslint', '@emotion/eslint-plugin', 'prettier'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
      ],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'no-shadow': 'off',
        // TS related rules (@typescript-eslint/eslint-plugin)
        '@typescript-eslint/ban-types': 'warn', // [plugin:@typescript-eslint/recommended] Downgraded to warn
        '@typescript-eslint/explicit-module-boundary-types': 'off', // [plugin:@typescript-eslint/recommended] Turned off, too restrictive, does not allow return type inference
        '@typescript-eslint/member-ordering': 'warn', // [added]
        // PENDING: Turn on this rule again to warn once the types are properly set
        '@typescript-eslint/no-explicit-any': 'off', // [plugin:@typescript-eslint/recommended] Downgraded to warn
        '@typescript-eslint/no-inferrable-types': 'off', // [plugin:@typescript-eslint/recommended] Turned off
        '@typescript-eslint/no-namespace': ['warn', { allowDeclarations: true }], // [plugin:@typescript-eslint/recommended] Downgraded to warn
        '@typescript-eslint/no-shadow': 'error', // [added] Use this instead core rule `no-shadow` to avoid false positives
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ], // [plugin:@typescript-eslint/recommended] Downgraded to warn, fine tuned
        // React rules (eslint-plugin-react)
        'react/prop-types': 'off', // [plugin:react/recommended] Turned off, too verbose
        'react/display-name': 'off', // [plugin:react/recommended] Turned off, to be reviewed for debug purposes
        'react/no-unknown-property': ['error', { ignore: ['css'] }], // [plugin:react/recommended] Ignore css property for @emotion/react. See https://emotion.sh/docs/eslint-plugin-react
      },
    },
  ],
};
