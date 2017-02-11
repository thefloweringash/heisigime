const path                      = require('path');
const config                    = require('./conf/webpack-common.config.js');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

config.entry                = { index: './js/gen_index.js' };
config.target               = "node";
config.output.path          = path.resolve(__dirname, 'tmp');
config.output.libraryTarget = "umd";
config.plugins.push(new StaticSiteGeneratorPlugin('index', ['/']));

module.exports = config;
