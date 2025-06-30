import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './environment';
import { validateEnvironment } from './env-validation';

// Validate environment configuration on initialization
const validation = validateEnvironment();
if (!validation.isValid) {
  console.error('❌ Environment validation failed:', validation.errors);
  if (config.env === 'production') {
    throw new Error('Invalid environment configuration');
  }
}

if (validation.warnings.length > 0) {
  console.warn('⚠️ Environment warnings:', validation.warnings);
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
  measurementId: config.firebase.measurementId,
};

// Validate required Firebase configuration
const requiredFirebaseFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
for (const field of requiredFirebaseFields) {
  if (!firebaseConfig[field as keyof typeof firebaseConfig]) {
    throw new Error(`Missing required Firebase configuration: ${field}`);
  }
}

console.log(`🔥 Initializing Firebase for ${config.env} environment`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export { auth };
export default app;