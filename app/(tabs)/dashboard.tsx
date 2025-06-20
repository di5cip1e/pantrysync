import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [activeMetric, setActiveMetric] = useState('week');

  // Mock data - replace with real data from your services
  const dashboardData = {
    totalItems: 247,
    lowStockItems: 12,
    expiringItems: 8,
    completedTasks: 34,
    weeklyActivity: [65, 78, 82, 94, 88, 76, 89],
    monthlySpending: {
      groceries: 824.98,
      household: 245.67,
      dining: 156.32,
      other: 98.45
    },
    recentActivity: [
      { id: 1, user: 'Alex', action: 'Added Organic Milk', time: '2 min ago', type: 'add' },
      { id: 2, user: 'Sam', action: 'Completed grocery shopping', time: '1 hour ago', type: 'complete' },
      { id: 3, user: 'Jordan', action: 'Updated expiry dates', time: '3 hours ago', type: 'update' },
    ]
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, trend = 'up' }) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Icon color={color} size={20} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <View style={styles.metricChange}>
        <TrendingUp 
          color={trend === 'up' ? '#27ae60' : '#e74c3c'} 
          size={12}
          style={{ transform: trend === 'up' ? [] : [{ rotate: '180deg' }] }}
        />
        <Text style={[styles.changeText, { color: trend === 'up' ? '#27ae60' : '#e74c3c' }]}>
          {change}
        </Text>
      </View>
    </View>
  );

  const ActivityChart = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Weekly Activity</Text>
        <View style={styles.chartToggle}>
          {['week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.toggleButton,
                activeMetric === period && styles.toggleButtonActive
              ]}
              onPress={() => setActiveMetric(period)}
            >
              <Text style={[
                styles.toggleText,
                activeMetric === period && styles.toggleTextActive
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.chartContainer}>
        {dashboardData.weeklyActivity.map((value, index) => (
          <View key={index} style={styles.chartBar}>
            <View 
              style={[
                styles.barFill,
                { 
                  height: `${(value / 100) * 100}%`,
                  backgroundColor: index === 3 ? '#ff6b9d' : '#667eea'
                }
              ]} 
            />
            <Text style={styles.barLabel}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const SpendingBreakdown = () => (
    <View style={styles.spendingCard}>
      <Text style={styles.chartTitle}>Monthly Spending</Text>
      <View style={styles.spendingItems}>
        {Object.entries(dashboardData.monthlySpending).map(([category, amount], index) => {
          const colors = ['#ff6b9d', '#667eea', '#4ecdc4', '#45b7d1'];
          return (
            <View key={category} style={styles.spendingItem}>
              <View style={styles.spendingInfo}>
                <View style={[styles.spendingDot, { backgroundColor: colors[index] }]} />
                <Text style={styles.spendingCategory}>{category}</Text>
              </View>
              <Text style={styles.spendingAmount}>${amount}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const RecentActivity = () => (
    <View style={styles.activityCard}>
      <Text style={styles.chartTitle}>Recent Activity</Text>
      <View style={styles.activityList}>
        {dashboardData.recentActivity.map((activity) => {
          const getActivityIcon = () => {
            switch (activity.type) {
              case 'add': return <Package color="#27ae60" size={16} />;
              case 'complete': return <CheckCircle color="#667eea" size={16} />;
              case 'update': return <Clock color="#f39c12" size={16} />;
              default: return <Activity color="#666" size={16} />;
            }
          };

          return (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                {getActivityIcon()}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.activityUser}>{activity.user}</Text> {activity.action}
                </Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#ff6b9d', '#c44569', '#667eea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back, {user?.displayName?.split(' ')[0]}!</Text>
            <Text style={styles.headerSubtitle}>
              {currentHousehold?.name || 'Your household summary and activity'}
            </Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statBubble}>
              <Text style={styles.statNumber}>{dashboardData.totalItems}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Metrics Row */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="Total Items"
            value={dashboardData.totalItems}
            change="+12 this week"
            icon={Package}
            color="#667eea"
          />
          <MetricCard
            title="Low Stock"
            value={dashboardData.lowStockItems}
            change="-3 from last week"
            icon={AlertTriangle}
            color="#f39c12"
            trend="down"
          />
          <MetricCard
            title="Expiring Soon"
            value={dashboardData.expiringItems}
            change="+2 this week"
            icon={Calendar}
            color="#e74c3c"
          />
          <MetricCard
            title="Tasks Done"
            value={dashboardData.completedTasks}
            change="+8 this week"
            icon={CheckCircle}
            color="#27ae60"
          />
        </View>

        {/* Charts Row */}
        <View style={styles.chartsRow}>
          <ActivityChart />
          <SpendingBreakdown />
        </View>

        {/* Activity Feed */}
        <RecentActivity />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
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
  headerStats: {
    alignItems: 'center',
  },
  statBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginLeft: 8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chartCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginRight: 8,
  },
  spendingCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginLeft: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: '#0f0f23',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#667eea',
  },
  toggleText: {
    fontSize: 10,
    color: '#8e8e93',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 20,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barFill: {
    width: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#8e8e93',
    fontWeight: '500',
  },
  spendingItems: {
    marginTop: 16,
  },
  spendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  spendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  spendingCategory: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  spendingAmount: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  activityList: {
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f0f23',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 2,
  },
  activityUser: {
    fontWeight: '600',
    color: '#667eea',
  },
  activityTime: {
    fontSize: 12,
    color: '#8e8e93',
  },
  bottomPadding: {
    height: 40,
  },
});