import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { householdService } from '@/services/firestore';
import { Household } from '@/types';

interface HouseholdContextType {
  households: Household[];
  currentHousehold: Household | null;
  loading: boolean;
  error: string | null;
  hasAttemptedLoad: boolean;
  isFirstTimeUser: boolean;
  createHousehold: (name: string, description?: string) => Promise<void>;
  joinHousehold: (inviteCode: string) => Promise<void>;
  loadHouseholds: () => Promise<void>;
  switchHousehold: (householdId: string) => void;
  refreshHouseholds: () => Promise<void>;
  clearError: () => void;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
}

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Check if user is first-time user (hasn't successfully loaded households before)
  useEffect(() => {
    if (user) {
      const storageKey = `pantrysync_user_${user.id}_loaded_households`;
      const hasLoadedBefore = localStorage.getItem(storageKey) === 'true';
      setIsFirstTimeUser(!hasLoadedBefore);
      
      console.log('👤 User detected:', {
        userId: user.id,
        isFirstTime: !hasLoadedBefore
      });
    } else {
      // Clear all state when user logs out
      console.log('🏠 User logged out, clearing all household state');
      setHouseholds([]);
      setCurrentHousehold(null);
      setError(null);
      setLoading(false);
      setHasAttemptedLoad(false);
      setIsFirstTimeUser(false);
    }
  }, [user]);

  const loadHouseholds = async () => {
    if (!user) {
      console.log('⚠️ Cannot load households - no user authenticated');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setHasAttemptedLoad(true);
      
      console.log('🔄 Loading households for user:', user.id);
      
      const userHouseholds = await householdService.getByUserId(user.id);
      console.log('🏠 Successfully loaded households:', userHouseholds.length);
      
      setHouseholds(userHouseholds);
      
      // Set current household to first one if none selected
      if (userHouseholds.length > 0) {
        const newCurrent = userHouseholds[0];
        console.log('🏠 Setting current household to:', newCurrent.name);
        setCurrentHousehold(newCurrent);
      } else {
        console.log('🏠 No households found');
        setCurrentHousehold(null);
      }

      // Mark that user has successfully loaded households
      const storageKey = `pantrysync_user_${user.id}_loaded_households`;
      localStorage.setItem(storageKey, 'true');
      setIsFirstTimeUser(false);
      
    } catch (err: any) {
      console.error('❌ Error loading households:', err.message);
      
      // Check for specific permission errors
      if (err.message.includes('permission') || err.message.includes('access') || err.message.includes('denied')) {
        setError('Permission denied. You may need to sign in again or contact an administrator.');
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Error loading households: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const createHousehold = async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      console.log('🏗️ Creating household:', name);
      
      const householdId = await householdService.create(
        name, 
        description || '', 
        user.id, 
        user.email, 
        user.displayName
      );
      console.log('✅ Household created with ID:', householdId);
      
      // After creating, load households to get the updated list
      await loadHouseholds();
      
      // Find and set the newly created household as current
      const updatedHouseholds = await householdService.getByUserId(user.id);
      const newHousehold = updatedHouseholds.find(h => h.id === householdId);
      
      if (newHousehold) {
        console.log('🏠 Setting newly created household as current:', newHousehold.name);
        setCurrentHousehold(newHousehold);
      }
    } catch (err: any) {
      console.error('❌ Error creating household:', err.message);
      setError(err.message);
      throw err;
    }
  };

  const joinHousehold = async (inviteCode: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      console.log('🚪 Joining household with code:', inviteCode);
      
      await householdService.joinByInviteCode(inviteCode, user.id, user.email, user.displayName);
      console.log('✅ Successfully joined household');
      
      // After joining, load households to include the newly joined one
      await loadHouseholds();
    } catch (err: any) {
      console.error('❌ Error joining household:', err.message);
      setError(err.message);
      throw err;
    }
  };

  const switchHousehold = (householdId: string) => {
    const household = households.find(h => h.id === householdId);
    if (household) {
      console.log('🔄 Switching to household:', household.name);
      setCurrentHousehold(household);
    } else {
      console.error('❌ Household not found with ID:', householdId);
    }
  };

  const refreshHouseholds = async () => {
    console.log('🔄 Refreshing households...');
    await loadHouseholds();
  };

  const clearError = () => {
    setError(null);
  };

  const value: HouseholdContextType = {
    households,
    currentHousehold,
    loading,
    error,
    hasAttemptedLoad,
    isFirstTimeUser,
    createHousehold,
    joinHousehold,
    loadHouseholds,
    switchHousehold,
    refreshHouseholds,
    clearError,
  };

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}