import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEnvironmentConfig } from './environment';

// Get Firebase configuration from environment variables
const envConfig = getEnvironmentConfig();
const firebaseConfig = envConfig.firebase;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // For React Native, use basic initialization
  // Note: AsyncStorage persistence is handled automatically in Firebase v10
  auth = initializeAuth(app, {
    // The persistence is handled automatically by Firebase v10
  });
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export { auth };
export default app;