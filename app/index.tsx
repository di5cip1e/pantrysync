import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, TriangleAlert as AlertTriangle, Chrome as Home } from 'lucide-react-native';

export default function Index() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { 
    households, 
    loading: householdLoading, 
    error: householdError,
    hasAttemptedLoad,
    currentHousehold
  } = useHousehold();
  const router = useRouter();
  const [forceLogoutLoading, setForceLogoutLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    // Set debug mode after 3 seconds if still loading
    const debugTimer = setTimeout(() => {
      if (authLoading) {
        setDebugMode(true);
      }
    }, 3000);

    return () => clearTimeout(debugTimer);
  }, [authLoading]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('🔄 No user, redirecting to auth');
        router.replace('/auth');
      } else if (currentHousehold) {
        // User has a current household - go to app
        console.log('✅ User has current household, redirecting to app');
        router.replace('/(tabs)');
      } else {
        // User needs to set up or load household
        console.log('🏠 No current household, redirecting to setup');
        router.replace('/household-setup');
      }
    }
  }, [user, authLoading, currentHousehold, router]);

  const handleForceLogout = async () => {
    try {
      setForceLogoutLoading(true);
      console.log('🚪 Force logout initiated');
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        localStorage?.clear();
        sessionStorage?.clear();
      }
      
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('❌ Force logout error:', error);
      // Even if signOut fails, try to navigate anyway
      router.replace('/auth');
    } finally {
      setForceLogoutLoading(false);
    }
  };

  const handleGoToAuth = () => {
    console.log('🔄 Manual navigation to auth page');
    router.replace('/auth');
  };

  const handleGoToSetup = () => {
    console.log('🏠 Manual navigation to household setup');
    router.replace('/household-setup');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Home color="#ffffff" size={64} style={styles.icon} />
        <Text style={styles.title}>PantrySync</Text>
        <Text style={styles.subtitle}>Sync your household essentials</Text>
        
        {authLoading && !debugMode ? (
          <View>
            <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : null}
        
        {(debugMode || householdError) ? (
          <View style={styles.navigationContainer}>
            {householdError ? (
              <View>
                <AlertTriangle color="#ffffff" size={32} style={styles.errorIcon} />
                <Text style={styles.errorTitle}>Navigation Help</Text>
                <Text style={styles.errorMessage}>
                  Choose where you'd like to go:
                </Text>
              </View>
            ) : null}
            
            {debugMode ? (
              <View>
                <Text style={styles.debugTitle}>Manual Navigation</Text>
                <Text style={styles.debugText}>Loading is taking longer than expected. You can navigate manually:</Text>
              </View>
            ) : null}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.authButton]}
                onPress={handleGoToAuth}
              >
                <Text style={styles.actionButtonText}>Go to Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.setupButton]}
                onPress={handleGoToSetup}
              >
                <Text style={styles.actionButtonText}>Household Setup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleForceLogout}
                disabled={forceLogoutLoading}
              >
                <LogOut color="#ffffff" size={20} />
                <Text style={styles.actionButtonText}>
                  {forceLogoutLoading ? 'Logging out...' : 'Force Logout'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 16,
    opacity: 0.9,
  },
  navigationContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    maxWidth: 350,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  authButton: {
    backgroundColor: '#27ae60',
  },
  setupButton: {
    backgroundColor: '#667eea',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});