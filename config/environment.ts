/**
 * Base environment configuration with default values
 */

import { parseBoolean } from './env-validation';

export interface EnvironmentConfig {
  // Environment Configuration
  env: 'development' | 'staging' | 'production' | 'test';
  
  // Version Tracking
  version: string;
  buildNumber: number;
  commitSha?: string;
  
  // API Configuration
  api: {
    url: string;
    key?: string;
    timeout: number;
  };
  
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
  
  // Feature Flags
  features: {
    aiInventory: boolean;
    analytics: boolean;
    pushNotifications: boolean;
    offlineMode: boolean;
    debugMode: boolean;
  };
  
  // Analytics Configuration
  analytics: {
    enabled: boolean;
    trackingId?: string;
    sampleRate: number;
  };
  
  // Cache Configuration
  cache: {
    enabled: boolean;
    ttl: number; // milliseconds
    maxSize: number; // bytes
  };
  
  // Error Reporting
  errorReporting: {
    enabled: boolean;
    sentryDsn?: string;
    sampleRate: number;
  };
  
  // User Configuration Limits
  limits: {
    maxHouseholdsPerUser: number;
    maxItemsPerHousehold: number;
    maxMembersPerHousehold: number;
    maxShoppingLists: number;
    maxFileUploadSize: number; // bytes
  };
  
