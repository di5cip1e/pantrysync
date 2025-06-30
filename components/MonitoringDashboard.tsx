import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  deploymentMonitoringService, 
  healthCheckService, 
  securityMonitoringService,
  performanceMonitoringService,
  DeploymentMetrics,
  HealthCheck,
  SecurityMetrics
} from '@/services/monitoring';

interface MonitoringDashboardProps {
  visible?: boolean;
}

export default function MonitoringDashboard({ visible = false }: MonitoringDashboardProps) {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentMetrics | null>(null);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Load deployment status
      const currentDeployment = await deploymentMonitoringService.getCurrentDeploymentStatus();
      setDeploymentStatus(currentDeployment);
      
      // Load health status
      const healthStatus = await healthCheckService.getHealthStatus();
      setHealthChecks(healthStatus.services);
      
      // Load security metrics
      const securityData = await securityMonitoringService.getSecurityMetrics(24);
      setSecurityMetrics(securityData);
      
      // Load performance insights
      const perfData = await performanceMonitoringService.getPerformanceInsights(24);
      setPerformanceData(perfData);
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      Alert.alert('Error', 'Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMonitoringData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (visible) {
      loadMonitoringData();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(loadMonitoringData, 30000);
      return () => clearInterval(interval);
    }
  }, [visible]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return '#4CAF50';
      case 'degraded':
      case 'warning':
        return '#FF9800';
      case 'unhealthy':
      case 'failed':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return '✅';
      case 'degraded':
      case 'warning':
        return '⚠️';
      case 'unhealthy':
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Deployment Monitoring</Text>
        <Text style={styles.subtitle}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      </View>

      {/* Deployment Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Current Deployment</Text>
        {deploymentStatus ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(deploymentStatus.status) }]}>
                <Text style={styles.statusText}>
                  {getStatusIcon(deploymentStatus.status)} {deploymentStatus.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Version:</Text>
              <Text style={styles.value}>{deploymentStatus.version}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Build ID:</Text>
              <Text style={styles.value}>{deploymentStatus.buildId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Environment:</Text>
              <Text style={styles.value}>{deploymentStatus.environment}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Deployed:</Text>
              <Text style={styles.value}>
                {deploymentStatus.deployedAt?.toLocaleString() || 'Unknown'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noData}>No deployment data available</Text>
        )}
      </View>

      {/* Health Checks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏥 Health Checks</Text>
        {healthChecks.length > 0 ? (
          healthChecks.map((check, index) => (
            <View key={index} style={styles.healthCard}>
              <View style={styles.row}>
                <Text style={styles.serviceName}>{check.service}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(check.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusIcon(check.status)} {check.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Response Time:</Text>
                <Text style={styles.value}>{check.responseTime}ms</Text>
              </View>
              {check.error && (
                <View style={styles.row}>
                  <Text style={styles.label}>Error:</Text>
                  <Text style={[styles.value, styles.errorText]}>{check.error}</Text>
                </View>
              )}
              <Text style={styles.timestamp}>
                Checked: {check.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No health check data available</Text>
        )}
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Performance Metrics</Text>
        {performanceData ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Average Load Time:</Text>
              <Text style={styles.value}>{performanceData.averageLoadTime}ms</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>First Contentful Paint:</Text>
              <Text style={styles.value}>{performanceData.averageFirstContentfulPaint}ms</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Time to Interactive:</Text>
              <Text style={styles.value}>{performanceData.averageTimeToInteractive}ms</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Samples:</Text>
              <Text style={styles.value}>{performanceData.totalSamples}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noData}>No performance data available</Text>
        )}
      </View>

      {/* Security Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Security Metrics (24h)</Text>
        {securityMetrics.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Total Events:</Text>
              <Text style={styles.value}>{securityMetrics.length}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Auth Attempts:</Text>
              <Text style={styles.value}>
                {securityMetrics.filter(m => m.event === 'auth_attempt').length}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Failed Logins:</Text>
              <Text style={styles.value}>
                {securityMetrics.filter(m => m.event === 'auth_attempt' && !m.success).length}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Rate Limit Hits:</Text>
              <Text style={styles.value}>
                {securityMetrics.filter(m => m.event === 'rate_limit_hit').length}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noData}>No security metrics available</Text>
        )}
      </View>

      {/* System Status Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 System Status Summary</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Overall Status:</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(
                healthChecks.every(h => h.status === 'healthy') ? 'healthy' : 
                healthChecks.some(h => h.status === 'unhealthy') ? 'unhealthy' : 'degraded'
              )}
            ]}>
              <Text style={styles.statusText}>
                {healthChecks.every(h => h.status === 'healthy') ? '✅ HEALTHY' : 
                 healthChecks.some(h => h.status === 'unhealthy') ? '❌ UNHEALTHY' : '⚠️ DEGRADED'}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Services Monitored:</Text>
            <Text style={styles.value}>{healthChecks.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Healthy Services:</Text>
            <Text style={styles.value}>
              {healthChecks.filter(h => h.status === 'healthy').length}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  errorText: {
    color: '#F44336',
    flex: 1,
    textAlign: 'right',
  },
  noData: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});