# Environment Configuration and Deployment

This document outlines the environment configuration and deployment setup for PantrySync.

## Environment Variables

The application uses environment variables for configuration. These are defined in `.env` files and loaded via dotenv.

### Required Environment Variables

- `EXPO_PUBLIC_DEPLOYED_AT` - Deployment timestamp (format: "YYYY-MM-DD HH:MM:SS")
- `EXPO_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `EXPO_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID
- `EXPO_PUBLIC_API_URL` - API base URL
- `EXPO_PUBLIC_API_KEY` - API key

## Environment Files

- `.env` - Development environment variables
- `.env.production` - Production environment variables

## Configuration Files

- `app.config.js` - Expo configuration (replaces app.json)
- `eas.json` - EAS Build configuration
- `firebase.json` - Firebase hosting configuration

## Deployment

### Web Deployment (Firebase Hosting)

```bash
npm run deploy
```

This will:
1. Validate environment configuration
2. Build the web app
3. Deploy to Firebase Hosting

### Mobile Deployment (EAS)

```bash
npx eas build --platform all
```

### GitHub Actions

The project includes automated deployment via GitHub Actions:
- Triggers on push to main branch
- Builds web app and deploys to Firebase
- Builds mobile apps via EAS
- Includes security validation

### Required Secrets

Set these in GitHub repository secrets:
- `FIREBASE_TOKEN` - Firebase deployment token
- `EXPO_TOKEN` - Expo authentication token
- `EXPO_PUBLIC_API_KEY` - Production API key

## Validation

Validate environment configuration:

```bash
npm run validate-env
```

This checks:
- Environment files exist
- Configuration files are valid
- Environment variables are set correctly
- Expo configuration is valid

## Build Metadata

The app includes build metadata accessible via:
- `Constants.expoConfig.extra.deployedAt` - Deployment timestamp
- `Constants.expoConfig.extra.buildNumber` - Build number

## Security

- Environment variables are validated before deployment
- Sensitive data is stored in GitHub secrets
- Access controls are enforced in GitHub Actions
- Firebase rules protect data access

## Troubleshooting

### Build Issues

If you encounter Node.js module resolution issues:
1. Clear build cache: `npx expo export --clear`
2. Check environment variable format
3. Ensure all required dependencies are installed

### Environment Issues

Run validation script to identify configuration problems:
```bash
npm run validate-env
```

### Deployment Issues

1. Verify Firebase token is valid
2. Check GitHub secrets are set
3. Ensure branch permissions are correct