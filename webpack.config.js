module.exports = {
  entry: "./app.js",
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
  }
};
