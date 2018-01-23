/**
 * WEBPACK DLL GENERATOR
 *
 * This profile is used to cache webpack's module
 * contexts for external library and framework type
 * dependencies which will usually not change often enough
 * to warrant building them from scratch every time we use
 * the webpack process.
 */
import { join } from 'path';
import webpack from 'webpack';
import pkg from '../../package.json';
import baseConfig from './webpack.base.babel';
import { DllConfig, entries } from '../dllConfig';

const outputPath = join(process.cwd(), DllConfig.path);

export default baseConfig({
  context: process.cwd(),
  entry: {
    authFlowDeps: entries(pkg),
  },
  devtool: 'eval',
  output: {
    filename: '[name].dll.js',
    path: outputPath,
    library: '[name]',
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: join(outputPath, '[name].json'),
    }),
  ],
  performance: {
    hints: false,
  },
});
