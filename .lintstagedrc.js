module.exports = {
  // Note that each key is a paralell tass. Be careful with overlaping globs
  // for these tasks to avoid tasks that might interfere to each other.
  // Example: formatting and linting should go in sequence.

  // Lint and format staged/changed CODE files
  '*.{js,ts,tsx}': [
    'prettier --write',
    'eslint --fix --max-warnings 0 --cache --cache-location .cache/.eslintcache',
  ],
  // Only format staged/changed EXTRA files
  '*.{html,scss,json,md}': ['prettier --write'],
};