  // Security Configuration
  security: {
    sessionTimeout: number; // milliseconds
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
  
  // Development/Testing
  debug: {
    logsEnabled: boolean;
    mockData: boolean;
    testMode: boolean;
  };
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: EnvironmentConfig = {
  env: 'development',
  version: '1.0.0',
  buildNumber: 1,
  
  api: {
    url: 'https://api.pantrysync.com',
    timeout: 10000,
  },
  
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
  
  features: {
    aiInventory: false,
    analytics: true,
    pushNotifications: true,
    offlineMode: false,
    debugMode: false,
  },
  
  analytics: {
    enabled: true,
    sampleRate: 1.0,
  },
  
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 52428800, // 50MB
  },
  
  errorReporting: {
    enabled: true,
    sampleRate: 1.0,
  },
  
  limits: {
    maxHouseholdsPerUser: 10,
    maxItemsPerHousehold: 1000,
    maxMembersPerHousehold: 20,
    maxShoppingLists: 10,
    maxFileUploadSize: 5242880, // 5MB
  },
  
  security: {
    sessionTimeout: 3600000, // 1 hour
    maxLoginAttempts: 5,
    passwordMinLength: 6,
  },
  
  debug: {
    logsEnabled: false,
    mockData: false,
    testMode: false,
  },
};

/**
 * Gets environment variable as string with fallback
 */
function getEnvString(key: keyof NodeJS.ProcessEnv, fallback: string = ''): string {
  return process.env[key] || fallback;
}

/**
 * Gets environment variable as number with fallback
 */
function getEnvNumber(key: keyof NodeJS.ProcessEnv, fallback: number = 0): number {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Gets environment variable as boolean with fallback
 */
function getEnvBoolean(key: keyof NodeJS.ProcessEnv, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return fallback;
  return parseBoolean(value);
}

/**
 * Loads configuration from environment variables
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    // Environment Configuration
    env: (getEnvString('EXPO_PUBLIC_ENV') || getEnvString('NODE_ENV', 'development')) as EnvironmentConfig['env'],
    
    // Version Tracking
    version: getEnvString('EXPO_PUBLIC_APP_VERSION', DEFAULT_CONFIG.version),
    buildNumber: getEnvNumber('EXPO_PUBLIC_BUILD_NUMBER', DEFAULT_CONFIG.buildNumber),
    commitSha: getEnvString('EXPO_PUBLIC_COMMIT_SHA'),
    
    // API Configuration
    api: {
      url: getEnvString('EXPO_PUBLIC_API_URL', DEFAULT_CONFIG.api.url),
      key: getEnvString('EXPO_PUBLIC_API_KEY'),
      timeout: getEnvNumber('EXPO_PUBLIC_API_TIMEOUT', DEFAULT_CONFIG.api.timeout),
    },
    
    // Firebase Configuration
    firebase: {
      apiKey: getEnvString('EXPO_PUBLIC_FIREBASE_API_KEY', DEFAULT_CONFIG.firebase.apiKey),
      authDomain: getEnvString('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', DEFAULT_CONFIG.firebase.authDomain),
      projectId: getEnvString('EXPO_PUBLIC_FIREBASE_PROJECT_ID', DEFAULT_CONFIG.firebase.projectId),
      storageBucket: getEnvString('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', DEFAULT_CONFIG.firebase.storageBucket),
      messagingSenderId: getEnvString('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', DEFAULT_CONFIG.firebase.messagingSenderId),
      appId: getEnvString('EXPO_PUBLIC_FIREBASE_APP_ID', DEFAULT_CONFIG.firebase.appId),
      measurementId: getEnvString('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'),
    },
    
    // Feature Flags
    features: {
      aiInventory: getEnvBoolean('EXPO_PUBLIC_FEATURE_AI_INVENTORY', DEFAULT_CONFIG.features.aiInventory),
      analytics: getEnvBoolean('EXPO_PUBLIC_FEATURE_ANALYTICS', DEFAULT_CONFIG.features.analytics),
      pushNotifications: getEnvBoolean('EXPO_PUBLIC_FEATURE_PUSH_NOTIFICATIONS', DEFAULT_CONFIG.features.pushNotifications),
      offlineMode: getEnvBoolean('EXPO_PUBLIC_FEATURE_OFFLINE_MODE', DEFAULT_CONFIG.features.offlineMode),
      debugMode: getEnvBoolean('EXPO_PUBLIC_FEATURE_DEBUG_MODE', DEFAULT_CONFIG.features.debugMode),
    },
    
    // Analytics Configuration
    analytics: {
      enabled: getEnvBoolean('EXPO_PUBLIC_ANALYTICS_ENABLED', DEFAULT_CONFIG.analytics.enabled),
      trackingId: getEnvString('EXPO_PUBLIC_ANALYTICS_TRACKING_ID'),
      sampleRate: getEnvNumber('EXPO_PUBLIC_ANALYTICS_SAMPLE_RATE', DEFAULT_CONFIG.analytics.sampleRate),
    },
    
    // Cache Configuration
    cache: {
      enabled: getEnvBoolean('EXPO_PUBLIC_CACHE_ENABLED', DEFAULT_CONFIG.cache.enabled),
      ttl: getEnvNumber('EXPO_PUBLIC_CACHE_TTL', DEFAULT_CONFIG.cache.ttl),
      maxSize: getEnvNumber('EXPO_PUBLIC_CACHE_MAX_SIZE', DEFAULT_CONFIG.cache.maxSize),
    },
    
    // Error Reporting
    errorReporting: {
      enabled: getEnvBoolean('EXPO_PUBLIC_ERROR_REPORTING_ENABLED', DEFAULT_CONFIG.errorReporting.enabled),
      sentryDsn: getEnvString('EXPO_PUBLIC_SENTRY_DSN'),
      sampleRate: getEnvNumber('EXPO_PUBLIC_ERROR_SAMPLE_RATE', DEFAULT_CONFIG.errorReporting.sampleRate),
    },
    
    // User Configuration Limits
    limits: {
      maxHouseholdsPerUser: getEnvNumber('EXPO_PUBLIC_MAX_HOUSEHOLDS_PER_USER', DEFAULT_CONFIG.limits.maxHouseholdsPerUser),
      maxItemsPerHousehold: getEnvNumber('EXPO_PUBLIC_MAX_ITEMS_PER_HOUSEHOLD', DEFAULT_CONFIG.limits.maxItemsPerHousehold),
      maxMembersPerHousehold: getEnvNumber('EXPO_PUBLIC_MAX_MEMBERS_PER_HOUSEHOLD', DEFAULT_CONFIG.limits.maxMembersPerHousehold),
      maxShoppingLists: getEnvNumber('EXPO_PUBLIC_MAX_SHOPPING_LISTS', DEFAULT_CONFIG.limits.maxShoppingLists),
      maxFileUploadSize: getEnvNumber('EXPO_PUBLIC_MAX_FILE_UPLOAD_SIZE', DEFAULT_CONFIG.limits.maxFileUploadSize),
    },
    
    // Security Configuration
    security: {
      sessionTimeout: getEnvNumber('EXPO_PUBLIC_SESSION_TIMEOUT', DEFAULT_CONFIG.security.sessionTimeout),
      maxLoginAttempts: getEnvNumber('EXPO_PUBLIC_MAX_LOGIN_ATTEMPTS', DEFAULT_CONFIG.security.maxLoginAttempts),
      passwordMinLength: getEnvNumber('EXPO_PUBLIC_PASSWORD_MIN_LENGTH', DEFAULT_CONFIG.security.passwordMinLength),
    },
    
    // Development/Testing
    debug: {
      logsEnabled: getEnvBoolean('EXPO_PUBLIC_DEBUG_LOGS', DEFAULT_CONFIG.debug.logsEnabled),
      mockData: getEnvBoolean('EXPO_PUBLIC_MOCK_DATA', DEFAULT_CONFIG.debug.mockData),
      testMode: getEnvBoolean('EXPO_PUBLIC_TEST_MODE', DEFAULT_CONFIG.debug.testMode),
    },
  };

  return config;
}

/**
 * Global configuration instance
 */
export const config = loadEnvironmentConfig();

/**
 * Utility function to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
  return config.features[feature];
}

/**
 * Utility function to get environment-specific values
 */
export function isDevelopment(): boolean {
  return config.env === 'development';
}

export function isProduction(): boolean {
  return config.env === 'production';
}

export function isStaging(): boolean {
  return config.env === 'staging';
}

export function isTest(): boolean {
  return config.env === 'test';
}