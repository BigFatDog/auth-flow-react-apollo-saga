const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const reScript = /\.(js|jsx|mjs)$/;

const nodeModules = {};
fs.readdirSync("node_modules")
  .filter(function (x) {
    return [".bin"].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = "commonjs " + mod;
  });


module.exports = {
  mode: 'production',
  entry: {
    es: path.join(process.cwd(), 'server/main.js')
  },

  output: {
    path: path.resolve(process.cwd(), 'build/server'),
    filename: 'bundle.js',
    libraryTarget: "commonjs"
  },

  resolve: {
    modules: ['node_modules', 'server'],
    extensions: ['.js', '.jsx', '.react.js', '.graphql', '.gql'],
  },

  target: 'node',
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: true,
    __dirname: true
  },

  externals: [nodeExternals({options: {
      whitelist: ['esm']
    }})],

  module: {
    rules: [
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: [
              '@babel/preset-env',
              {
                modules: false,
              },
              '@babel/preset-react',
            ],
          },
        },
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        use: 'graphql-tag/loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      WEBPACK_BUNDLE: true,
      __CLIENT__: false,
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({minimize: true}),
  ],
};
