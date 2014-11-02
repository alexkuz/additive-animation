var webpack = require('webpack');

module.exports = {
  entry: './index',
  output: {
    filename: 'bin/additive-animation.min.js',
    libraryTarget: 'umd',
    library: 'AdditiveAnimation'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ]
};