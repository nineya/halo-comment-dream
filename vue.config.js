const CopyWebpackPlugin = require('copy-webpack-plugin')

console.log(process.env.NODE_ENV)
module.exports = {
  productionSourceMap: false,
  publicPath: process.env.ASSETS ? '/themes/dream/source/lib/halo-comment@1.0.0' : '/',
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
