module.exports = {
  entry: "./app.js",
  output: {
    filename: 'dist.js',
  },
  module:{
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel?presets[]=es2015&presets[]=react'
      },
      {
        test: /\.css$/,
        loader: "style!css!less"
      },
    ],
  }
};
