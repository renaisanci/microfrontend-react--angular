const { merge } = require('webpack-merge');
const DotenvWebpackPlugin = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const IgnoreNotFoundExportPlugin = require('./plugins/ignore-not-found-export.plugin.js');
const path = require('../path');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./../../package.json').dependencies;

module.exports = (cliParams = {}) => {
  const { embedAssets = false, embedStyles = false } = cliParams;

  return merge(
    {},
    {
      context: path.srcPath,
      resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        alias: {
          assets: path.resolveFromRootPath('src/assets'),
          common: path.resolveFromRootPath('src/common'),
          core: path.resolveFromRootPath('src/core'),
          layouts: path.resolveFromRootPath('src/layouts'),
          global: path.resolveFromRootPath('src/modules/global'),
          edge: path.resolveFromRootPath('src/modules/edge'),
          scenes: path.resolveFromRootPath('src/scenes'),
          config: path.resolveFromRootPath('/config'),
        },
      },
      output: {
        publicPath: '/',
      },
      module: {
        rules: [
          // General source CODE rule.
          {
            test: /\.[tj]sx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
          },
          // Generic vendor CSS rule.
          {
            test: /\.css$/,
            include: /node_modules/,
            use: [
              // Embed or extract styles, mainly for dev vs prod purposes.
              embedStyles ? { loader: 'style-loader' } : MiniCssExtractPlugin.loader,
              // No CSS Modules.
              'css-loader',
            ],
          },
          // Generic SVG rule:
          // - Treat them as assets when requested via url (css for example).
          // - Treat them as react components when imported from source code. This is
          // intended for project-specific svg assets.
          {
            test: /\.svg$/i,
            resourceQuery: /url/, // *.svg?url
            type: embedAssets ? 'asset/inline' : 'asset/resource',
          },
          // Project specific svg files handling
          {
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            exclude: /node_modules/, // exclude svg comming from 3rd partys, mainly for our assets
            resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
            loader: '@svgr/webpack',
            // OPTIONAL: to also extrcact project-specific svgs to separated asset files.
            // type: embedAssets ? 'asset/inline' : 'asset/resource',
          },
          // Gener
          // Generic ASSETS rule.
          {
            test: /\.(jpe?g|png|gif|ico|eot|ttf|woff|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
            type: embedAssets ? 'asset/inline' : 'asset/resource',
          },
        ],
      },
      optimization: {
        splitChunks: {
          cacheGroups: {
            // Split 3rd party source to a separated bundle for better inspection.
            vendorSources: {
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
            },
            // IMPORTANT: split env.constant core file to be targetted for env
            // substitution in the pipeline if needed.
            env: {
              chunks: 'all',
              test: /env\.constants\.ts?$/,
              name: 'env',
              enforce: true,
            },
          },
        },
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'counter',
          filename: 'remoteEntry.js',
          remotes: {
            remoteApp: 'remoteAngularApp@http://localhost:4300/remoteEntry.js',
           // remoteApp: 'remoteAngularApp@http://localhost:4500/remoteEntry.js',
          },

          shared: {
            ...deps,
            'react-dom': {
              requiredVersion: '18.2.0',
              singleton: true,

            },
            react: {
              requiredVersion: '18.2.0',
              singleton: true,
              eager: true,

            },
          },
        }),
        new DotenvWebpackPlugin({
          // Useful for buildtime env variables injection.
          // Precedence systemvars > .env > .env.defaults
          systemvars: true, // inject from system, higher precedence, aimed for CI
          defaults: true, // allow .env.defaults file
        }),
        new HtmlWebpackPlugin({
          filename: 'index.html',
          template: 'index.html',
          hash: true,
          favicon: path.srcFaviconPath + '/favicon.svg',
          chunksSortMode: 'manual',
          chunks: ['manifest', 'vendors', 'app'],
        }),
        new CopyWebpackPlugin({ patterns: [{ from: path.localesPath, to: 'locales' }] }),
        new IgnoreNotFoundExportPlugin(),
      ],
    }
  );
};
