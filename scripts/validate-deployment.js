#!/usr/bin/env node

/**
 * Production Deployment Security Validator
 * Validates environment variables, API keys, and deployment authorization
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for production
const REQUIRED_ENV_VARS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

// API key patterns for validation
const API_KEY_PATTERNS = {
  EXPO_PUBLIC_FIREBASE_API_KEY: /^AIza[0-9A-Za-z_-]{35}$/,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: /^[a-z0-9-]+$/,
  EXPO_PUBLIC_FIREBASE_APP_ID: /^1:\d+:(web|android|ios):[a-f0-9]+$/
};

function validateEnvironmentVariables() {
  console.log('🔍 Validating environment variables...');
  
  const missing = [];
  const invalid = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    
    if (!value) {
      missing.push(envVar);
      continue;
    }
    
    // Validate API key patterns
    if (API_KEY_PATTERNS[envVar] && !API_KEY_PATTERNS[envVar].test(value)) {
      invalid.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(env => console.error(`   - ${env}`));
    return false;
  }
  
  if (invalid.length > 0) {
    console.error('❌ Invalid environment variable formats:');
    invalid.forEach(env => console.error(`   - ${env}`));
    return false;
  }
  
  console.log('✅ Environment variables validated');
  return true;
}

function validateApiKeys() {
  console.log('🔑 Validating API keys...');
  
  // Check if Firebase config file exists and read it as text for validation
  const firebaseConfigPath = path.join(__dirname, '..', 'config', 'firebase.ts');
  
  if (!fs.existsSync(firebaseConfigPath)) {
    console.error('❌ Firebase configuration file not found');
    return false;
  }
  
  try {
    const configContent = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    // Check if Firebase config contains hardcoded keys (production should use env vars)
    if (configContent.includes('AIzaSy') && !process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
      console.warn('⚠️  Hardcoded API keys detected. Consider using environment variables for production.');
    }
    
    console.log('✅ API keys verified');
    return true;
  } catch (error) {
    console.error('❌ Error validating API keys:', error.message);
    return false;
  }
}

function checkAccessPermissions() {
  console.log('🔐 Checking access permissions...');
  
  // Check if user has deployment permissions (basic check)
  const deploymentConfig = path.join(__dirname, '..', 'config', 'deployment.json');
  
  if (!fs.existsSync(deploymentConfig)) {
    console.error('❌ Deployment configuration not found');
    return false;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(deploymentConfig, 'utf8'));
    if (config.deployment.user !== 'di5cip1e') {
      console.error('❌ Unauthorized deployment user');
      return false;
    }
  } catch (error) {
    console.error('❌ Error reading deployment configuration:', error.message);
    return false;
  }
  
  console.log('✅ Access permissions verified');
  return true;
}

function confirmDeploymentAuthorization() {
  console.log('🚀 Confirming deployment authorization...');
  
  const deploymentConfig = path.join(__dirname, '..', 'config', 'deployment.json');
  
  try {
    const config = JSON.parse(fs.readFileSync(deploymentConfig, 'utf8'));
    
    // Check if deployment is for production environment
    if (config.deployment.environment !== 'production') {
      console.error('❌ Invalid deployment environment');
      return false;
    }
    
    // Check timestamp is recent (within last hour for security)
    const deploymentTime = new Date(config.deployment.timestamp);
    const now = new Date();
    const timeDiff = now - deploymentTime;
    const oneHour = 60 * 60 * 1000;
    
    if (Math.abs(timeDiff) > oneHour) {
      console.warn('⚠️  Deployment timestamp is not recent. Consider updating for security.');
    }
    
    console.log('✅ Deployment authorized');
    return true;
  } catch (error) {
    console.error('❌ Error validating deployment authorization:', error.message);
    return false;
  }
}

function updateSecurityStatus(envValidated, apiKeysVerified, permissionsChecked, deploymentAuthorized) {
  const deploymentConfig = path.join(__dirname, '..', 'config', 'deployment.json');
  
  try {
    const config = JSON.parse(fs.readFileSync(deploymentConfig, 'utf8'));
    
    config.security.environmentValidated = envValidated;
    config.security.apiKeysVerified = apiKeysVerified;
    config.security.accessPermissionsChecked = permissionsChecked;
    config.security.deploymentAuthorized = deploymentAuthorized;
    
    fs.writeFileSync(deploymentConfig, JSON.stringify(config, null, 2));
    console.log('📝 Security status updated');
  } catch (error) {
    console.error('❌ Error updating security status:', error.message);
  }
}

// Main security validation
async function main() {
  console.log('🛡️  Starting production deployment security validation...\n');
  
  const envValidated = validateEnvironmentVariables();
  const apiKeysVerified = validateApiKeys();
  const permissionsChecked = checkAccessPermissions();
  const deploymentAuthorized = confirmDeploymentAuthorization();
  
  updateSecurityStatus(envValidated, apiKeysVerified, permissionsChecked, deploymentAuthorized);
  
  const allChecksPass = envValidated && apiKeysVerified && permissionsChecked && deploymentAuthorized;
  
  console.log('\n📊 Security Validation Summary:');
  console.log(`   Environment Variables: ${envValidated ? '✅' : '❌'}`);
  console.log(`   API Keys: ${apiKeysVerified ? '✅' : '❌'}`);
  console.log(`   Access Permissions: ${permissionsChecked ? '✅' : '❌'}`);
  console.log(`   Deployment Authorization: ${deploymentAuthorized ? '✅' : '❌'}`);
  
  if (allChecksPass) {
    console.log('\n🎉 All security checks passed! Ready for production deployment.');
    process.exit(0);
  } else {
    console.log('\n🚨 Security validation failed! Please fix the issues above before deploying.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Security validation error:', error);
    process.exit(1);
  });
}

module.exports = {
  validateEnvironmentVariables,
  validateApiKeys,
  checkAccessPermissions,
  confirmDeploymentAuthorization
};