import { useEffect, useState } from 'react';
import { securityMonitoringService, SecurityMetrics } from '@/services/monitoring';

interface SecurityMonitoringHook {
  recordAuthAttempt: (userId: string | null, success: boolean) => Promise<void>;
  recordAPIAccess: (userId: string, endpoint: string, success: boolean) => Promise<void>;
  recordRateLimitHit: (endpoint: string) => Promise<void>;
  getSecurityMetrics: (hoursBack?: number) => Promise<SecurityMetrics[]>;
  getSuspiciousActivity: () => Promise<SecurityMetrics[]>;
}

export function useSecurityMonitoring(): SecurityMonitoringHook {
  const [userAgent] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  );
  
  const [ipAddress, setIpAddress] = useState<string>('');

  // Get user's IP address (in a real app, you'd get this from your backend)
  useEffect(() => {
    // In a real implementation, you would get the IP from your backend
    // For now, we'll use a placeholder
    setIpAddress('127.0.0.1');
  }, []);

  const recordAuthAttempt = async (userId: string | null, success: boolean): Promise<void> => {
    try {
      await securityMonitoringService.recordAuthAttempt(
        userId,
        success,
        ipAddress,
        userAgent
      );
      
      // Log to console for debugging
      console.log(`🔐 Auth attempt recorded: ${success ? 'SUCCESS' : 'FAILED'}`, {
        userId: userId || 'anonymous',
        ipAddress,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to record auth attempt:', error);
    }
  };

  const recordAPIAccess = async (userId: string, endpoint: string, success: boolean): Promise<void> => {
    try {
      await securityMonitoringService.recordAPIAccess(
        userId,
        endpoint,
        success,
        ipAddress
      );
      
      console.log(`🔑 API access recorded: ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'}`, {
        userId,
        endpoint,
        ipAddress,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to record API access:', error);
    }
  };

  const recordRateLimitHit = async (endpoint: string): Promise<void> => {
    try {
      await securityMonitoringService.recordRateLimitHit(
        ipAddress,
        endpoint,
        userAgent
      );
      
      console.log(`🚫 Rate limit hit recorded: ${endpoint}`, {
        endpoint,
        ipAddress,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to record rate limit hit:', error);
    }
  };

  const getSecurityMetrics = async (hoursBack: number = 24): Promise<SecurityMetrics[]> => {
    try {
      return await securityMonitoringService.getSecurityMetrics(hoursBack);
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return [];
    }
  };

  const getSuspiciousActivity = async (): Promise<SecurityMetrics[]> => {
    try {
      return await securityMonitoringService.getSuspiciousActivity();
    } catch (error) {
      console.error('Failed to get suspicious activity:', error);
      return [];
    }
  };

  return {
    recordAuthAttempt,
    recordAPIAccess,
    recordRateLimitHit,
    getSecurityMetrics,
    getSuspiciousActivity
  };
}