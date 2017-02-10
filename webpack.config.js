const path              = require('path');
const config            = require('./conf/webpack-common.config.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');

config.target = "web";
config.entry  = { main: './js/main.js' };
config.plugins.push(new CopyWebpackPlugin([{
  context: path.resolve(__dirname, 'node_modules/kuromoji/dict'),
  from:    '*.dat.gz',
  to:      'dict',
},
]));

module.exports = config;
