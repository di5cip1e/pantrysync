declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Environment Configuration
      NODE_ENV?: 'development' | 'staging' | 'production' | 'test';
      EXPO_PUBLIC_ENV?: 'development' | 'staging' | 'production' | 'test';
      
      // Version Tracking
      EXPO_PUBLIC_APP_VERSION?: string;
      EXPO_PUBLIC_BUILD_NUMBER?: string;
      EXPO_PUBLIC_COMMIT_SHA?: string;
      
      // API Configuration
      EXPO_PUBLIC_API_URL?: string;
      EXPO_PUBLIC_API_KEY?: string;
      EXPO_PUBLIC_API_TIMEOUT?: string;
      
      // Firebase Configuration
      EXPO_PUBLIC_FIREBASE_API_KEY?: string;
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
      EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
      EXPO_PUBLIC_FIREBASE_APP_ID?: string;
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
      
      // Feature Flags
      EXPO_PUBLIC_FEATURE_AI_INVENTORY?: string;
      EXPO_PUBLIC_FEATURE_ANALYTICS?: string;
      EXPO_PUBLIC_FEATURE_PUSH_NOTIFICATIONS?: string;
      EXPO_PUBLIC_FEATURE_OFFLINE_MODE?: string;
      EXPO_PUBLIC_FEATURE_DEBUG_MODE?: string;
      
      // Analytics Configuration
      EXPO_PUBLIC_ANALYTICS_ENABLED?: string;
      EXPO_PUBLIC_ANALYTICS_TRACKING_ID?: string;
      EXPO_PUBLIC_ANALYTICS_SAMPLE_RATE?: string;
      
      // Cache Configuration
      EXPO_PUBLIC_CACHE_TTL?: string;
      EXPO_PUBLIC_CACHE_MAX_SIZE?: string;
      EXPO_PUBLIC_CACHE_ENABLED?: string;
      
      // Error Reporting
      EXPO_PUBLIC_ERROR_REPORTING_ENABLED?: string;
      EXPO_PUBLIC_SENTRY_DSN?: string;
      EXPO_PUBLIC_ERROR_SAMPLE_RATE?: string;
      
      // User Configuration Limits
      EXPO_PUBLIC_MAX_HOUSEHOLDS_PER_USER?: string;
      EXPO_PUBLIC_MAX_ITEMS_PER_HOUSEHOLD?: string;
      EXPO_PUBLIC_MAX_MEMBERS_PER_HOUSEHOLD?: string;
      EXPO_PUBLIC_MAX_SHOPPING_LISTS?: string;
      EXPO_PUBLIC_MAX_FILE_UPLOAD_SIZE?: string;
      
      // Security Configuration
      EXPO_PUBLIC_SESSION_TIMEOUT?: string;
      EXPO_PUBLIC_MAX_LOGIN_ATTEMPTS?: string;
      EXPO_PUBLIC_PASSWORD_MIN_LENGTH?: string;
      
      // Development/Testing
      EXPO_PUBLIC_DEBUG_LOGS?: string;
      EXPO_PUBLIC_MOCK_DATA?: string;
      EXPO_PUBLIC_TEST_MODE?: string;
    }
  }
}

// Ensure this file is treated as a module
export {};