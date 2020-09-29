/* eslint-disable no-undef */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: {
		app: './src/index.js',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.template.html',
			title: 'sublight patrol',
		}),
		new CopyPlugin({
			patterns: [{ from: 'src/assets', to: 'assets' }],
		}),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css',
		}),
	],
	output: {
		hashDigestLength: 8,
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
		],
	},
};
