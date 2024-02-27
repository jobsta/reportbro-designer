const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const banner =
`Copyright (C) 2023 jobsta

This file is part of ReportBro, a library to generate PDF and Excel reports.
Demos can be found at https://www.reportbro.com

Dual licensed under AGPLv3 and ReportBro commercial license:
https://www.reportbro.com/license

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/

Details for ReportBro commercial license can be found at
https://www.reportbro.com/license/agreement
`;

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
		clean: true,
  },
  module: {
    rules: [
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
  ]
});
