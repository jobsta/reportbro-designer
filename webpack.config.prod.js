var path = require('path');
const webpack = require('webpack');
var CopyWebpackPlugin = require("copy-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var banner = 
`Copyright (C) 2018 jobsta

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
    loaders: [
      {
        loader: "babel-loader",

        // Skip any files outside of src directory
        include: [
          path.resolve(__dirname, "src")
        ],

        // Only run .js files through Babel
        test: /\.js$/,

        // Options to configure babel with
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015']
        }
      },
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
    new webpack.BannerPlugin({ banner: banner, test: 'reportbro.js' }),
    new ExtractTextPlugin("reportbro.css"),
    new CopyWebpackPlugin([
      { from: 'node_modules/jquery/dist/jquery.js', to: 'ext/jquery.js' },
      { from: 'node_modules/autosize/dist/autosize.js', to: 'ext/autosize.js' },
      { from: 'node_modules/jsbarcode/dist/JsBarcode.all.min.js', to: 'ext/JsBarcode.all.min.js' },
      { from: 'node_modules/spectrum-colorpicker/spectrum.css', to: 'ext/spectrum.css'},
      { from: 'node_modules/spectrum-colorpicker/spectrum.js', to: 'ext/spectrum.js' }
    ])
  ]
};
