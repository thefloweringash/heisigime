const path               = require('path');
const webpack            = require('webpack');
const autoprefixer       = require('autoprefixer');
const WebpackShellPlugin = require('webpack-shell-plugin');

const supportedBrowsers = [
  'last 1 version',
];

module.exports = {
  target:    "web",
  entry:     { main: './js/main.js' },
  output:    {
    path:          path.resolve(__dirname, '../dist'),
    filename:      '[name].js',
    chunkFilename: '[id].js',
    publicPath:    '/',
  },
  module:    {
    rules: [
      {
        test:    /\.js$/,
        exclude: /node_modules/,
        use:     [
          {
            loader:  'babel-loader',
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
        use:  ["isomorphic-style-loader", "css-loader"],
      },
      {
        test: /\.less$/,
        use:  ["isomorphic-style-loader", "css-loader", "postcss-loader", "less-loader"],
      },
    ],
  },
  devServer: {
    stats:       'errors-only',
    contentBase: './dist',
  },
  devtool:   'source-map',
  plugins:   [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new WebpackShellPlugin({
      onBuildStart: [
        'make -f Makefile.data',
      ],
    }),

    new webpack.NamedModulesPlugin(),

    new webpack.LoaderOptionsPlugin({
      test:    /\.less$/,
      options: {
        postcss: [
          autoprefixer({ browsers: supportedBrowsers }),
        ],
      }
    }),
  ],
};
