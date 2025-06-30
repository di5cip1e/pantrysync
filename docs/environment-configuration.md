# Environment Configuration Guide

This document provides comprehensive guidance on configuring and deploying PantrySync across different environments.

## Overview

PantrySync supports four distinct environments:
- **Development**: Local development with debugging enabled
- **Staging**: Pre-production environment for testing
- **Production**: Live production environment
- **Test**: Automated testing environment

## Environment Variables

### Core Configuration

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Node.js environment | `development`, `staging`, `production`, `test` |
| `EXPO_PUBLIC_ENV` | ✅ | Expo environment | `development`, `staging`, `production`, `test` |

### Version Tracking

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_APP_VERSION` | ✅ | Application version (semver) | `1.0.0`, `1.2.3-beta` |
| `EXPO_PUBLIC_BUILD_NUMBER` | ✅ | Build number (integer) | `1`, `42` |
| `EXPO_PUBLIC_COMMIT_SHA` | ❌ | Git commit SHA | `abc1234`, `7f8a9b2c` |

### API Configuration

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | ✅ | Backend API URL | `https://api.pantrysync.com` |
| `EXPO_PUBLIC_API_KEY` | ❌ | API authentication key | `sk_prod_abc123...` |
| `EXPO_PUBLIC_API_TIMEOUT` | ❌ | API timeout in milliseconds | `10000` |

### Firebase Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` | ❌ | Google Analytics measurement ID |

### Feature Flags

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_FEATURE_AI_INVENTORY` | ❌ | Enable AI inventory features | `false` |
| `EXPO_PUBLIC_FEATURE_ANALYTICS` | ❌ | Enable analytics tracking | `true` |
| `EXPO_PUBLIC_FEATURE_PUSH_NOTIFICATIONS` | ❌ | Enable push notifications | `true` |
| `EXPO_PUBLIC_FEATURE_OFFLINE_MODE` | ❌ | Enable offline functionality | `false` |
| `EXPO_PUBLIC_FEATURE_DEBUG_MODE` | ❌ | Enable debug features | `false` |

### Analytics Configuration

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_ANALYTICS_ENABLED` | ❌ | Enable analytics | `true` |
| `EXPO_PUBLIC_ANALYTICS_TRACKING_ID` | ❌ | Analytics tracking ID | - |
| `EXPO_PUBLIC_ANALYTICS_SAMPLE_RATE` | ❌ | Analytics sample rate (0-1) | `1.0` |

### Cache Configuration

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_CACHE_ENABLED` | ❌ | Enable caching | `true` |
| `EXPO_PUBLIC_CACHE_TTL` | ❌ | Cache TTL in milliseconds | `300000` |
| `EXPO_PUBLIC_CACHE_MAX_SIZE` | ❌ | Max cache size in bytes | `52428800` |

### Error Reporting

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_ERROR_REPORTING_ENABLED` | ❌ | Enable error reporting | `true` |
| `EXPO_PUBLIC_SENTRY_DSN` | ❌ | Sentry DSN for error tracking | - |
| `EXPO_PUBLIC_ERROR_SAMPLE_RATE` | ❌ | Error sample rate (0-1) | `1.0` |

### User Limits

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_MAX_HOUSEHOLDS_PER_USER` | ❌ | Max households per user | `10` |
| `EXPO_PUBLIC_MAX_ITEMS_PER_HOUSEHOLD` | ❌ | Max items per household | `1000` |
| `EXPO_PUBLIC_MAX_MEMBERS_PER_HOUSEHOLD` | ❌ | Max members per household | `20` |
| `EXPO_PUBLIC_MAX_SHOPPING_LISTS` | ❌ | Max shopping lists | `10` |
| `EXPO_PUBLIC_MAX_FILE_UPLOAD_SIZE` | ❌ | Max file size in bytes | `5242880` |

### Security Configuration

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_SESSION_TIMEOUT` | ❌ | Session timeout in milliseconds | `3600000` |
| `EXPO_PUBLIC_MAX_LOGIN_ATTEMPTS` | ❌ | Max login attempts | `5` |
| `EXPO_PUBLIC_PASSWORD_MIN_LENGTH` | ❌ | Min password length | `6` |

### Development/Testing

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_DEBUG_LOGS` | ❌ | Enable debug logging | `false` |
| `EXPO_PUBLIC_MOCK_DATA` | ❌ | Use mock data | `false` |
| `EXPO_PUBLIC_TEST_MODE` | ❌ | Enable test mode | `false` |

## Environment Files

Environment-specific configuration files are provided:

- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment
- `.env.test` - Test environment

To use a specific environment:

```bash
# Development
npm run dev:development

# Staging
npm run dev:staging

# Production  
npm run dev:production
```

## Validation

Environment variables are automatically validated using the validation schema. To manually validate:

```bash
npm run validate:env
```

### Validation Rules

- **Format validation**: URL, email, number, boolean, enum, semver
- **Range validation**: Min/max values for numbers and strings
- **Pattern validation**: Regular expression matching
- **Required validation**: Ensures critical variables are set

## Deployment

### Web Deployment

Deploy to different environments:

```bash
# Staging
npm run deploy:staging

# Production
npm run deploy:production
```

### Mobile Deployment (EAS)

Build for different platforms:

```bash
# iOS
npm run build:ios

# Android
npm run build:android

# Both platforms
npm run build:mobile
```

Submit to app stores:

```bash
# iOS App Store
npm run submit:ios

# Google Play Store
npm run submit:android
```

### GitHub Actions

Automated deployment is configured through GitHub Actions:

- **Push to `develop`**: Deploys to development
- **Push to `main`**: Deploys to staging
- **Release creation**: Deploys to production

Required GitHub Secrets:

| Secret | Description |
|--------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_TOKEN` | Expo authentication token |

## Environment-Specific Configurations

### Development
- Debug mode enabled
- Mock data available
- Relaxed security settings
- Local API endpoints
- Enhanced logging

### Staging
- Production-like configuration
- All features enabled
- Full error reporting
- Staging Firebase project

### Production
- Optimized performance
- Minimal logging
- Strict security settings
- Production Firebase project
- Error reporting enabled

### Test
- Minimal features
- Mock data enabled
- Fast timeouts
- Test Firebase project
- No analytics/tracking

## Best Practices

1. **Never commit secrets**: Use environment variables for sensitive data
2. **Validate early**: Run validation before deployment
3. **Environment parity**: Keep environments as similar as possible
4. **Feature flags**: Use feature flags for gradual rollouts
5. **Monitor errors**: Enable error reporting in staging/production
6. **Cache strategy**: Configure appropriate cache settings per environment
7. **Security**: Use strong security settings in production

## Troubleshooting

### Common Issues

1. **Missing required variables**: Check validation output
2. **Invalid Firebase config**: Verify all Firebase variables are set
3. **Build failures**: Ensure environment file is loaded correctly
4. **Feature not working**: Check if feature flag is enabled

### Debug Commands

```bash
# Check current environment
npm run validate:env

# Type check
npm run type-check

# Lint code
npm run lint
```

For more detailed troubleshooting, enable debug logging:

```bash
EXPO_PUBLIC_DEBUG_LOGS=true npm run dev
```