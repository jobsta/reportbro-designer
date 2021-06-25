const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const banner =
`Copyright (C) 2021 jobsta

This file is part of ReportBro, a library to generate PDF and Excel reports.
Demos can be found at https://www.reportbro.com

Dual licensed under AGPLv3 and ReportBro commercial license:
https://www.reportbro.com/license

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/

Details for ReportBro commercial license can be found at
https://www.reportbro.com/license/agreement
`;


module.exports = {
  mode: 'production',
  entry: ['./src/main.js', './src/main.css', './src/iconfonts/style.css', './src/toggle-switch.css'],
  output: {
    filename: 'reportbro.js',
    path: __dirname + '/dist'
  },
  devtool: 'source-map',
  performance : {
    hints : false // disable warning for asset size limit (generated js file)
  },
  module: {
    rules: [
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'], },
      { test: /\.(png|gif)([\?]?.*)$/,  loader: 'file-loader', options: { name: '[path][name].[ext]', },},
      { test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader: 'file-loader', options: {name: '[path][name].[ext]?[hash]'}},
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, "src")],
        loader: "babel-loader",
        options: {
          plugins: ['@babel/plugin-transform-runtime'],
          presets: ['@babel/preset-env']
        },
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({ banner: banner, test: 'reportbro.js' }),
    new MiniCssExtractPlugin({filename: "reportbro.css"}),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'node_modules/jquery/dist/jquery.js', to: 'ext/jquery.js' },
        { from: 'node_modules/autosize/dist/autosize.js', to: 'ext/autosize.js' },
        { from: 'node_modules/jsbarcode/dist/JsBarcode.all.min.js', to: 'ext/JsBarcode.all.min.js' },
        { from: 'node_modules/spectrum-colorpicker/spectrum.css', to: 'ext/spectrum.css'},
        { from: 'node_modules/spectrum-colorpicker/spectrum.js', to: 'ext/spectrum.js' }
      ]
    }),
  ]
};
