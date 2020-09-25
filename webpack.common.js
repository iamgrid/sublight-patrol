// const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyPlugin = require('copy-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: {
		app: './src/index.js',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.template.html',
			title: 'sublight patrol',
		}),
		/* new CopyPlugin([
			{ from: 'src/wallpapers', to: 'wallpapers' },
			{ from: 'src/export_json.php', to: 'export_json.php' }
		]),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css'
		}) */
	],
	output: {
		hashDigestLength: 8,
	},
	module: {
		/* rules: [
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			}
		] */
	},
};
