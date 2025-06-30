const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for Node.js compatibility
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Configure for better web compatibility
config.resolver.alias = {
  'react-native': 'react-native-web',
};

module.exports = config;