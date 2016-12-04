var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './js/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/',
  },
  module:{
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel?presets[]=es2015&presets[]=react&plugins[]=transform-runtime',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: "style!css!less"
      },
    ],
  },
  devServer: {
    stats: 'errors-only',
    contentBase: './dist',
  },
  plugins: [
    new webpack.EnvironmentPlugin([
      "NODE_ENV"
    ])
  ],
};
