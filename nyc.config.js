module.exports = {
  // Configuration for istanbul plugin + nyc dependency for code coverage in
  // cypress flavour component testing
  extends: '@istanbuljs/nyc-config-typescript',
  reporter: ['json', 'lcovonly', 'html'],
  'report-dir': 'reports/test-component/coverage',
  'temp-dir': 'reports/test-component/coverage/temp',
};
