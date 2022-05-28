const CopyWebpackPlugin = require('copy-webpack-plugin')
const { version } = require('./package.json')
const themePath = `/themes/dream/source/lib/halo-comment@${version}/`
const npmPath = `https://unpkg.com/halo-comment-dream@${version}/dist/`

module.exports = {
  productionSourceMap: false,
  publicPath: process.env.ASSETS === 'theme' ? themePath : process.env.ASSETS === 'npm' ? npmPath : '/',
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
