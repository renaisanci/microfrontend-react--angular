const { merge } = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const RemoveLicenseFilePlugin = require('./plugins/remove-license-file.plugin');
const ZLib = require('zlib');
const path = require('../path');
const base = require('./webpack.base');

// Set NODE_ENV prior to merge() as babel plugins might depend on dev/prod
process.env.NODE_ENV = 'production';

module.exports = (cliParams = {}, argv = {}) => {
  const generateBundleReport = Boolean(cliParams['report'] ?? false);
  const zipArtifacts = Boolean(!(cliParams['no-zip'] ?? false));

  return merge(base({ embedAssets: false, embedStyles: false, ...cliParams }, argv), {
    mode: 'production',
    entry: {
      app: ['regenerator-runtime/runtime', './app.entrypoint.tsx'],
    },
    output: {
      path: path.buildProdPath,
      // Filename for initial/entry bundles
      filename: `[name].bundle.[contenthash:6].js`,
      // Filename for splitted bundles
      chunkFilename: `[name].bundle.[contenthash:6].js`,
      // Filename for extracted assets
      assetModuleFilename: `assets/[name].[contenthash:6][ext]`,
    },
    plugins: [
      zipArtifacts &&
        new CompressionPlugin({
          filename: '[file].gz',
          algorithm: 'gzip',
          minRatio: 0.8,
          exclude: /env.bundle.*.js/, // Do not zip env bundle, it must be parsed/replaced after build
        }),
      zipArtifacts &&
        new CompressionPlugin({
          filename: '[file].br',
          algorithm: 'brotliCompress',
          compressionOptions: {
            params: {
              [ZLib.constants.BROTLI_PARAM_QUALITY]: 11,
            },
          },
          minRatio: 0.8,
          exclude: /env.bundle.*.js/, // Do not zip env bundle, it must be parsed/replaced after build
        }),
      new MiniCssExtractPlugin({
        filename: `[name].[contenthash:6].css`,
        chunkFilename: `[name].[contenthash:6].css`,
      }),
      new RemoveLicenseFilePlugin(),
      new BundleAnalyzerPlugin({
        analyzerMode: generateBundleReport ? 'static' : 'disabled',
        openAnalyzer: generateBundleReport,
        reportFilename: path.reportsBuildProdPath + '/bundle-prod-report.html',
        reportTitle: 'Bundle PROD Report',
        statsFilename: path.reportsBuildProdPath + '/bundle-prod-stats.json',
        generateStatsFile: true,
      }),
    ].filter(Boolean),
  });
};
