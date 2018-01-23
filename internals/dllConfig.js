import uniq from 'lodash/uniq';
import pullAll from 'lodash/pullAll';

const DllConfig = {
  path: 'node_modules/auth-flow-dlls',
  exclude: [
    'apollo-engine',
    'apollo-link-ws',
    'apollo-upload-server',
    'bcrypt',
    'chalk',
    'compression',
    'cross-env',
    'dotenv',
    'enhanced-resolve',
    'express',
    'ip',
    'minimist',
    'mongoose',
    'passport-jwt',
    'passport-ldapauth',
    'sanitize.css'
  ],
  include: [
    'core-js',
    'lodash',
    'eventsource-polyfill',
  ],
};

const entries = (pkg) => {
  const dependencyNames = Object.keys(pkg.dependencies);
  const { exclude, include } = DllConfig;
  const includeDependencies = uniq(dependencyNames.concat(include));

  console.log(exclude);
  console.log(pullAll(includeDependencies, exclude));

  return pullAll(includeDependencies, exclude);
};

export {
  DllConfig,
  entries,
};
