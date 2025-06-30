import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import { getEnvironmentConfig } from './environment';

// Get Firebase configuration from environment variables
// This will throw an error if required environment variables are missing
const envConfig = getEnvironmentConfig();
const firebaseConfig = envConfig.firebase;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // For React Native, initializeAuth is used only if getAuth hasn't been called
  try {
    auth = getAuth(app);
  } catch {
    // If getAuth fails, initialize with custom configuration
    auth = initializeAuth(app);
  }
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export { auth };
export default app;