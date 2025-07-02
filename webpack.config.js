const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@firebase/auth-compat']
      }
    },
    argv
  );

  // Add resolve fallbacks for Node.js modules
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'node:util/types': false,
    'node:assert': false,
    'node:util': false,
    'node:crypto': false,
    'node:stream': false,
    'node:buffer': false,
    'node:events': false,
    'node:path': false,
    'node:url': false,
    'node:querystring': false,
    'node:fs': false,
    'node:os': false,
    'node:http': false,
    'node:https': false,
    'node:zlib': false,
    'node:tty': false,
    'undici': false,
  };

  // Use alias to point to mock firebase for web
  config.resolve.alias = {
    ...config.resolve.alias,
    '@/config/firebase': path.resolve(__dirname, 'config/firebase.mock.ts'),
  };

  // Use webpack's IgnorePlugin to ignore problematic modules
  const webpack = require('webpack');
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^undici$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^node:/,
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );

  return config;
};
