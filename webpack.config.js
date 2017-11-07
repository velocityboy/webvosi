const path = require('path');

module.exports = {
  entry: './out/App.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'packed')
  }
};
