const { composePlugins, withNx } = require('@nx/webpack')
const { withReact } = require('@nx/react')
const { merge } = require('webpack-merge')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  
  return merge(config, {
    module: {
      rules: [
        {
          test: /\.mdx?$/,
          use: [
            {
              loader: '@mdx-js/loader',
              /** @type {import('@mdx-js/loader').Options} */
              options: {}
            }
          ]
        }
      ]
    }
  })
})
