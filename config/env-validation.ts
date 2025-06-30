/**
 * Environment variable validation utilities
 */

export interface ValidationRule {
  required?: boolean;
  format?: 'url' | 'email' | 'number' | 'boolean' | 'enum' | 'semver';
  min?: number;
  max?: number;
  enum?: string[];
  pattern?: RegExp;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a URL format
 */
export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates an email format
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validates a semantic version format
 */
export function isValidSemver(value: string): boolean {
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(value);
}

/**
 * Validates a boolean string
 */
export function isValidBoolean(value: string): boolean {
  return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase());
}

/**
 * Converts a string to boolean
 */
export function parseBoolean(value: string): boolean {
  return ['true', '1', 'yes'].includes(value.toLowerCase());
}

/**
 * Validates a number string
 */
export function isValidNumber(value: string): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value));
}

/**
 * Validates an environment variable against rules
 */
export function validateEnvVar(
  name: string,
  value: string | undefined,
  rules: ValidationRule
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if required
  if (rules.required && !value) {
    errors.push(`${name} is required but not provided`);
    return { isValid: false, errors, warnings };
  }

  // Skip validation if not provided and not required
  if (!value) {
    return { isValid: true, errors, warnings };
  }

  // Format validation
  switch (rules.format) {
    case 'url':
      if (!isValidUrl(value)) {
        errors.push(`${name} must be a valid URL`);
      }
      break;
    case 'email':
      if (!isValidEmail(value)) {
        errors.push(`${name} must be a valid email address`);
      }
      break;
    case 'number':
      if (!isValidNumber(value)) {
        errors.push(`${name} must be a valid number`);
      } else {
        const numValue = Number(value);
        if (rules.min !== undefined && numValue < rules.min) {
          errors.push(`${name} must be >= ${rules.min}`);
        }
        if (rules.max !== undefined && numValue > rules.max) {
          errors.push(`${name} must be <= ${rules.max}`);
        }
      }
      break;
    case 'boolean':
      if (!isValidBoolean(value)) {
        errors.push(`${name} must be a valid boolean (true/false, 1/0, yes/no)`);
      }
      break;
    case 'enum':
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${name} must be one of: ${rules.enum.join(', ')}`);
      }
      break;
    case 'semver':
      if (!isValidSemver(value)) {
        errors.push(`${name} must be a valid semantic version (e.g., 1.0.0)`);
      }
      break;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(`${name} does not match the required pattern`);
  }

  // Range validation for strings
  if (rules.min !== undefined && value.length < rules.min) {
    errors.push(`${name} must be at least ${rules.min} characters long`);
  }
  if (rules.max !== undefined && value.length > rules.max) {
    errors.push(`${name} must be at most ${rules.max} characters long`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Environment variable validation schema
 */
export const ENV_VALIDATION_SCHEMA: Record<string, ValidationRule> = {
  // Environment Configuration
  NODE_ENV: {
    format: 'enum',
    enum: ['development', 'staging', 'production', 'test'],
    required: true
  },
  EXPO_PUBLIC_ENV: {
    format: 'enum',
    enum: ['development', 'staging', 'production', 'test'],
    required: true
  },
  
  // Version Tracking
  EXPO_PUBLIC_APP_VERSION: {
    format: 'semver',
    required: true
  },
  EXPO_PUBLIC_BUILD_NUMBER: {
    format: 'number',
    min: 1,
    required: true
  },
  EXPO_PUBLIC_COMMIT_SHA: {
    pattern: /^[a-f0-9]{7,40}$/,
    required: false
  },
  
  // API Configuration
  EXPO_PUBLIC_API_URL: {
    format: 'url',
    required: true
  },
  EXPO_PUBLIC_API_TIMEOUT: {
    format: 'number',
    min: 1000,
    max: 60000,
    required: false
  },
  
  // Firebase Configuration
  EXPO_PUBLIC_FIREBASE_API_KEY: {
    required: true,
    min: 10
  },
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: {
    format: 'url',
    required: true
  },
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: {
    required: true,
    min: 1
  },
  
  // Feature Flags
  EXPO_PUBLIC_FEATURE_AI_INVENTORY: {
    format: 'boolean',
    required: false
  },
  EXPO_PUBLIC_FEATURE_ANALYTICS: {
    format: 'boolean',
    required: false
  },
  EXPO_PUBLIC_FEATURE_PUSH_NOTIFICATIONS: {
    format: 'boolean',
    required: false
  },
  EXPO_PUBLIC_FEATURE_OFFLINE_MODE: {
    format: 'boolean',
    required: false
  },
  EXPO_PUBLIC_FEATURE_DEBUG_MODE: {
    format: 'boolean',
    required: false
  },
  
  // Analytics Configuration
  EXPO_PUBLIC_ANALYTICS_ENABLED: {
    format: 'boolean',
    required: false
  },
  EXPO_PUBLIC_ANALYTICS_SAMPLE_RATE: {
    format: 'number',
    min: 0,
    max: 1,
    required: false
  },
  
  // Cache Configuration
  EXPO_PUBLIC_CACHE_TTL: {
    format: 'number',
    min: 0,
    required: false
  },
  EXPO_PUBLIC_CACHE_MAX_SIZE: {
    format: 'number',
    min: 1,
    required: false
  },
  EXPO_PUBLIC_CACHE_ENABLED: {
    format: 'boolean',
    required: false
  },
  
  // Error Reporting
  EXPO_PUBLIC_ERROR_REPORTING_ENABLED: {
    format: 'boolean',
    required: false
  },
  EXPO_PUBLIC_SENTRY_DSN: {
    format: 'url',
    required: false
  },
  EXPO_PUBLIC_ERROR_SAMPLE_RATE: {
    format: 'number',
    min: 0,
    max: 1,
    required: false
  },
  
  // User Configuration Limits
  EXPO_PUBLIC_MAX_HOUSEHOLDS_PER_USER: {
    format: 'number',
    min: 1,
    max: 100,
    required: false
  },
  EXPO_PUBLIC_MAX_ITEMS_PER_HOUSEHOLD: {
    format: 'number',
    min: 1,
    max: 10000,
    required: false
  },
  EXPO_PUBLIC_MAX_MEMBERS_PER_HOUSEHOLD: {
    format: 'number',
    min: 1,
    max: 50,
    required: false
  },
  EXPO_PUBLIC_MAX_SHOPPING_LISTS: {
    format: 'number',
    min: 1,
    max: 100,
    required: false
  },
  EXPO_PUBLIC_MAX_FILE_UPLOAD_SIZE: {
    format: 'number',
    min: 1024,
    max: 10485760, // 10MB
    required: false
  },
  
  // Security Configuration
  EXPO_PUBLIC_SESSION_TIMEOUT: {
    format: 'number',
    min: 300000, // 5 minutes
    max: 86400000, // 24 hours
    required: false
  },
  EXPO_PUBLIC_MAX_LOGIN_ATTEMPTS: {
    format: 'number',
    min: 3,
    max: 10,
    required: false
  },
  EXPO_PUBLIC_PASSWORD_MIN_LENGTH: {
    format: 'number',
    min: 6,
    max: 128,
    required: false
  },
  
  // Development/Testing
  EXPO_PUBLIC_DEBUG_LOGS: {
    format: 'boolean',
    required: false
  },
  EXPO_PUBLIC_MOCK_DATA: {
    format: 'boolean',
    required: false
  },
  EXPO_PUBLIC_TEST_MODE: {
    format: 'boolean',
    required: false
  }
};

/**
 * Validates all environment variables against the schema
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [envVar, rules] of Object.entries(ENV_VALIDATION_SCHEMA)) {
    const value = process.env[envVar];
    const result = validateEnvVar(envVar, value, rules);
    
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}