import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Check, 
  X,
  User,
  Calendar
} from 'lucide-react-native';

interface ShoppingListLocal {
  id: string;
  name: string;
  items: ShoppingItemLocal[];
  createdAt: string;
}

interface ShoppingItemLocal {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
  assignedTo?: string;
  category: string;
}

export default function ShoppingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedList, setSelectedList] = useState('1');
  const [shoppingLists, setShoppingLists] = useState<ShoppingListLocal[]>([
    {
      id: '1',
      name: 'Weekly Groceries',
      createdAt: '2024-01-08',
      items: [
        {
          id: '1',
          name: 'Organic Milk',
          quantity: 2,
          unit: 'bottles',
          completed: false,
          assignedTo: 'Alex',
          category: 'Dairy',
        },
        {
          id: '2',
          name: 'Whole Wheat Bread',
          quantity: 1,
          unit: 'loaf',
          completed: true,
          assignedTo: 'Sam',
          category: 'Bakery',
        },
        {
          id: '3',
          name: 'Fresh Bananas',
          quantity: 6,
          unit: 'pieces',
          completed: false,
          category: 'Fruits',
        },
        {
          id: '4',
          name: 'Greek Yogurt',
          quantity: 4,
          unit: 'cups',
          completed: false,
          assignedTo: 'Alex',
          category: 'Dairy',
        },
      ],
    },
    {
      id: '2',
      name: 'Costco Trip',
      createdAt: '2024-01-07',
      items: [
        {
          id: '5',
          name: 'Paper Towels',
          quantity: 12,
          unit: 'rolls',
          completed: false,
          category: 'Household',
        },
        {
          id: '6',
          name: 'Chicken Breast',
          quantity: 2,
          unit: 'lbs',
          completed: true,
          assignedTo: 'Sam',
          category: 'Meat',
        },
      ],
    },
  ]);

  const currentList = shoppingLists.find(list => list.id === selectedList);
  const filteredItems = currentList?.items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const completedItems = filteredItems.filter(item => item.completed);
  const pendingItems = filteredItems.filter(item => !item.completed);

  const toggleItemComplete = (itemId: string) => {
    setShoppingLists(lists =>
      lists.map(list =>
        list.id === selectedList
          ? {
              ...list,
              items: list.items.map(item =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
            }
          : list
      )
    );
  };

  const deleteItem = (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setShoppingLists(lists =>
              lists.map(list =>
                list.id === selectedList
                  ? {
                      ...list,
                      items: list.items.filter(item => item.id !== itemId),
                    }
                  : list
              )
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Shopping Lists</Text>
        <Text style={styles.headerSubtitle}>
          {pendingItems.length} items remaining
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* List Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.listsContainer}
        >
          {shoppingLists.map((list) => (
            <TouchableOpacity
              key={list.id}
              style={[
                styles.listButton,
                selectedList === list.id && styles.listButtonActive,
              ]}
              onPress={() => setSelectedList(list.id)}
            >
              <Text
                style={[
                  styles.listButtonText,
                  selectedList === list.id && styles.listButtonTextActive,
                ]}
              >
                {list.name}
              </Text>
              <Text
                style={[
                  styles.listButtonSubtext,
                  selectedList === list.id && styles.listButtonSubtextActive,
                ]}
              >
                {list.items.length} items
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#666" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Shopping Items */}
        <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>To Buy ({pendingItems.length})</Text>
              {pendingItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => toggleItemComplete(item.id)}
                  >
                    <View style={styles.checkbox} />
                  </TouchableOpacity>
                  
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemQuantity}>
                        {item.quantity} {item.unit}
                      </Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    </View>
                    {item.assignedTo && (
                      <View style={styles.assignedContainer}>
                        <User color="#667eea" size={12} />
                        <Text style={styles.assignedText}>{item.assignedTo}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                  >
                    <X color="#e74c3c" size={20} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Completed ({completedItems.length})</Text>
              {completedItems.map((item) => (
                <View key={item.id} style={[styles.itemCard, styles.completedItemCard]}>
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => toggleItemComplete(item.id)}
                  >
                    <View style={[styles.checkbox, styles.checkboxCompleted]}>
                      <Check color="#ffffff" size={16} />
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, styles.completedItemName]}>
                      {item.name}
                    </Text>
                    <View style={styles.itemMeta}>
                      <Text style={[styles.itemQuantity, styles.completedText]}>
                        {item.quantity} {item.unit}
                      </Text>
                      <Text style={[styles.itemCategory, styles.completedText]}>
                        {item.category}
                      </Text>
                    </View>
                    {item.assignedTo && (
                      <View style={styles.assignedContainer}>
                        <User color="#999" size={12} />
                        <Text style={[styles.assignedText, styles.completedText]}>
                          {item.assignedTo}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                  >
                    <X color="#ccc" size={20} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  listsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    minWidth: 120,
  },
  listButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  listButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  listButtonTextActive: {
    color: '#ffffff',
  },
  listButtonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  listButtonSubtextActive: {
    color: '#ffffff',
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
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
  itemsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedItemCard: {
    opacity: 0.7,
  },
  checkButton: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#667eea',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedItemName: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedText: {
    color: '#999',
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assignedText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  bottomPadding: {
    height: 100,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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
});