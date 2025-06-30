/**
 * Configuration utility that provides access to environment configuration
 * This is a simpler utility that can be imported without circular dependencies
 */

import { config, isFeatureEnabled, isDevelopment, isProduction, isStaging, isTest } from './environment';

// Re-export the configuration and utilities
export {
  config,
  isFeatureEnabled,
  isDevelopment,
  isProduction,
  isStaging,
  isTest
};

// Utility functions for common configuration needs

/**
 * Get API configuration
 */
export function getApiConfig() {
  return {
    url: config.api.url,
    key: config.api.key,
    timeout: config.api.timeout,
  };
}

/**
 * Get Firebase configuration
 */
export function getFirebaseConfig() {
  return {
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket,
    messagingSenderId: config.firebase.messagingSenderId,
    appId: config.firebase.appId,
    measurementId: config.firebase.measurementId,
  };
}

/**
 * Check if analytics should be enabled
 */
export function shouldEnableAnalytics(): boolean {
  return config.analytics.enabled && isFeatureEnabled('analytics');
}

/**
 * Check if error reporting should be enabled
 */
export function shouldEnableErrorReporting(): boolean {
  return config.errorReporting.enabled;
}

/**
 * Get user limits
 */
export function getUserLimits() {
  return config.limits;
}

/**
 * Get security settings
 */
export function getSecuritySettings() {
  return config.security;
}

/**
 * Check if debug features should be enabled
 */
export function shouldEnableDebug(): boolean {
  return config.debug.logsEnabled || isFeatureEnabled('debugMode');
}

/**
 * Get cache configuration
 */
export function getCacheConfig() {
  return config.cache;
}

/**
 * Get current environment info
 */
export function getEnvironmentInfo() {
  return {
    env: config.env,
    version: config.version,
    buildNumber: config.buildNumber,
    commitSha: config.commitSha,
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    isStaging: isStaging(),
    isTest: isTest(),
  };
}