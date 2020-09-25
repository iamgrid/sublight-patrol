const path = require('path');
const common = require('./webpack.common');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
	output: {
		filename: '[name].bundle.js',
		chunkFilename: '[name].chunk.js',
		path: path.resolve(__dirname, 'build'),
	},
	mode: 'development',
	devtool: 'source-map',
});
