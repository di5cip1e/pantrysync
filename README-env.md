# Environment Configuration Quick Reference

## Quick Start

### Switch Environment
```bash
# Development
npm run dev:development

# Staging  
npm run dev:staging

# Production
npm run dev:production
```

### Build for Environment
```bash
# Development build
npm run build:web:development

# Staging build
npm run build:web:staging  

# Production build
npm run build:web:production
```

### Validate Configuration
```bash
npm run validate:env
```

## Environment Variables Overview

### Required Variables
- `EXPO_PUBLIC_ENV` - Environment (development|staging|production|test)
- `EXPO_PUBLIC_APP_VERSION` - App version (semver format)
- `EXPO_PUBLIC_BUILD_NUMBER` - Build number (integer)

### Firebase Configuration
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

### Feature Flags
- `EXPO_PUBLIC_FEATURE_AI_INVENTORY` - Enable AI inventory features
- `EXPO_PUBLIC_FEATURE_ANALYTICS` - Enable analytics tracking
- `EXPO_PUBLIC_FEATURE_PUSH_NOTIFICATIONS` - Enable push notifications
- `EXPO_PUBLIC_FEATURE_OFFLINE_MODE` - Enable offline functionality
- `EXPO_PUBLIC_FEATURE_DEBUG_MODE` - Enable debug features

## Environment Files

- `.env.development` - Development configuration
- `.env.staging` - Staging configuration
- `.env.production` - Production configuration
- `.env.test` - Test configuration

## Deployment

### Web Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Mobile Deployment
```bash
# Build iOS
npm run build:ios

# Build Android
npm run build:android

# Build both
npm run build:mobile
```

## Configuration Access

```typescript
import { config, isFeatureEnabled } from '@/config';

// Check environment
if (config.env === 'production') {
  // Production-specific logic
}

// Check feature flags
if (isFeatureEnabled('analytics')) {
  // Analytics code
}

// Access limits
const maxItems = config.limits.maxItemsPerHousehold;
```

For detailed documentation, see `docs/environment-configuration.md`.