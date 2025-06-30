declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // API Configuration
      EXPO_PUBLIC_API_URL?: string;
      EXPO_PUBLIC_API_KEY?: string;
      
      // Firebase Configuration
      EXPO_PUBLIC_FIREBASE_API_KEY?: string;
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
      EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
      EXPO_PUBLIC_FIREBASE_APP_ID?: string;
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
      
      // Demo Account Configuration
      EXPO_PUBLIC_DEMO_EMAIL?: string;
      EXPO_PUBLIC_DEMO_PASSWORD?: string;
      
      // Environment Configuration
      EXPO_PUBLIC_ENVIRONMENT?: string;
      EXPO_PUBLIC_APP_VERSION?: string;
      EXPO_PUBLIC_BUILD_TIMESTAMP?: string;
      
      // Feature Flags
      EXPO_PUBLIC_ENABLE_DEMO_MODE?: string;
      EXPO_PUBLIC_ENABLE_ANALYTICS?: string;
    }
  }
}

// Ensure this file is treated as a module
export {};