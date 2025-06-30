/**
 * Environment configuration validation and utilities
 */

export interface EnvironmentConfig {
  // API Configuration
  apiUrl: string;
  apiKey?: string;
  
  // Firebase Configuration
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  
  // Demo Account Configuration
  demo: {
    email: string;
    password: string;
    enabled: boolean;
  };
  
  // Environment Configuration
  environment: 'development' | 'staging' | 'production';
  appVersion: string;
  buildTimestamp: string;
  
  // Feature Flags
  features: {
    analytics: boolean;
  };
}

/**
 * Validates and returns the environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  // Required Firebase configuration
  const requiredFirebaseVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
  ];

  const missingVars = requiredFirebaseVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all Firebase configuration variables are set.'
    );
  }

  return {
    // API Configuration
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.pantrysync.com',
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
    
    // Firebase Configuration
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    
    // Demo Account Configuration
    demo: {
      email: process.env.EXPO_PUBLIC_DEMO_EMAIL || 'demo@pantrysync.com',
      password: process.env.EXPO_PUBLIC_DEMO_PASSWORD || 'demo123',
      enabled: process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE !== 'false',
    },
    
    // Environment Configuration
    environment: (process.env.EXPO_PUBLIC_ENVIRONMENT as any) || 'development',
    appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    buildTimestamp: process.env.EXPO_PUBLIC_BUILD_TIMESTAMP || new Date().toISOString(),
    
    // Feature Flags
    features: {
      analytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    },
  };
}

/**
 * Helper function to check if we're in development mode
 */
export function isDevelopment(): boolean {
  const config = getEnvironmentConfig();
  return config.environment === 'development';
}

/**
 * Helper function to check if we're in production mode
 */
export function isProduction(): boolean {
  const config = getEnvironmentConfig();
  return config.environment === 'production';
}

/**
 * Helper function to get demo credentials
 */
export function getDemoCredentials() {
  const config = getEnvironmentConfig();
  return config.demo;
}