import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, TriangleAlert as AlertTriangle, Chrome as Home, User, Building, ArrowRight } from 'lucide-react-native';

export default function Index() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { 
    households, 
    loading: householdLoading, 
    error: householdError,
    hasAttemptedLoad,
    currentHousehold,
    loadHouseholds
  } = useHousehold();
  const router = useRouter();
  const [forceLogoutLoading, setForceLogoutLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [navigationAttempted, setNavigationAttempted] = useState(false);
  const [autoNavigationTimer, setAutoNavigationTimer] = useState(5);

  // Auto-navigation countdown
  useEffect(() => {
    if (!authLoading && user && !navigationAttempted) {
      const timer = setInterval(() => {
        setAutoNavigationTimer(prev => {
          if (prev <= 1) {
            // Auto-navigate when timer reaches 0
            handleAutoNavigation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [authLoading, user, navigationAttempted]);

  // Set debug mode after 3 seconds if still loading
  useEffect(() => {
    const debugTimer = setTimeout(() => {
      if (authLoading || householdLoading) {
        setDebugMode(true);
      }
    }, 3000);

    return () => clearTimeout(debugTimer);
  }, [authLoading, householdLoading]);

  const handleAutoNavigation = () => {
    if (navigationAttempted) return;
    setNavigationAttempted(true);
    
    console.log('🔄 Auto Navigation Logic:', {
      user: !!user,
      currentHousehold: !!currentHousehold,
      householdsCount: households.length,
      hasAttemptedLoad,
      householdLoading
    });
    
    if (!user) {
      console.log('🔄 No user, redirecting to auth');
      router.replace('/auth');
    } else {
      // User is authenticated, check household status
      if (currentHousehold) {
        // User has a current household - go to app
        console.log('✅ User has current household, redirecting to app');
        router.replace('/(tabs)');
      } else if (hasAttemptedLoad && households.length > 0) {
        // User has households but no current one selected
        console.log('🏠 User has households, redirecting to app');
        router.replace('/(tabs)');
      } else if (!hasAttemptedLoad && !householdLoading) {
        // Haven't tried loading households yet, try to load them
        console.log('🔄 Attempting to load households...');
        loadHouseholds().catch(() => {
          // If loading fails, go to setup
          console.log('🏠 Failed to load households, redirecting to setup');
          router.replace('/household-setup');
        });
      } else if (hasAttemptedLoad && households.length === 0) {
        // User needs to set up or join a household
        console.log('🏠 No households found, redirecting to setup');
        router.replace('/household-setup');
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !navigationAttempted) {
      handleAutoNavigation();
    }
  }, [user, authLoading, currentHousehold, households, hasAttemptedLoad, householdLoading, navigationAttempted, router, loadHouseholds]);

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
      setNavigationAttempted(false); // Reset navigation flag
      router.replace('/auth');
    } catch (error) {
      console.error('❌ Force logout error:', error);
      // Even if signOut fails, try to navigate anyway
      setNavigationAttempted(false);
      router.replace('/auth');
    } finally {
      setForceLogoutLoading(false);
    }
  };

  const handleGoToAuth = () => {
    console.log('🔄 Manual navigation to auth page');
    setNavigationAttempted(false);
    router.replace('/auth');
  };

  const handleGoToSetup = () => {
    console.log('🏠 Manual navigation to household setup');
    setNavigationAttempted(false);
    router.replace('/household-setup');
  };

  const handleGoToApp = () => {
    console.log('📱 Manual navigation to app');
    setNavigationAttempted(false);
    router.replace('/(tabs)');
  };

  const getStatusMessage = () => {
    if (authLoading) return 'Authenticating...';
    if (!user) return 'Please sign in';
    if (householdLoading) return 'Loading households...';
    if (currentHousehold) return `Ready! Going to ${currentHousehold.name}`;
    if (households.length > 0) return 'Ready! Going to app';
    if (hasAttemptedLoad) return 'Setting up household...';
    return 'Preparing your account...';
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
        
        {/* Main Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
          
          {/* Auto-navigation countdown */}
          {user && !navigationAttempted && autoNavigationTimer > 0 && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                Auto-navigating in {autoNavigationTimer}s
              </Text>
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={handleAutoNavigation}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
                <ArrowRight color="#667eea" size={16} />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Loading indicator */}
          {(authLoading || householdLoading) && !debugMode && (
            <ActivityIndicator size="large" color="#667eea" style={styles.loader} />
          )}
        </View>
        
        {/* Debug/manual navigation options */}
        {(debugMode || householdError || navigationAttempted) && (
          <View style={styles.navigationContainer}>
            {householdError && (
              <View style={styles.errorSection}>
                <AlertTriangle color="#ffffff" size={32} style={styles.errorIcon} />
                <Text style={styles.errorTitle}>Navigation Help</Text>
                <Text style={styles.errorMessage}>
                  There was an issue loading your data. Choose where you'd like to go:
                </Text>
              </View>
            )}
            
            {debugMode && !householdError && (
              <View style={styles.debugSection}>
                <Text style={styles.debugTitle}>Manual Navigation</Text>
                <Text style={styles.debugText}>
                  Loading is taking longer than expected. You can navigate manually:
                </Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.authButton]}
                onPress={handleGoToAuth}
              >
                <User color="#ffffff" size={20} />
                <Text style={styles.actionButtonText}>Go to Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.setupButton]}
                onPress={handleGoToSetup}
              >
                <Building color="#ffffff" size={20} />
                <Text style={styles.actionButtonText}>Household Setup</Text>
              </TouchableOpacity>

              {user && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.appButton]}
                  onPress={handleGoToApp}
                >
                  <Home color="#ffffff" size={20} />
                  <Text style={styles.actionButtonText}>Go to App</Text>
                </TouchableOpacity>
              )}

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
        )}

        {/* Status indicator at bottom */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Auth:</Text>
            <Text style={[styles.statusValue, { color: user ? '#27ae60' : '#e74c3c' }]}>
              {authLoading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Household:</Text>
            <Text style={[styles.statusValue, { color: currentHousehold ? '#27ae60' : '#f39c12' }]}>
              {householdLoading ? 'Loading...' : currentHousehold ? currentHousehold.name : `${households.length} available`}
            </Text>
          </View>
        </View>
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
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 280,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(10px)',
    } : {}),
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  countdownContainer: {
    alignItems: 'center',
    gap: 12,
  },
  countdownText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  skipButtonText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 14,
  },
  loader: {
    marginTop: 8,
  },
  navigationContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    maxWidth: 350,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(10px)',
    } : {}),
  },
  errorSection: {
    alignItems: 'center',
    marginBottom: 24,
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
    lineHeight: 20,
  },
  debugSection: {
    alignItems: 'center',
    marginBottom: 24,
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
  appButton: {
    backgroundColor: '#3498db',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(10px)',
    } : {}),
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});