/* global process:false */

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const autoprefixer = require('autoprefixer');
const glob = require('glob');
const basename = require('basename');

const thisPackage = require('./package.json');
const dependencies = Object.keys(thisPackage.dependencies);

const allKeybindingNames = glob.sync('./node_modules/brace/keybinding/*.js').map(basename);
const allKeybindingRequires = allKeybindingNames.map(n => `brace/keybinding/${n}`);

const allThemeNames = glob.sync('./node_modules/brace/theme/*.js').map(basename);
const allThemeRequires = allThemeNames.map(n => `brace/theme/${n}`);

// There's a builtin/default keybinding that we call `ace`.
const allKeybindings = allKeybindingNames.concat(['ace']).sort();
const allThemes = allThemeNames;

// Perhaps we could place each of these in a separate chunk and load them on demand?
const vendorLibraries = dependencies.concat(allKeybindingRequires, allThemeRequires);

module.exports = {
  entry: {
    app: ['./index.js', './index.scss'],
    vendor: vendorLibraries,
  },

  output: {
    path: './build/assets',
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[chunkhash].js',
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  module: {
    loaders: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: /node_modules/,
        loader: 'babel',
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style", ["css", "postcss", "sass"]),
      },
    ],
  },

  plugins: [
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new webpack.DefinePlugin({
      ACE_KEYBINDINGS: JSON.stringify(allKeybindings),
      ACE_THEMES: JSON.stringify(allThemes),
    }),
    new HtmlWebpackPlugin({
      title: "Rust Playground",
      template: 'index.ejs',
      filename: '../index.html',
      chunksSortMode: 'dependency',
    }),
    new CopyWebpackPlugin([
      { from: 'robots.txt', to: '..' },
    ]),
    new ExtractTextPlugin("styles-[chunkhash].css"),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),
  ],

  postcss: function () {
    return [autoprefixer];
  },
};

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new CompressionPlugin({ algorithm: 'zopfli' })
  );
}
