const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');

module.exports = {
  // Other rules...
  optimization: {
    minimize: false
  },
  entry: {
    index: './config/lib/app.js'
  },
  devServer: {
    static: './dist'
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  mode: 'development',
  target: 'node',
  plugins: [
    new NodePolyfillPlugin()
  ]
};
