var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var autoprefixer = require('autoprefixer');

const supportedBrowsers = [
  'last 1 version',
];

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
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: [
            ['env', {
              targets: { browsers: supportedBrowsers },
            }],
            'react',
          ],
          plugins: ['transform-runtime'],
        }
      },
      {
        test: /\.css$/,
        loader: "style!css!postcss!less"
      },
    ],
  },
  postcss: [
    autoprefixer({ browsers: supportedBrowsers }),
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
