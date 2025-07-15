/* eslint-disable no-undef */
const path = require('path');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
	optimization: {
		minimizer: [new TerserJSPlugin(), new OptimizeCssAssetsPlugin()],
	},
	plugins: [new CleanWebpackPlugin()],
	output: {
		filename: '[name]-[contenthash].bundle.js',
		chunkFilename: '[name]-[contenthash].chunk.js',
		path: path.resolve(__dirname, 'dist'),
	},
	mode: 'production',
});
