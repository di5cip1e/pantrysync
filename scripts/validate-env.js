#!/usr/bin/env node

/**
 * Environment validation script
 * This script validates environment configuration and reports any issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating environment configuration...');

// Load environment file if it exists
const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  console.log(`Loading environment from ${envFile}`);
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key] = value;
      }
    }
  }
}

// Basic environment validation without requiring TypeScript compilation
const requiredVars = [
  'EXPO_PUBLIC_ENV',
  'EXPO_PUBLIC_APP_VERSION',
  'EXPO_PUBLIC_BUILD_NUMBER'
];

const missingVars = [];
const warnings = [];

// Check for required variables
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

// Basic checks
const env = process.env.EXPO_PUBLIC_ENV || process.env.NODE_ENV || 'development';
const version = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';

console.log(`Environment: ${env}`);
console.log(`Version: ${version}`);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

// Production-specific checks
if (env === 'production') {
  const productionChecks = [
    { var: 'EXPO_PUBLIC_FIREBASE_API_KEY', shouldNotBe: ['PRODUCTION_API_KEY_HERE', ''] },
    { var: 'EXPO_PUBLIC_ERROR_REPORTING_ENABLED', shouldBe: ['true', '1'] },
    { var: 'EXPO_PUBLIC_DEBUG_LOGS', shouldBe: ['false', '0'] },
    { var: 'EXPO_PUBLIC_MOCK_DATA', shouldBe: ['false', '0'] },
  ];

  const criticalFailures = [];

  for (const check of productionChecks) {
    const value = process.env[check.var];
    
    if (check.shouldNotBe && check.shouldNotBe.includes(value)) {
      criticalFailures.push(`${check.var} has placeholder/invalid value: ${value}`);
    }
    
    if (check.shouldBe && !check.shouldBe.includes(value)) {
      criticalFailures.push(`${check.var} should be one of: ${check.shouldBe.join(', ')}, but is: ${value}`);
    }
  }

  if (criticalFailures.length > 0) {
    console.error('❌ Critical production configuration issues:');
    criticalFailures.forEach(failure => console.error(`  - ${failure}`));
    process.exit(1);
  }
  
  console.log('✅ Production configuration validation passed');
}

if (warnings.length > 0) {
  console.warn('⚠️ Environment warnings:');
  warnings.forEach(warning => console.warn(`  - ${warning}`));
}

console.log('✅ Environment validation passed successfully');
console.log('🎉 All environment validations completed successfully');