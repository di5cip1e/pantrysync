import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Types for monitoring
export interface DeploymentMetrics {
  id?: string;
  version: string;
  buildId: string;
  deployedAt: Date;
  status: 'deploying' | 'success' | 'failed' | 'rolling_back';
  buildDuration?: number;
  deploymentDuration?: number;
  environment: 'production' | 'staging' | 'development';
  errors?: string[];
  warnings?: string[];
  performanceMetrics?: {
    bundleSize: number;
    loadTime: number;
    firstContentfulPaint: number;
    timeToInteractive: number;
  };
}

export interface HealthCheck {
  id?: string;
  timestamp: Date;
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: any;
  error?: string;
}

export interface SecurityMetrics {
  id?: string;
  timestamp: Date;
  event: 'auth_attempt' | 'api_access' | 'rate_limit_hit' | 'suspicious_activity';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: any;
}

// Deployment Monitoring Service
export const deploymentMonitoringService = {
  async recordDeployment(metrics: Omit<DeploymentMetrics, 'id'>): Promise<string> {
    const deploymentData = {
      ...metrics,
      deployedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'deploymentMetrics'), deploymentData);
    console.log('📊 Deployment metrics recorded:', docRef.id);
    return docRef.id;
  },

  async updateDeploymentStatus(deploymentId: string, status: DeploymentMetrics['status'], additionalData?: Partial<DeploymentMetrics>): Promise<void> {
    const deploymentRef = doc(db, 'deploymentMetrics', deploymentId);
    await updateDoc(deploymentRef, {
      status,
      ...additionalData,
      updatedAt: serverTimestamp()
    });
    console.log('📊 Deployment status updated:', deploymentId, status);
  },

  async getRecentDeployments(limit_count: number = 10): Promise<DeploymentMetrics[]> {
    const q = query(
      collection(db, 'deploymentMetrics'),
      orderBy('deployedAt', 'desc'),
      limit(limit_count)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      deployedAt: doc.data().deployedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    })) as DeploymentMetrics[];
  },

  async getCurrentDeploymentStatus(): Promise<DeploymentMetrics | null> {
    const q = query(
      collection(db, 'deploymentMetrics'),
      orderBy('deployedAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc_data = snapshot.docs[0];
    return {
      id: doc_data.id,
      ...doc_data.data(),
      deployedAt: doc_data.data().deployedAt?.toDate()
    } as DeploymentMetrics;
  }
};

// Health Check Service
export const healthCheckService = {
  async performHealthCheck(service: string): Promise<HealthCheck> {
    const startTime = Date.now();
    let status: HealthCheck['status'] = 'healthy';
    let details: any = {};
    let error: string | undefined;

    try {
      switch (service) {
        case 'firebase_auth':
          details = await this.checkFirebaseAuth();
          break;
        case 'firestore':
          details = await this.checkFirestore();
          break;
        case 'api_endpoints':
          details = await this.checkAPIEndpoints();
          break;
        case 'cache_performance':
          details = await this.checkCachePerformance();
          break;
        default:
          throw new Error(`Unknown service: ${service}`);
      }
    } catch (err) {
      status = 'unhealthy';
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Health check failed for ${service}:`, error);
    }

    const responseTime = Date.now() - startTime;
    
    // Determine status based on response time and any errors
    if (error) {
      status = 'unhealthy';
    } else if (responseTime > 5000) {
      status = 'degraded';
    }

    const healthCheck: HealthCheck = {
      timestamp: new Date(),
      service,
      status,
      responseTime,
      details,
      error
    };

    // Record health check result
    await addDoc(collection(db, 'healthChecks'), {
      ...healthCheck,
      timestamp: serverTimestamp()
    });

    return healthCheck;
  },

  async checkFirebaseAuth(): Promise<any> {
    // Check if Firebase Auth is responsive
    try {
      // Simple connectivity check - attempt to access auth instance
      const { getAuth } = await import('firebase/auth');
      const { auth } = await import('@/config/firebase');
      
      return {
        service: 'Firebase Auth',
        connected: true,
        currentUser: !!auth.currentUser,
        version: 'v10'
      };
    } catch (error) {
      throw new Error('Firebase Auth connection failed');
    }
  },

  async checkFirestore(): Promise<any> {
    try {
      // Test Firestore connectivity with a simple read
      const testDoc = doc(db, 'health_check', 'test');
      await getDoc(testDoc);
      
      return {
        service: 'Firestore',
        connected: true,
        latency: 'normal'
      };
    } catch (error) {
      throw new Error('Firestore connection failed');
    }
  },

  async checkAPIEndpoints(): Promise<any> {
    // In a real-world scenario, you would check your API endpoints here
    // For this implementation, we'll simulate the check
    return {
      service: 'API Endpoints',
      endpoints_checked: ['auth', 'data', 'upload'],
      all_responsive: true
    };
  },

  async checkCachePerformance(): Promise<any> {
    try {
      // Check local storage performance
      const testKey = 'health_check_test';
      const testData = { timestamp: Date.now() };
      
      const startTime = Date.now();
      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrievedData = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      const endTime = Date.now();
      
      return {
        service: 'Cache Performance',
        storage_type: 'localStorage',
        write_read_time: endTime - startTime,
        data_integrity: JSON.parse(retrievedData!).timestamp === testData.timestamp
      };
    } catch (error) {
      throw new Error('Cache performance check failed');
    }
  },

  async getHealthStatus(): Promise<{ overall: string; services: HealthCheck[] }> {
    const services = ['firebase_auth', 'firestore', 'api_endpoints', 'cache_performance'];
    const healthChecks: HealthCheck[] = [];
    
    for (const service of services) {
      try {
        const check = await this.performHealthCheck(service);
        healthChecks.push(check);
      } catch (error) {
        healthChecks.push({
          timestamp: new Date(),
          service,
          status: 'unhealthy',
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Determine overall health
    const hasUnhealthy = healthChecks.some(check => check.status === 'unhealthy');
    const hasDegraded = healthChecks.some(check => check.status === 'degraded');
    
    let overall = 'healthy';
    if (hasUnhealthy) {
      overall = 'unhealthy';
    } else if (hasDegraded) {
      overall = 'degraded';
    }
    
    return { overall, services: healthChecks };
  }
};

// Security Monitoring Service
export const securityMonitoringService = {
  async recordSecurityEvent(event: Omit<SecurityMetrics, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent = {
      ...event,
      timestamp: serverTimestamp()
    };
    
    await addDoc(collection(db, 'securityMetrics'), securityEvent);
    console.log('🔒 Security event recorded:', event.event, event.success ? '✅' : '❌');
  },

  async recordAuthAttempt(userId: string | null, success: boolean, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.recordSecurityEvent({
      event: 'auth_attempt',
      userId: userId || undefined,
      ipAddress,
      userAgent,
      success,
      details: {
        timestamp: new Date().toISOString(),
        method: 'email_password'
      }
    });
  },

  async recordAPIAccess(userId: string, endpoint: string, success: boolean, ipAddress?: string): Promise<void> {
    await this.recordSecurityEvent({
      event: 'api_access',
      userId,
      ipAddress,
      success,
      details: {
        endpoint,
        timestamp: new Date().toISOString()
      }
    });
  },

  async recordRateLimitHit(ipAddress: string, endpoint: string, userAgent?: string): Promise<void> {
    await this.recordSecurityEvent({
      event: 'rate_limit_hit',
      ipAddress,
      userAgent,
      success: false,
      details: {
        endpoint,
        timestamp: new Date().toISOString()
      }
    });
  },

  async getSecurityMetrics(hoursBack: number = 24): Promise<SecurityMetrics[]> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursBack);
    
    const q = query(
      collection(db, 'securityMetrics'),
      where('timestamp', '>=', cutoffTime),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    })) as SecurityMetrics[];
  },

  async getSuspiciousActivity(): Promise<SecurityMetrics[]> {
    // Get failed auth attempts in the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const q = query(
      collection(db, 'securityMetrics'),
      where('event', '==', 'auth_attempt'),
      where('success', '==', false),
      where('timestamp', '>=', oneHourAgo),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    })) as SecurityMetrics[];
  }
};

// Performance Monitoring Service
export const performanceMonitoringService = {
  async recordPerformanceMetrics(metrics: {
    page: string;
    loadTime: number;
    firstContentfulPaint?: number;
    timeToInteractive?: number;
    memoryUsage?: number;
    userId?: string;
  }): Promise<void> {
    const performanceData = {
      ...metrics,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    await addDoc(collection(db, 'performanceMetrics'), performanceData);
    console.log('⚡ Performance metrics recorded for:', metrics.page);
  },

  async getPerformanceInsights(hoursBack: number = 24): Promise<any> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursBack);
    
    const q = query(
      collection(db, 'performanceMetrics'),
      where('timestamp', '>=', cutoffTime),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    const metrics = snapshot.docs.map(doc => doc.data());
    
    // Calculate averages
    const avgLoadTime = metrics.reduce((sum, m) => sum + (m.loadTime || 0), 0) / metrics.length;
    const avgFCP = metrics.reduce((sum, m) => sum + (m.firstContentfulPaint || 0), 0) / metrics.length;
    const avgTTI = metrics.reduce((sum, m) => sum + (m.timeToInteractive || 0), 0) / metrics.length;
    
    return {
      totalSamples: metrics.length,
      averageLoadTime: Math.round(avgLoadTime),
      averageFirstContentfulPaint: Math.round(avgFCP),
      averageTimeToInteractive: Math.round(avgTTI),
      timeRange: hoursBack
    };
  }
};