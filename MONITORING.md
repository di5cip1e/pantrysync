# Deployment Monitoring & Validation

## 🔍 Overview

This project includes a comprehensive deployment monitoring and post-deployment validation system that provides:

- **Real-time Build Status Monitoring**
- **Error Tracking and Performance Metrics**
- **User Impact Monitoring**
- **Automated Health Checks**
- **Security Event Monitoring**
- **Performance Analytics**

## 🚀 Quick Start

### Run Health Check
```bash
npm run monitor:check
```

### Start Continuous Monitoring
```bash
npm run monitor:start
```

### Validate Deployment
```bash
npm run validate-deployment
```

### Test Monitoring System
```bash
npm run test:monitoring
```

## 📊 Features

### ✅ Deployment Monitoring
- Build duration and status tracking
- Version and environment monitoring
- Error and warning collection
- Deployment history and rollback tracking

### 🏥 Health Checks
- Firebase Auth connectivity
- Firestore database status
- API endpoint availability
- Cache performance validation
- Real-time response time monitoring

### 🔒 Security Monitoring
- Authentication attempt tracking
- API access pattern analysis
- Rate limit violation detection
- Suspicious activity alerting
- IP and user agent logging

### ⚡ Performance Metrics
- Page load time monitoring
- First Contentful Paint (FCP) tracking
- Time to Interactive (TTI) measurement
- Memory usage analysis
- User interaction response times

## 🛠 Components

### Services (`services/monitoring.ts`)
- `deploymentMonitoringService`: Track deployments and build status
- `healthCheckService`: Monitor application health
- `securityMonitoringService`: Track security events
- `performanceMonitoringService`: Collect performance data

### React Hooks
- `useSecurityMonitoring`: Hook for security event tracking
- `usePerformanceMonitoring`: Hook for performance monitoring

### Components
- `MonitoringDashboard`: Real-time monitoring interface

### Scripts
- `scripts/post-deployment-validation.js`: Comprehensive deployment validation
- `scripts/health-check.sh`: Continuous health monitoring

## 🔧 Configuration

### Environment Variables
```bash
DEPLOY_URL=https://your-app.web.app
HEALTH_CHECK_INTERVAL=300
ALERT_THRESHOLD=3
```

### Usage in React Components
```tsx
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

function MyComponent() {
  const { recordAuthAttempt } = useSecurityMonitoring();
  const { startPageLoadTimer } = usePerformanceMonitoring();
  
  useEffect(() => {
    const endTimer = startPageLoadTimer('my-page');
    return endTimer;
  }, []);
}
```

## 🚨 Alerting

The system supports alerts for:
- **Critical**: Service outages, deployment failures
- **Warning**: Performance degradation, security events
- **Info**: Successful deployments, normal operations

## 📈 GitHub Actions Integration

The monitoring system integrates with GitHub Actions to provide:
- Automated deployment validation
- Real-time build status reporting
- Post-deployment health verification
- Performance and security validation

## 📚 Documentation

For detailed configuration and usage instructions, see:
- [Monitoring Configuration Guide](docs/monitoring-configuration.md)

## 🧪 Testing

Run integration tests to verify the monitoring system:
```bash
npm run test:monitoring
```

This ensures all components are properly configured and ready for use.

---

*Part of PantrySync - A modern household pantry management app*