'use strict';

const path = require("path");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  devtool: 'inline-source-map',
  entry: './src/index.ts',
  target: "node",
  output: {
    library: 'EthPM',
    libraryTarget: "umd",
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          compilerOptions: {
            isolatedModules: true
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
    plugins: [
      new TsconfigPathsPlugin()
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ]
};
