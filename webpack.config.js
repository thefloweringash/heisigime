var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var autoprefixer = require('autoprefixer');

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
        loader: "style!css!postcss!less"
      },
    ],
  },
  postcss: [
    autoprefixer({ browsers: ['last 2 versions'] }),
  ],
  devServer: {
    stats: 'errors-only',
    contentBase: './dist',
  },
  plugins: [
    new webpack.EnvironmentPlugin([
      "NODE_ENV"
    ]),

    // Static data
    new CopyWebpackPlugin([
      {
        context: path.resolve(__dirname, 'node_modules/kuromoji/dict'),
        from: '*.dat.gz',
        to:   'dict',
      },
    ]),
  ],
};
