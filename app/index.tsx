import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, TriangleAlert as AlertTriangle, Chrome as Home } from 'lucide-react-native';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { 
    households, 
    loading: householdLoading, 
    error: householdError,
    hasAttemptedLoad,
    currentHousehold,
    loadHouseholds
  } = useHousehold();
  const router = useRouter();
  const [navigationComplete, setNavigationComplete] = useState(false);

  // Main navigation logic
  useEffect(() => {
    if (authLoading || navigationComplete) return;

    const navigate = async () => {
      console.log('🔄 Navigation check:', {
        user: !!user,
        currentHousehold: !!currentHousehold,
        householdsCount: households.length,
        hasAttemptedLoad,
        householdLoading
      });

      if (!user) {
        console.log('➡️ No user, going to auth');
        router.replace('/auth');
        setNavigationComplete(true);
        return;
      }

      // User is authenticated
      if (currentHousehold) {
        console.log('➡️ User has current household, going to app');
        router.replace('/(tabs)');
        setNavigationComplete(true);
        return;
      }

      if (hasAttemptedLoad && households.length > 0) {
        console.log('➡️ User has households, going to app');
        router.replace('/(tabs)');
        setNavigationComplete(true);
        return;
      }

      if (!hasAttemptedLoad && !householdLoading) {
        console.log('🔄 Loading households...');
        try {
          await loadHouseholds();
        } catch (error) {
          console.log('❌ Failed to load households, going to setup');
          router.replace('/household-setup');
          setNavigationComplete(true);
        }
        return;
      }

      if (hasAttemptedLoad && households.length === 0) {
        console.log('➡️ No households found, going to setup');
        router.replace('/household-setup');
        setNavigationComplete(true);
        return;
      }
    };

    // Small delay to ensure contexts are ready
    const timer = setTimeout(navigate, 100);
    return () => clearTimeout(timer);
  }, [user, authLoading, currentHousehold, households, hasAttemptedLoad, householdLoading, navigationComplete, router, loadHouseholds]);

  // Show loading state
  if (authLoading || householdLoading || navigationComplete) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <View style={styles.content}>
          <Home color="#ffffff" size={64} style={styles.icon} />
          <Text style={styles.title}>PantrySync</Text>
          <Text style={styles.subtitle}>Sync your household essentials</Text>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
            <Text style={styles.loadingText}>
              {authLoading ? 'Authenticating...' : 
               householdLoading ? 'Loading households...' : 
               'Navigating...'}
            </Text>
          </View>

          {/* Debug info */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Auth: {user ? '✅' : '❌'} | 
              Households: {households.length} | 
              Current: {currentHousehold ? '✅' : '❌'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Fallback - should not normally be reached
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Home color="#ffffff" size={64} style={styles.icon} />
        <Text style={styles.title}>PantrySync</Text>
        <Text style={styles.subtitle}>Loading...</Text>
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
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  debugContainer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  debugText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
});