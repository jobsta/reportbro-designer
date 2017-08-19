var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: ['./src/main.js', './src/main.css', './src/iconfonts/style.css', './src/toggle-switch.css'],
  output: {
    filename: 'reportbro.js',
    path: __dirname + '/dist'
  },
  devtool: 'cheap-source-map',
  performance : {
    hints : false // disable warning for asset size limit (generated js file)
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: /\.(png|gif)([\?]?.*)$/,
        loader: "file-loader?name=[name].[ext]"
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: "file-loader?name=iconfonts/[name].[ext]?[hash]"
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("reportbro.css")
  ]
};
