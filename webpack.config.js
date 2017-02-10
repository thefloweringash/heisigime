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
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  targets: { browsers: supportedBrowsers },
                  modules: false,
                }],
                'react',
              ],
              plugins: ['transform-runtime'],
            },
          },
        ],
      },
      {
        test: /.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "postcss-loader", "less-loader"],
      },
    ],
  },
  devServer: {
    stats: 'errors-only',
    contentBase: './dist',
  },
  devtool: 'source-map',
  plugins: [
    new webpack.EnvironmentPlugin([
      "NODE_ENV"
    ]),

    new webpack.LoaderOptionsPlugin({
      test: /\.less$/,
      options: {
        postcss: [
          autoprefixer({ browsers: supportedBrowsers }),
        ],
      }
    }),

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
