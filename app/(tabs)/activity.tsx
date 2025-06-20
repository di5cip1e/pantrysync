import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Activity as ActivityIcon, 
  Package, 
  ShoppingCart, 
  UserPlus, 
  UserMinus,
  Plus,
  Minus,
  Check,
  Filter
} from 'lucide-react-native';

interface ActivityItemLocal {
  id: string;
  type: 'pantry_add' | 'pantry_remove' | 'pantry_update' | 'shopping_add' | 'shopping_complete' | 'member_join' | 'member_leave';
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  timestamp: string;
  metadata?: {
    itemName?: string;
    quantity?: number;
    listName?: string;
  };
}

export default function ActivityScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [activities, setActivities] = useState<ActivityItemLocal[]>([
    {
      id: '1',
      type: 'pantry_add',
      userId: '1',
      userName: 'Alex Johnson',
      userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      description: 'Added 2 bottles of Organic Milk to pantry',
      timestamp: '2024-01-08T10:30:00Z',
      metadata: {
        itemName: 'Organic Milk',
        quantity: 2,
      },
    },
    {
      id: '2',
      type: 'shopping_complete',
      userId: '2',
      userName: 'Sam Wilson',
      userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      description: 'Completed "Whole Wheat Bread" from Weekly Groceries',
      timestamp: '2024-01-08T09:15:00Z',
      metadata: {
        itemName: 'Whole Wheat Bread',
        listName: 'Weekly Groceries',
      },
    },
    {
      id: '3',
      type: 'shopping_add',
      userId: '1',
      userName: 'Alex Johnson',
      userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      description: 'Added "Greek Yogurt" to Weekly Groceries',
      timestamp: '2024-01-08T08:45:00Z',
      metadata: {
        itemName: 'Greek Yogurt',
        listName: 'Weekly Groceries',
      },
    },
    {
      id: '4',
      type: 'pantry_remove',
      userId: '3',
      userName: 'Jordan Smith',
      description: 'Used 1 loaf of Whole Wheat Bread from pantry',
      timestamp: '2024-01-07T19:20:00Z',
      metadata: {
        itemName: 'Whole Wheat Bread',
        quantity: 1,
      },
    },
    {
      id: '5',
      type: 'member_join',
      userId: '3',
      userName: 'Jordan Smith',
      description: 'Joined the household',
      timestamp: '2024-01-05T14:30:00Z',
    },
    {
      id: '6',
      type: 'pantry_update',
      userId: '2',
      userName: 'Sam Wilson',
      userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      description: 'Updated expiry date for Fresh Bananas',
      timestamp: '2024-01-05T11:15:00Z',
      metadata: {
        itemName: 'Fresh Bananas',
      },
    },
  ]);

  const filters = ['All', 'Pantry', 'Shopping', 'Members'];

  const getActivityIcon = (type: ActivityItemLocal['type']) => {
    switch (type) {
      case 'pantry_add':
        return <Plus color="#27ae60" size={16} />;
      case 'pantry_remove':
        return <Minus color="#e74c3c" size={16} />;
      case 'pantry_update':
        return <Package color="#f39c12" size={16} />;
      case 'shopping_add':
        return <Plus color="#3498db" size={16} />;
      case 'shopping_complete':
        return <Check color="#27ae60" size={16} />;
      case 'member_join':
        return <UserPlus color="#9b59b6" size={16} />;
      case 'member_leave':
        return <UserMinus color="#e74c3c" size={16} />;
      default:
        return <ActivityIcon color="#666" size={16} />;
    }
  };

  const getActivityColor = (type: ActivityItemLocal['type']) => {
    switch (type) {
      case 'pantry_add':
        return '#27ae60';
      case 'pantry_remove':
        return '#e74c3c';
      case 'pantry_update':
        return '#f39c12';
      case 'shopping_add':
        return '#3498db';
      case 'shopping_complete':
        return '#27ae60';
      case 'member_join':
        return '#9b59b6';
      case 'member_leave':
        return '#e74c3c';
      default:
        return '#666';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Pantry') {
      return ['pantry_add', 'pantry_remove', 'pantry_update'].includes(activity.type);
    }
    if (selectedFilter === 'Shopping') {
      return ['shopping_add', 'shopping_complete'].includes(activity.type);
    }
    if (selectedFilter === 'Members') {
      return ['member_join', 'member_leave'].includes(activity.type);
    }
    return true;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const groupActivitiesByDate = (activities: ActivityItemLocal[]) => {
    const groups: { [key: string]: ActivityItemLocal[] } = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString();
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });
    
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(filteredActivities);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Activity Feed</Text>
        <Text style={styles.headerSubtitle}>
          Stay updated with household changes
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activity List */}
        <ScrollView style={styles.activitiesList} showsVerticalScrollIndicator={false}>
          {Object.entries(groupedActivities).map(([dateGroup, activities]) => (
            <View key={dateGroup} style={styles.dateGroup}>
              <Text style={styles.dateGroupTitle}>{dateGroup}</Text>
              {activities.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityLeft}>
                    <View style={styles.avatarContainer}>
                      {activity.userAvatar ? (
                        <Image source={{ uri: activity.userAvatar }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {activity.userName.split(' ').map(n => n[0]).join('')}
                          </Text>
                        </View>
                      )}
                      <View 
                        style={[
                          styles.activityIconBadge,
                          { backgroundColor: getActivityColor(activity.type) }
                        ]}
                      >
                        {getActivityIcon(activity.type)}
                      </View>
                    </View>
                    {index < activities.length - 1 && <View style={styles.timeline} />}
                  </View>
                  
                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityUser}>{activity.userName}</Text>
                      <Text style={styles.activityTime}>
                        {formatTimestamp(activity.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    {activity.metadata && (
                      <View style={styles.activityMeta}>
                        {activity.metadata.itemName && (
                          <View style={styles.metaTag}>
                            <Text style={styles.metaText}>{activity.metadata.itemName}</Text>
                          </View>
                        )}
                        {activity.metadata.listName && (
                          <View style={styles.metaTag}>
                            <Text style={styles.metaText}>{activity.metadata.listName}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
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
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  activitiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginLeft: 60,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activityIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  timeline: {
    width: 2,
    flex: 1,
    backgroundColor: '#e1e1e1',
    marginTop: 8,
  },
  activityContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});