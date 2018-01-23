// No need to build the DLL in production
if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

import 'shelljs/global';
import path from 'path';
import { existsSync as exists, writeFileSync as writeFile } from 'fs';
import defaults from 'lodash/defaultsDeep';
import pkg from '../../package.json';
import { DllConfig } from '../dllConfig';

const outputPath = path.join(process.cwd(), DllConfig.path);
const dllManifestPath = path.join(outputPath, 'package.json');

/**
 * I use node_modules/auth-flow-dlls by default just because
 * it isn't going to be version controlled and babel wont try to parse it.
 */
mkdir('-p', outputPath);

echo('Building the Webpack DLL...');

/**
 * Create a manifest so npm install doesn't warn us
 */
if (!exists(dllManifestPath)) {
  writeFile(
    dllManifestPath,
    JSON.stringify(defaults({
      name: 'auth-flow-dlls',
      private: true,
      author: pkg.author,
      repository: pkg.repository,
      version: pkg.version,
    }), null, 2),
    'utf8'
  );
}

// the BUILDING_DLL env var is set to avoid confusing the development environment
exec('cross-env BUILDING_DLL=true webpack --display-chunks --color --config internals/webpack/webpack.dll.babel.js --hide-modules');
