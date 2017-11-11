const path = require('path');

var webConfig = {
  target: 'web',
  entry: ['babel-polyfill', './out/App.js'],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ],
  },
  devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'packed')
  }
};

module.exports = [webConfig];
