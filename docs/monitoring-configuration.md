# Deployment Monitoring Configuration

## Overview
This configuration sets up comprehensive deployment monitoring and post-deployment validation for the PantrySync application.

## Components

### 1. Monitoring Services (`services/monitoring.ts`)
- **Deployment Monitoring**: Tracks build status, deployment metrics, and deployment history
- **Health Check Service**: Monitors application health across different services
- **Security Monitoring**: Records and tracks security events and suspicious activity
- **Performance Monitoring**: Collects and analyzes application performance metrics

### 2. GitHub Actions Workflow (`.github/workflows/deployment-monitoring.yml`)
- **Build Monitoring**: Tracks build duration, status, and artifacts
- **Deployment Validation**: Runs comprehensive post-deployment checks
- **Automated Health Checks**: Validates API endpoints, database connections, and security configurations
- **Notification System**: Reports deployment status and validation results

### 3. Validation Scripts
- **Post-deployment Validation** (`scripts/post-deployment-validation.js`): Node.js script for comprehensive validation
- **Health Check Script** (`scripts/health-check.sh`): Bash script for continuous health monitoring

### 4. React Components
- **Monitoring Dashboard** (`components/MonitoringDashboard.tsx`): Real-time monitoring interface
- **Security Monitoring Hook** (`hooks/useSecurityMonitoring.ts`): React hook for security event tracking
- **Performance Monitoring Hook** (`hooks/usePerformanceMonitoring.ts`): React hook for performance tracking

## Configuration

### Environment Variables
Set the following environment variables for proper monitoring:

```bash
# Deployment URL
DEPLOY_URL=https://your-app.web.app

# Monitoring intervals
HEALTH_CHECK_INTERVAL=300  # 5 minutes
ALERT_THRESHOLD=3          # Alert after 3 consecutive failures

# Build information (automatically set by CI/CD)
BUILD_ID=build-20240630-123456-abc12345
VERSION=1.0.0
```

### Firebase Security Rules
Add the following collections to your Firestore security rules:

```javascript
// Allow authenticated users to read/write monitoring data
match /deploymentMetrics/{document} {
  allow read, write: if request.auth != null;
}

match /healthChecks/{document} {
  allow read, write: if request.auth != null;
}

match /securityMetrics/{document} {
  allow read, write: if request.auth != null;
}

match /performanceMetrics/{document} {
  allow read, write: if request.auth != null;
}
```

## Usage

### Manual Health Check
Run a single health check:
```bash
npm run monitor:check
```

### Continuous Monitoring
Start continuous health monitoring:
```bash
npm run monitor:start
```

### Post-Deployment Validation
Validate deployment after deployment:
```bash
npm run validate-deployment
```

### Integration in React Components
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
  
  const handleLogin = async (credentials) => {
    try {
      const result = await signIn(credentials);
      await recordAuthAttempt(result.user.uid, true);
    } catch (error) {
      await recordAuthAttempt(null, false);
    }
  };
}
```

## Monitoring Metrics

### Deployment Metrics
- Build duration and status
- Deployment duration and status
- Version and build ID tracking
- Error and warning collection
- Performance metrics (bundle size, load time)

### Health Checks
- Firebase Auth connectivity
- Firestore database connectivity
- API endpoint availability
- Cache performance
- Response time monitoring

### Security Metrics
- Authentication attempts (successful/failed)
- API access patterns
- Rate limit violations
- Suspicious activity detection
- IP address and user agent tracking

### Performance Metrics
- Page load times
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Memory usage
- User interaction response times

## Alerting

### Alert Conditions
- **Critical**: Service down, deployment failure, security breach
- **Warning**: Performance degradation, repeated failed logins, rate limit hits
- **Info**: Successful deployments, normal health checks

### Alert Channels
Configure alerts to be sent to:
- Slack webhooks
- Email notifications
- Discord webhooks
- Microsoft Teams
- PagerDuty (for critical alerts)

### Example Alert Configuration
```bash
# In production, you would configure actual webhook URLs
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
EMAIL_ALERT_RECIPIENTS=admin@yourcompany.com,dev-team@yourcompany.com
PAGERDUTY_ROUTING_KEY=your-pagerduty-key
```

## Dashboard Access

### Monitoring Dashboard
Access the monitoring dashboard at:
- Development: `http://localhost:8081/monitoring`
- Production: `https://your-app.web.app/monitoring`

### Real-time Monitoring
The dashboard provides:
- Live deployment status
- Real-time health checks
- Performance metrics graphs
- Security event timeline
- System status overview

## Troubleshooting

### Common Issues

1. **Health checks failing**
   - Check Firebase configuration
   - Verify network connectivity
   - Ensure proper authentication

2. **Performance metrics not recording**
   - Check browser compatibility
   - Verify Firestore permissions
   - Ensure proper component mounting

3. **Security events not tracking**
   - Verify authentication flow integration
   - Check security service configuration
   - Ensure proper error handling

### Debugging

Enable debug logging:
```bash
DEBUG=monitoring:* npm run dev
```

View monitoring logs:
```bash
tail -f logs/health-check.log
```

## Best Practices

1. **Set appropriate thresholds**: Configure realistic performance and health thresholds
2. **Monitor regularly**: Set up automated monitoring rather than manual checks
3. **Act on alerts**: Ensure alerts are actionable and have clear escalation paths
4. **Review metrics**: Regularly review monitoring data to identify trends
5. **Update configurations**: Keep monitoring configurations up-to-date with application changes

## Security Considerations

1. **Sensitive data**: Ensure no sensitive information is logged in monitoring data
2. **Access control**: Restrict monitoring dashboard access to authorized personnel
3. **Data retention**: Implement appropriate data retention policies for monitoring data
4. **Encryption**: Ensure monitoring data is encrypted in transit and at rest
5. **Audit trails**: Maintain audit trails for monitoring system access and changes