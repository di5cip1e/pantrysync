#!/bin/bash

# Environment configuration validation script
echo "🔍 Validating PantrySync environment configuration..."

# Check for required environment files
echo "📁 Checking environment files..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "❌ .env file missing"
    exit 1
fi

if [ -f ".env.production" ]; then
    echo "✅ .env.production file found"
else
    echo "❌ .env.production file missing"
    exit 1
fi

# Check for required configuration files
echo "⚙️  Checking configuration files..."
if [ -f "app.config.js" ]; then
    echo "✅ app.config.js found"
else
    echo "❌ app.config.js missing"
    exit 1
fi

if [ -f "eas.json" ]; then
    echo "✅ eas.json found"
else
    echo "❌ eas.json missing"
    exit 1
fi

# Check for deployment workflow
echo "🚀 Checking deployment workflow..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✅ GitHub Actions deployment workflow found"
else
    echo "❌ GitHub Actions deployment workflow missing"
    exit 1
fi

# Validate environment variables
echo "🔧 Validating environment variables..."
source .env

if [ -n "$EXPO_PUBLIC_DEPLOYED_AT" ]; then
    echo "✅ EXPO_PUBLIC_DEPLOYED_AT: $EXPO_PUBLIC_DEPLOYED_AT"
else
    echo "❌ EXPO_PUBLIC_DEPLOYED_AT not set"
    exit 1
fi

if [ -n "$EXPO_PUBLIC_FIREBASE_PROJECT_ID" ]; then
    echo "✅ EXPO_PUBLIC_FIREBASE_PROJECT_ID: $EXPO_PUBLIC_FIREBASE_PROJECT_ID"
else
    echo "❌ EXPO_PUBLIC_FIREBASE_PROJECT_ID not set"
    exit 1
fi

# Test Expo config
echo "📋 Testing Expo configuration..."
if npx expo config --json > /dev/null 2>&1; then
    echo "✅ Expo configuration is valid"
    
    # Extract deployed timestamp from config
    DEPLOYED_AT=$(npx expo config --json 2>/dev/null | grep -o '"deployedAt":"[^"]*"' | cut -d'"' -f4)
    if [ "$DEPLOYED_AT" = "2025-06-30 11:27:53" ]; then
        echo "✅ Deployed timestamp correctly configured: $DEPLOYED_AT"
    else
        echo "❌ Deployed timestamp mismatch. Expected: 2025-06-30 11:27:53, Got: $DEPLOYED_AT"
        exit 1
    fi
else
    echo "❌ Expo configuration is invalid"
    exit 1
fi

echo ""
echo "🎉 All environment configuration checks passed!"
echo "📦 Ready for deployment with timestamp: $(date '+%Y-%m-%d %H:%M:%S')"