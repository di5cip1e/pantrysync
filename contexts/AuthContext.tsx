import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('👤 User document found in Firestore');
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: userData.displayName || firebaseUser.displayName || '',
              photoURL: userData.photoURL || firebaseUser.photoURL,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            });
          } else {
            // If Firestore document doesn't exist, create it from Firebase Auth data
            console.log('📝 User document not found, creating from Firebase Auth data');
            const userData = {
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            // Create the document
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            
            // Set user state
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } catch (error) {
          console.error('❌ Error getting user document:', error);
          // Fallback to Firebase Auth data if Firestore fails
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        console.log('👋 User signed out');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting to sign in...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful');
    } catch (error: any) {
      console.error('❌ Sign in error:', error.message);
      
      // Provide user-friendly error messages
      let userMessage = 'Sign in failed. Please try again.';
      
      if (error.code === 'auth/invalid-credential') {
        userMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/user-not-found') {
        userMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        userMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        userMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        userMessage = 'Network error. Please check your connection and try again.';
      }
      
      throw new Error(userMessage);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      console.log('📝 Creating new account...');
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log('👤 Updating Firebase Auth profile...');
      // Update Firebase Auth profile
      await firebaseUpdateProfile(firebaseUser, { displayName });
      
      console.log('💾 Creating Firestore user document...');
      // Create user document in Firestore
      const userData = {
        email,
        displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      console.log('✅ Account creation complete');
    } catch (error: any) {
      console.error('❌ Sign up error:', error.message);
      
      // Provide user-friendly error messages
      let userMessage = 'Account creation failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        userMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        userMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        userMessage = 'Invalid email address. Please enter a valid email.';
      } else if (error.code === 'auth/network-request-failed') {
        userMessage = 'Network error. Please check your connection and try again.';
      }
      
      throw new Error(userMessage);
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Starting sign out process...');
      
      // Clear user state immediately to prevent further operations
      setUser(null);
      setLoading(false);
      
      // Sign out from Firebase (this may throw errors but we'll continue anyway)
      try {
        await firebaseSignOut(auth);
        console.log('✅ Firebase sign out successful');
      } catch (firebaseError: any) {
        console.log('⚠️ Firebase sign out error (continuing anyway):', firebaseError.message);
        // Don't throw - we want to continue with the logout process
      }
      
      // Additional cleanup - clear any localStorage/sessionStorage
      try {
        if (typeof window !== 'undefined') {
          localStorage?.clear();
          sessionStorage?.clear();
        }
      } catch (storageError) {
        console.log('⚠️ Storage cleanup error (harmless):', storageError);
      }
      
      console.log('✅ Sign out process completed');
    } catch (error: any) {
      console.error('❌ Sign out error (but state cleared):', error.message);
      // Even if there are errors, we've cleared the user state
      // This ensures the UI updates correctly
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      console.log('📝 Updating user profile...');
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.id), {
        ...data,
        updatedAt: new Date(),
      });
      
      // Update Firebase Auth profile if displayName changed
      if (data.displayName && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { 
          displayName: data.displayName 
        });
      }
      console.log('✅ Profile update successful');
    } catch (error: any) {
      console.error('❌ Profile update error:', error.message);
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}