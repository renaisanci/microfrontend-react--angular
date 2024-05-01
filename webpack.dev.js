const { merge } = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const base = require('./webpack.base');
const env = require('../env');
const path = require('../path');


// Set NODE_ENV prior to merge() as babel plugins might depend on dev/prod
process.env.NODE_ENV = 'development';

// Check if this config was called to start de dev server (webpack serve)
// or to run a dev build (webpack).
const isDevServerRunning = process.env.WEBPACK_SERVE;

// Load dotenv vars in advance as we depends on a couple of them:
// - Dev server port
// - Api base url
env.loadEnvDefaults();

module.exports = (cliParams = {}, argv = {}) => {
  const generateBundleReport = Boolean(cliParams['report'] ?? false);

  return merge(base({ embedAssets: false, embedStyles: true, ...cliParams }, argv), {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
      app: ['regenerator-runtime/runtime', './app.entrypoint.tsx'],
    },
    output: {
      path: path.buildDevPath,
      // Filename for initial/entry bundles
      filename: `[name].bundle.js`,
      // Filename for spitted bundles
      chunkFilename: `[name].bundle.js`,
      // Filename for extracted assets
      assetModuleFilename: `assets/[name][ext]`,
    },
    devServer: {
      host: 'localhost',
      port: process.env.DEV_SERVER_PORT || 8090,
      hot: true,
      historyApiFallback: true,
      proxy: {
        // Redirect requests towards server mock (proxy for development only)
        [process.env.API_BASE_URL || '/']: {
          target: `http://localhost:${process.env.MOCK_SERVER_PORT || 8091}`,
          // However, bypass navigation requests (with HTML found in its accept
          // header) to allow AUTH FLOW redirections to work properly.
          bypass: function (req) {
            if (req.headers.accept?.indexOf('html') !== -1) {
              console.log('[WEBPACK DEV SERVER] Skipping proxy for browser request.');
              return '/index.html';
            }
          },
        },
        // Redirect requests towards NA Console (proxy for development only)
        [process.env.NA_CONSOLE_BASE_URL]: `http://localhost:${
          process.env.NA_CONSOLE_SERVER_PORT || 8092
        }`,
      },
    },
    plugins: [
      isDevServerRunning && new ReactRefreshWebpackPlugin({ overlay: false }),
      new MiniCssExtractPlugin({
        filename: `[name].css`,
        chunkFilename: `[name].css`,
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: generateBundleReport ? 'static' : 'disabled',
        openAnalyzer: generateBundleReport,
        reportFilename: path.reportsBuildDevPath + '/bundle-dev-report.html',
        reportTitle: 'Bundle DEV Report',
      }),
    ].filter(Boolean),
  });
};
