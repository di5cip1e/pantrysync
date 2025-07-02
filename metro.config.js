const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure resolver to handle Node.js modules for web
config.resolver.resolverMainFields = [
  'react-native',
  'browser',
  'main',
];

config.resolver.platforms = [
  'native',
  'web',
  'ios',
  'android',
];

// Add alias for node modules that don't work in web
config.resolver.alias = {
  ...config.resolver.alias,
  'node:util/types': require.resolve('./polyfills/util-types.js'),
  'node:assert': require.resolve('./polyfills/assert.js'),
};

module.exports = config;
