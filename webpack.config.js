const path = require('path');

var webConfig = {
  entry: ['babel-polyfill', './out/App.js'],
  target: 'web',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'packed')
  }
};

module.exports = [webConfig];
