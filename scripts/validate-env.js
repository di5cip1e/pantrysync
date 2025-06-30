#!/usr/bin/env node

/**
 * Environment validation script
 * This script validates environment configuration and reports any issues
 */

const { validateEnvironment } = require('./config/env-validation.ts');
const { config } = require('./config/environment.ts');

console.log('🔍 Validating environment configuration...');
console.log(`Environment: ${config.env}`);
console.log(`Version: ${config.version}`);

const validation = validateEnvironment();

if (validation.warnings.length > 0) {
  console.warn('⚠️ Environment warnings:');
  validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
}

if (validation.errors.length > 0) {
  console.error('❌ Environment validation errors:');
  validation.errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}

console.log('✅ Environment validation passed successfully');

// Additional checks for specific environments
if (config.env === 'production') {
  const criticalChecks = [
    { check: config.firebase.apiKey !== 'PRODUCTION_API_KEY_HERE', message: 'Production Firebase API key is not configured' },
    { check: config.errorReporting.enabled, message: 'Error reporting should be enabled in production' },
    { check: !config.debug.logsEnabled, message: 'Debug logs should be disabled in production' },
    { check: !config.debug.mockData, message: 'Mock data should be disabled in production' },
    { check: config.analytics.enabled, message: 'Analytics should be enabled in production' },
  ];

  const criticalFailures = criticalChecks.filter(check => !check.check);
  
  if (criticalFailures.length > 0) {
    console.error('❌ Critical production configuration issues:');
    criticalFailures.forEach(failure => console.error(`  - ${failure.message}`));
    process.exit(1);
  }
  
  console.log('✅ Production configuration validation passed');
}

console.log('🎉 All environment validations completed successfully');