import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
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


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJMtmBb1yQ1r6LOwt7ZUQc_y2KH-M-ZqY",
  authDomain: "pantrysync-app.firebaseapp.com",
  databaseURL: "https://pantrysync-app-default-rtdb.firebaseio.com",
  projectId: "pantrysync-app",
  storageBucket: "pantrysync-app.firebasestorage.app",
  messagingSenderId: "1029154109726",
  appId: "1:1029154109726:web:69effce8987dcd6349b10f",
  measurementId: "G-HJW6RR5H7D"
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

// Initialize Auth
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // For React Native, we'll use basic initialization for now
  // as getReactNativePersistence might not be available in this version
  auth = getAuth(app);
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export { auth };
export default app;
