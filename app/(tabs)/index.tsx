import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search, Filter, Package, Calendar, TriangleAlert as AlertTriangle, LogOut, X, Save, Camera } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { useRouter } from 'expo-router';
import { pantryService, activityService } from '@/services/firestore';
import { PantryItem } from '@/types';
import CaptureInventoryModal from '@/components/CaptureInventoryModal';

export default function PantryScreen() {
  const { user, signOut } = useAuth();
  const { currentHousehold } = useHousehold();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Use ref to track unsubscribe function and prevent multiple cleanups
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Pantry',
    quantity: 1,
    unit: 'pieces',
    expiryDate: '',
    notes: '',
    lowStockThreshold: 1,
  });

  const categories = ['All', 'Dairy', 'Fruits', 'Vegetables', 'Bakery', 'Meat', 'Pantry', 'Beverages', 'Snacks'];
  const units = ['pieces', 'bottles', 'cans', 'boxes', 'bags', 'lbs', 'oz', 'cups', 'liters'];

  // Cleanup function that can be called from anywhere
  const cleanupSubscriptions = () => {
    if (unsubscribeRef.current) {
      console.log('🧹 Cleaning up Firestore subscriptions...');
      try {
        unsubscribeRef.current();
        console.log('✅ Firestore subscriptions cleaned up successfully');
      } catch (error) {
        console.log('⚠️ Error cleaning up subscriptions (this is usually harmless):', error);
      }
      unsubscribeRef.current = null;
    }
  };

  // Real-time subscription to pantry items with improved cleanup
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;

    // Clean up any existing subscription
    cleanupSubscriptions();

    if (!currentHousehold) {
      setPantryItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('🔄 Setting up real-time subscription for household:', currentHousehold.id);

    try {
      // Subscribe to real-time updates
      const unsubscribe = pantryService.subscribeToItems(currentHousehold.id, (items) => {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          console.log('📦 Real-time update received:', items.length, 'items');
          setPantryItems(items);
          setLoading(false);
        }
      });

      // Store the unsubscribe function
      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up subscription:', error);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }

    // Cleanup function
    return () => {
      console.log('🔄 useEffect cleanup triggered');
      cleanupSubscriptions();
    };
  }, [currentHousehold]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('🔄 Component unmounting, cleaning up...');
      isMountedRef.current = false;
      cleanupSubscriptions();
    };
  }, []);

  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = pantryItems.filter(item => item.quantity <= item.lowStockThreshold);
  const expiringItems = pantryItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

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
              setIsSigningOut(true);
              console.log('🚪 Starting sign out process...');
              
              // Step 1: Clean up all active subscriptions first
              console.log('🧹 Cleaning up subscriptions before sign out...');
              cleanupSubscriptions();
              
              // Step 2: Clear component state
              setPantryItems([]);
              setLoading(false);
              
              // Step 3: Wait a brief moment for cleanup to complete
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Step 4: Sign out from Firebase
              console.log('🔐 Signing out from Firebase...');
              await signOut();
              
              // Step 5: Navigate to auth page
              console.log('🔄 Navigating to auth page...');
              router.replace('/auth');
              
              console.log('✅ Sign out completed successfully');
            } catch (error) {
              console.error('❌ Sign out error:', error);
              // Even if there's an error, try to navigate to auth
              try {
                router.replace('/auth');
              } catch (navError) {
                console.error('❌ Navigation error:', navError);
                Alert.alert('Error', 'Failed to sign out properly. Please refresh the page.');
              }
            } finally {
              setIsSigningOut(false);
            }
          }
        },
      ]
    );
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'Pantry',
      quantity: 1,
      unit: 'pieces',
      expiryDate: '',
      notes: '',
      lowStockThreshold: 1,
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const openEditModal = (item: PantryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : '',
      notes: item.notes || '',
      lowStockThreshold: item.lowStockThreshold,
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim() || !currentHousehold || !user) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        ...formData,
        name: formData.name.trim(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        householdId: currentHousehold.id,
        addedBy: user.id,
      };

      if (editingItem) {
        await pantryService.updateItem(editingItem.id, itemData);
        await activityService.addActivity({
          householdId: currentHousehold.id,
          type: 'pantry_update',
          userId: user.id,
          userName: user.displayName,
          description: `Updated ${formData.name}`,
          metadata: { itemName: formData.name },
        });
      } else {
        await pantryService.addItem(itemData as Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>);
        await activityService.addActivity({
          householdId: currentHousehold.id,
          type: 'pantry_add',
          userId: user.id,
          userName: user.displayName,
          description: `Added ${formData.quantity} ${formData.unit} of ${formData.name}`,
          metadata: { itemName: formData.name, quantity: formData.quantity },
        });
      }

      setShowAddModal(false);
      // Real-time subscription will automatically update the UI
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const handleDeleteItem = (item: PantryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await pantryService.deleteItem(item.id);
              if (currentHousehold && user) {
                await activityService.addActivity({
                  householdId: currentHousehold.id,
                  type: 'pantry_remove',
                  userId: user.id,
                  userName: user.displayName,
                  description: `Removed ${item.name} from pantry`,
                  metadata: { itemName: item.name },
                });
              }
              // Real-time subscription will automatically update the UI
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleItemsDetected = async (detectedItems: any[]) => {
    if (!currentHousehold || !user) return;

    try {
      // Add all detected items to the pantry
      for (const item of detectedItems) {
        const itemData = {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          householdId: currentHousehold.id,
          addedBy: user.id,
          lowStockThreshold: 1,
        };

        await pantryService.addItem(itemData as Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>);
      }

      // Add activity log
      await activityService.addActivity({
        householdId: currentHousehold.id,
        type: 'pantry_add',
        userId: user.id,
        userName: user.displayName,
        description: `Added ${detectedItems.length} items via AI capture`,
        metadata: { itemCount: detectedItems.length },
      });

      Alert.alert('Success', `Added ${detectedItems.length} items to your pantry!`);
    } catch (error) {
      console.error('Error adding detected items:', error);
      Alert.alert('Error', 'Failed to add some items to your pantry');
    }
  };

  if (!currentHousehold) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.displayName}!</Text>
              <Text style={styles.headerSubtitle}>No household selected</Text>
            </View>
            <TouchableOpacity 
              onPress={handleSignOut} 
              style={styles.signOutButton}
              disabled={isSigningOut}
            >
              <LogOut color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.emptyState}>
          <Package color="#ccc" size={64} />
          <Text style={styles.emptyStateText}>No household selected</Text>
          <Text style={styles.emptyStateSubtext}>Join or create a household to get started</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.displayName}!</Text>
            <Text style={styles.headerSubtitle}>{currentHousehold.name}</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSignOut} 
            style={styles.signOutButton}
            disabled={isSigningOut}
          >
            <LogOut color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>

        {/* Real-time Alerts */}
        {(lowStockItems.length > 0 || expiringItems.length > 0) && (
          <View style={styles.alertsContainer}>
            {lowStockItems.length > 0 && (
              <View style={styles.alert}>
                <AlertTriangle color="#f39c12" size={16} />
                <Text style={styles.alertText}>
                  {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low
                </Text>
              </View>
            )}
            {expiringItems.length > 0 && (
              <View style={styles.alert}>
                <Calendar color="#e74c3c" size={16} />
                <Text style={styles.alertText}>
                  {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring soon
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Real-time Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={[styles.realTimeIndicator, { backgroundColor: isSigningOut ? '#f39c12' : '#27ae60' }]} />
          <Text style={styles.statusText}>
            {isSigningOut ? 'Signing out...' : 'Live sync active'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#666" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pantry items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#667eea" size={20} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pantry Items */}
        <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Connecting to live sync...</Text>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Package color="#ccc" size={64} />
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No items match your search' : 'Your pantry is empty'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try a different search term' : 'Add your first item to get started'}
              </Text>
            </View>
          ) : (
            <View style={styles.itemsGrid}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => openEditModal(item)}
                  onLongPress={() => handleDeleteItem(item)}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  ) : (
                    <View style={styles.itemImagePlaceholder}>
                      <Package color="#ccc" size={32} />
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemQuantity}>
                        {item.quantity} {item.unit}
                      </Text>
                      {item.quantity <= item.lowStockThreshold && (
                        <View style={styles.lowStockBadge}>
                          <Text style={styles.lowStockText}>Low</Text>
                        </View>
                      )}
                    </View>
                    {item.expiryDate && (
                      <Text style={styles.itemExpiry}>
                        Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Floating Action Buttons */}
        <View style={styles.fabContainer}>
          <TouchableOpacity 
            style={[styles.fabButton, styles.captureButton]} 
            onPress={() => setShowCaptureModal(true)}
          >
            <Camera color="#ffffff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabButton} onPress={openAddModal}>
            <Plus color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X color="#666" size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add Item'}
            </Text>
            <TouchableOpacity onPress={handleSaveItem}>
              <Save color="#667eea" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Item Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter item name"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.pickerContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.slice(1).map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.pickerOption,
                          formData.category === category && styles.pickerOptionActive,
                        ]}
                        onPress={() => setFormData({ ...formData, category })}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.category === category && styles.pickerOptionTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Quantity</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.quantity.toString()}
                  onChangeText={(text) => setFormData({ ...formData, quantity: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Unit</Text>
                <View style={styles.pickerContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {units.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.pickerOption,
                          formData.unit === unit && styles.pickerOptionActive,
                        ]}
                        onPress={() => setFormData({ ...formData, unit })}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            formData.unit === unit && styles.pickerOptionTextActive,
                          ]}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Expiry Date (Optional)</Text>
              <TextInput
                style={styles.formInput}
                value={formData.expiryDate}
                onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Low Stock Threshold</Text>
              <TextInput
                style={styles.formInput}
                value={formData.lowStockThreshold.toString()}
                onChangeText={(text) => setFormData({ ...formData, lowStockThreshold: parseInt(text) || 1 })}
                keyboardType="numeric"
                placeholder="1"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Add any notes about this item"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Capture Inventory Modal */}
      <CaptureInventoryModal
        visible={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        onItemsDetected={handleItemsDetected}
        householdId={currentHousehold.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  signOutButton: {
    padding: 8,
  },
  alertsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  alertText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  realTimeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  itemsList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemImagePlaceholder: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  lowStockBadge: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  itemExpiry: {
    fontSize: 12,
    color: '#666',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    gap: 12,
  },
  fabButton: {
    width: 56,
    height: 56,
    backgroundColor: '#667eea',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButton: {
    backgroundColor: '#27ae60',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginTop: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  pickerOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  pickerOptionTextActive: {
    color: '#ffffff',
  },
});