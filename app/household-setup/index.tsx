import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useHousehold } from '@/contexts/HouseholdContext';
import { useAuth } from '@/contexts/AuthContext';
import { Chrome as Home, Users, Plus, LogOut, RefreshCw, Search } from 'lucide-react-native';

export default function HouseholdSetupScreen() {
  const [mode, setMode] = useState<'create' | 'join' | 'load'>('create');
  const [householdName, setHouseholdName] = useState('');
  const [householdDescription, setHouseholdDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { 
    createHousehold, 
    joinHousehold, 
    loadHouseholds, 
    households, 
    loading: householdLoading,
    hasAttemptedLoad,
    isFirstTimeUser,
    error: householdError,
    clearError
  } = useHousehold();
  const { signOut } = useAuth();
  const router = useRouter();

  // Don't automatically redirect - let user choose what to do
  useEffect(() => {
    if (householdError) {
      setError(householdError);
    }
  }, [householdError]);

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) {
      setError('Please enter a household name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createHousehold(householdName.trim(), householdDescription.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinHousehold(inviteCode.trim().toUpperCase());
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHouseholds = async () => {
    setError('');
    clearError();
    console.log('🔄 Loading existing households...');
    
    try {
      await loadHouseholds();
      
      // After loading, check if we have households
      if (households.length > 0) {
        console.log('✅ Households loaded, redirecting to app');
        router.replace('/(tabs)');
      } else {
        setError('No households found. You can create a new one or join an existing household.');
        setMode('create');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load households');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth');
            } catch (error) {
              console.error('❌ Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const handleGoToLogin = () => {
    console.log('🔄 Going to login screen...');
    router.replace('/auth');
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <LogOut color="#ffffff" size={20} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Home color="#ffffff" size={48} />
              <Text style={styles.title}>Set Up Your Household</Text>
              <Text style={styles.subtitle}>
                Load existing, create new, or join a household
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.goToLoginButton}
                  onPress={handleGoToLogin}
                >
                  <Text style={styles.goToLoginText}>Go to Login Screen</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'load' && styles.modeButtonActive,
                ]}
                onPress={() => {
                  setMode('load');
                  setError('');
                }}
              >
                <Search color={mode === 'load' ? '#ffffff' : '#667eea'} size={18} />
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'load' && styles.modeButtonTextActive,
                  ]}
                >
                  Load Existing
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'create' && styles.modeButtonActive,
                ]}
                onPress={() => {
                  setMode('create');
                  setError('');
                }}
              >
                <Plus color={mode === 'create' ? '#ffffff' : '#667eea'} size={18} />
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'create' && styles.modeButtonTextActive,
                  ]}
                >
                  Create New
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'join' && styles.modeButtonActive,
                ]}
                onPress={() => {
                  setMode('join');
                  setError('');
                }}
              >
                <Users color={mode === 'join' ? '#ffffff' : '#667eea'} size={18} />
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'join' && styles.modeButtonTextActive,
                  ]}
                >
                  Join Existing
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'load' ? (
              <View style={styles.loadSection}>
                <Text style={styles.loadTitle}>Load Your Households</Text>
                <Text style={styles.loadDescription}>
                  If you already have households but can't see them, click below to load them from the server.
                </Text>
                
                <TouchableOpacity
                  style={[styles.loadButton, (householdLoading || loading) && styles.buttonDisabled]}
                  onPress={handleLoadHouseholds}
                  disabled={householdLoading || loading}
                >
                  <RefreshCw color="#ffffff" size={20} />
                  <Text style={styles.loadButtonText}>
                    {householdLoading ? 'Loading Households...' : 'Load Households'}
                  </Text>
                </TouchableOpacity>

                {hasAttemptedLoad && households.length > 0 ? (
                  <View style={styles.householdsFound}>
                    <Text style={styles.householdsFoundText}>
                      Found {households.length} household{households.length > 1 ? 's' : ''}:
                    </Text>
                    {households.map((household) => (
                      <TouchableOpacity
                        key={household.id}
                        style={styles.householdItem}
                        onPress={() => router.replace('/(tabs)')}
                      >
                        <Text style={styles.householdName}>{household.name}</Text>
                        <Text style={styles.householdMembers}>
                          {household.members.length} member{household.members.length > 1 ? 's' : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {mode === 'create' ? (
              <View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Household Name (e.g., The Smith Family)"
                    value={householdName}
                    onChangeText={setHouseholdName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description (optional)"
                    value={householdDescription}
                    onChangeText={setHouseholdDescription}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleCreateHousehold}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Creating...' : 'Create Household'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {mode === 'join' ? (
              <View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Invite Code"
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleJoinHousehold}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Joining...' : 'Join Household'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                {mode === 'load' ? 'Loading Households' : 
                 mode === 'create' ? 'Creating a Household' : 'Joining a Household'}
              </Text>
              <Text style={styles.infoText}>
                {mode === 'load' 
                  ? 'This will fetch your existing households from the server. If you have permission issues, try signing out and back in.'
                  : mode === 'create'
                  ? 'You\'ll be the admin and can invite family members using a unique invite code.'
                  : 'Ask a household member for the invite code to join their pantry and shopping lists.'}
              </Text>
            </View>

            <View style={styles.emergencySection}>
              <TouchableOpacity 
                style={styles.emergencyButton}
                onPress={handleGoToLogin}
              >
                <Text style={styles.emergencyButtonText}>
                  Return to Login Screen
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  signOutButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  errorContainer: {
    backgroundColor: '#ffeaea',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  goToLoginButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  goToLoginText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: '#667eea',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  loadSection: {
    marginBottom: 20,
  },
  loadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  loadDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  loadButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  householdsFound: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  householdsFoundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  householdItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  householdName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  householdMembers: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emergencySection: {
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    paddingTop: 20,
  },
  emergencyButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});