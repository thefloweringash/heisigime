var webpack = require('webpack');

module.exports = {
  entry: './main.js',
  output: {
    filename: 'dist.js',
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
  },
  plugins: [
    new webpack.EnvironmentPlugin([
      "NODE_ENV"
    ])
  ],
};
