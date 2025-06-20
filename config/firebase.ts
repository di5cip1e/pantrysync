import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAJMtmBb1yQ1r6LOwt7ZUQc_y2KH-M-ZqY",
  authDomain: "pantrysync-app.firebaseapp.com",
  projectId: "pantrysync-app",
  storageBucket: "pantrysync-app.firebasestorage.app",
  messagingSenderId: "1029154109726",
  appId: "1:1029154109726:web:69effce8987dcd6349b10f",
  measurementId: "G-HJW6RR5H7D"
};

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