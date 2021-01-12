/* eslint-disable no-undef */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackAutoInject = require('webpack-auto-inject-version');

module.exports = {
	entry: {
		app: './src/index.js',
	},
	plugins: [
		new WebpackAutoInject({
			components: {
				AutoIncreaseVersion: false,
				InjectAsComment: false,
				InjectByTag: true,
			},
			componentsOptions: {
				InjectByTag: {
					fileRegex: /^app.*bundle\.js$/,
					AIVTagRegexp: /(\[AIV])(([a-zA-Z{} ,:;!()_@\-"'\\/])+)(\[\/AIV])/g,
					dateFormat: 'dddd, mmmm dS, yyyy, h:MM:ss TT',
				},
			},
		}),
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
				test: /\.(png|jpg|gif)$/i,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8192,
							fallback: require.resolve('file-loader'),
							outputPath: 'assets',
						},
					},
				],
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
		],
	},
};
