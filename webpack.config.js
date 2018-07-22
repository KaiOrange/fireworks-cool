const path = require('path');
const webpack = require('webpack');

module.exports ={
  entry: [
    './src/js/index.js'
  ],
  output: {
    path: path.join(__dirname, "src","dist"),
    publicPath: '/src/dist',
    filename: 'bundle.js',
  },
  target: 'electron-renderer',
  mode:"production",
  module: {
    rules: [{
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    }]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
    })
  ],
};