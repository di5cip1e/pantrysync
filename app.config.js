const { config } = require('dotenv');
config();

module.exports = {
  expo: {
    name: "PantrySync",
    slug: "pantrysync",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "pantrysync",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    extra: {
      deployedAt: process.env.EXPO_PUBLIC_DEPLOYED_AT,
      buildNumber: Date.now().toString(),
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pantrysync.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#667eea"
      },
      package: "com.pantrysync.app"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router", 
      "expo-font"
    ],
    experiments: {
      typedRoutes: true
    }
  }
};