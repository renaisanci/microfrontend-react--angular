const { merge } = require('webpack-merge');
const base = require('./webpack.base');

/**
 * ⚠ Note about ENV Variables
 * This specific webpack configuration is intended to be consumed by Cypress
 * component testing flavour, and thus, it is exported as a factory in order
 * to be able to inject the set of laoded env variables for Cypress config.
 */

module.exports = injectedProcessEnvFromCypress => {
  // ⚠ Inject env from Cypress to have a single source of truth.
  process.env = injectedProcessEnvFromCypress;

  // Set NODE_ENV prior to merge() as babel plugins might depend on dev/prod
  process.env.NODE_ENV = 'development';

  return (cliParams = {}, argv = {}) =>
    merge(base({ embedAssets: false, embedStyles: true, ...cliParams }, argv), {
      mode: 'development',
      devServer: {
        // host: 'localhost', // DO NOT SPECIFY IT or cypress will hang up.
        port: process.env.COMPONENT_TESTING_SERVER_PORT || 8093,
        hot: true,
        historyApiFallback: true,
      },
    });
};
