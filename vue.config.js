const CopyWebpackPlugin = require('copy-webpack-plugin')
const { version } = require('./package.json')

module.exports = {
  productionSourceMap: false,
  publicPath: process.env.ASSETS ? `/themes/dream/source/lib/halo-comment@${version}` : '/',
  configureWebpack: process.env.ASSETS
    ? {
        plugins: [
          new CopyWebpackPlugin({
            patterns: [
              {
                from: 'public/assets',
                to: 'assets'
              }
            ]
          })
        ]
      }
    : {}
}
