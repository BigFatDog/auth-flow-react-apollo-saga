import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

const reScript = /\.(js|jsx|mjs)$/;
const reStyle = /\.(css|less|styl|scss|sass|sss)$/;
const reImage = /\.(bmp|gif|jpg|jpeg|png|svg)$/;

const createCSSRule = (ext, ruleList) => ({
  test: new RegExp(`\\.${ext}$`),
  use: [
    { loader: 'css-loader' },
  ].concat(ruleList)
    .concat(ext.length > 0 ? [] : [
      {loader: 'postcss-loader',
        options: {
          config: {
            path: 'internals/postcss.config.js',
          },
        },}]),

});

export default {
  entry: path.resolve(process.cwd(), 'app/server/index.js'),

  output: {
    path: path.resolve(process.cwd(), 'build/server'),
    filename: 'server.js',
    sourceMapFilename: '[name].[chunkhash].js.map',
  },

  target: 'node',
  node: {
    __dirname: true,
    __filename: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  externals: [
    nodeExternals({
      whitelist: [reStyle, reImage],
    }),
  ],

  module: {
    rules: [
      {
        test: reScript,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: [
              'es2015',
              'react',
              'stage-0',
            ],
          },
        },
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        use: 'graphql-tag/loader',
      },
      {
        test: /\.(mp4|webm)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
      },
      {
        test: /\.(eot|svg|otf|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            query: {
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 4,
              },
              pngquant: {
                quality: '75-90',
                speed: 3,
              },
            },
          },
        ],
      },
      createCSSRule('css', []),
      createCSSRule('scss', [{ loader: 'sass-loader' }]),
      createCSSRule('less', [{ loader: 'less-loader' }]),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __CLIENT__: false,
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({ minimize: true }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
