const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  optimization: {
    minimize: process.env.NODE_ENV !== 'development',
  },
  module: {
    rules: [
      {
        test: /public/,
        type: 'asset/source',
      },
      {
        test: /\.ts/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'bin'),
    libraryTarget: 'this',
  },
  plugins: [
    // Polyfills go here.
    // Used for, e.g., any cross-platform WHATWG, 
    // or core nodejs modules needed for your application.
    new webpack.ProvidePlugin({
      URL: 'core-js/web/url',
      process: './shims/process',
    }),
  ],
  target: 'webworker',
};
