const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  
  entry: {
    code: './src/code.ts',
  },
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      inject: false,
    }),
  ],
}); 