const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
  entry: ['./src/main.js', './src/main.css', './src/fonts/font_style.css', './src/iconfonts/style.css', './src/toggle-switch.css', './src/quill.reportbro.css'],
  output: {
    filename: 'reportbro.js',
    path: path.resolve(__dirname, 'dist'),
  },
  performance : {
    hints : false // disable warning for asset size limit (generated js file)
  },
  module: {
	rules: [
	  {
        test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'], },
      {
        test: /\.(png|gif)([\?]?.*)$/,
        type: 'asset/resource',
        generator: {
          filename: '[path][name][ext]'
        }
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        type: 'asset/resource',
        generator: {
          filename: '[path][name][ext]?[hash]'
        }
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({filename: "reportbro.css"})
  ]
};
