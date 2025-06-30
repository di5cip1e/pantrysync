# Production Deployment Guide

## Overview

This guide outlines the production deployment process for PantrySync, including security validation, build metadata updates, and Firebase hosting deployment.

## Deployment Configuration

The deployment process uses the following configuration:

- **Timestamp**: 2025-06-30 11:29:55 UTC
- **User**: di5cip1e
- **Environment**: Production
- **Version**: 1.0.0
- **Build**: Initial Production Release

## Prerequisites

1. **Environment Setup**
   - Copy `.env.production.example` to `.env.production`
   - Fill in actual production values
   - Ensure Firebase CLI is installed and authenticated

2. **Access Requirements**
   - Deployment user must be `di5cip1e`
   - Firebase project access required
   - Git repository access for commit information

## Deployment Process

### Pre-deployment Check

Before starting deployment, run the pre-deployment check to validate your setup:

```bash
npm run pre-deploy:check
```

This will verify:
- Node.js version compatibility
- Package.json configuration
- Firebase configuration
- Deployment configuration
- Git repository status
- Environment configuration

### Quick Deployment

Run the complete production deployment workflow:

```bash
npm run deploy:production
```

This command will:
1. Initialize deployment configuration
2. Update build metadata with git information
3. Run security validation checks
4. Build the application for production
5. Deploy to Firebase hosting
6. Generate deployment summary

### Individual Steps

You can also run individual steps:

```bash
# Run pre-deployment checks
npm run pre-deploy:check

# Validate deployment security
npm run validate:deployment

# Update build metadata
npm run update:metadata

# Build for web
npm run build:web

# Deploy to Firebase (manual)
firebase deploy --only hosting
```

## Security Validation

The deployment process includes comprehensive security checks:

### Environment Variables
- Validates required Firebase configuration variables
- Checks API key formats and patterns
- Ensures no missing production variables

### API Keys
- Verifies Firebase configuration integrity
- Warns about hardcoded keys in production
- Validates key format compliance

### Access Permissions
- Confirms deployment user authorization
- Validates deployment configuration access
- Checks file system permissions

### Deployment Authorization
- Verifies production environment setting
- Validates deployment timestamp recency
- Confirms authorized deployment user

## Build Metadata

The deployment process tracks:

- **Version Information**: Package version and build number
- **Git Information**: Commit hash and branch name
- **Timestamps**: Build and deployment times
- **Environment**: Node.js version and platform details

## Files Created

The deployment process creates/updates:

- `config/deployment.json` - Main deployment configuration
- `build-info.json` - Build metadata (git-ignored)
- Security status updates in deployment config

## Troubleshooting

### Common Issues

1. **Security Validation Fails**
   - Check environment variables are set correctly
   - Verify Firebase configuration values
   - Ensure deployment user is authorized

2. **Build Fails**
   - Run `npm install` to ensure dependencies
   - Check for TypeScript errors
   - Verify Expo configuration

3. **Firebase Deployment Fails**
   - Ensure Firebase CLI is authenticated: `firebase login`
   - Check project configuration: `firebase projects:list`
   - Verify hosting configuration in `firebase.json`

### Environment Variables

Required production environment variables:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

## Monitoring

After deployment, monitor:

- Application availability at deployment URL
- Firebase console for any errors
- Build logs for performance metrics
- Security validation results

## Rollback

If rollback is needed:

1. Use Firebase console to rollback hosting
2. Update deployment status in `config/deployment.json`
3. Investigate and fix issues before redeploying

## Support

For deployment issues:
- Check deployment logs
- Review security validation output
- Verify Firebase project settings
- Contact system administrator if needed