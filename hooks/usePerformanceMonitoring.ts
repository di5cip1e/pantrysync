import { useEffect, useState } from 'react';
import { performanceMonitoringService } from '@/services/monitoring';

interface PerformanceMonitoringHook {
  recordPageLoad: (page: string, loadTime: number, additionalMetrics?: any) => Promise<void>;
  recordUserInteraction: (action: string, duration: number, page: string) => Promise<void>;
  getPerformanceInsights: (hoursBack?: number) => Promise<any>;
  startPageLoadTimer: (page: string) => () => void;
}

export function usePerformanceMonitoring(): PerformanceMonitoringHook {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // In a real app, you would get this from your auth context
    // For now, we'll use a placeholder or get from localStorage
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId || 'anonymous');
  }, []);

  const recordPageLoad = async (
    page: string, 
    loadTime: number, 
    additionalMetrics?: any
  ): Promise<void> => {
    try {
      const performanceMetrics = {
        page,
        loadTime,
        userId: userId || undefined,
        ...additionalMetrics
      };

      await performanceMonitoringService.recordPerformanceMetrics(performanceMetrics);
      
      console.log(`⚡ Page load recorded: ${page} (${loadTime}ms)`, performanceMetrics);
      
    } catch (error) {
      console.error('Failed to record page load metrics:', error);
    }
  };

  const recordUserInteraction = async (
    action: string, 
    duration: number, 
    page: string
  ): Promise<void> => {
    try {
      const interactionMetrics = {
        page: `${page}_interaction`,
        loadTime: duration,
        userId: userId || undefined,
        interactionType: action,
        timestamp: new Date().toISOString()
      };

      await performanceMonitoringService.recordPerformanceMetrics(interactionMetrics);
      
      console.log(`👆 User interaction recorded: ${action} on ${page} (${duration}ms)`);
      
    } catch (error) {
      console.error('Failed to record user interaction metrics:', error);
    }
  };

  const getPerformanceInsights = async (hoursBack: number = 24): Promise<any> => {
    try {
      return await performanceMonitoringService.getPerformanceInsights(hoursBack);
    } catch (error) {
      console.error('Failed to get performance insights:', error);
      return null;
    }
  };

  const startPageLoadTimer = (page: string): (() => void) => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      
      // Record basic performance metrics
      const performanceMetrics = {
        firstContentfulPaint: 0,
        timeToInteractive: 0,
        memoryUsage: 0
      };

      // Try to get more detailed performance metrics if available
      if (typeof window !== 'undefined' && window.performance) {
        try {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            performanceMetrics.firstContentfulPaint = navigation.loadEventEnd - navigation.loadEventStart;
            performanceMetrics.timeToInteractive = navigation.domInteractive - navigation.navigationStart;
          }

          // Memory usage (if available)
          if ('memory' in performance) {
            const memory = (performance as any).memory;
            performanceMetrics.memoryUsage = memory.usedJSHeapSize || 0;
          }
        } catch (error) {
          console.warn('Could not get detailed performance metrics:', error);
        }
      }

      recordPageLoad(page, Math.round(loadTime), performanceMetrics);
    };
  };

  return {
    recordPageLoad,
    recordUserInteraction,
    getPerformanceInsights,
    startPageLoadTimer
  };
}

// Higher-order component for automatic page load tracking
export function withPerformanceMonitoring<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  pageName: string
) {
  return function PerformanceMonitoredComponent(props: T) {
    const { startPageLoadTimer } = usePerformanceMonitoring();
    
    useEffect(() => {
      const endTimer = startPageLoadTimer(pageName);
      
      // End the timer when component mounts (page is loaded)
      const timeoutId = setTimeout(endTimer, 0);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }, []);

    return <Component {...props} />;
  };
}