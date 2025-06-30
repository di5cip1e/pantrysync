#!/usr/bin/env node

/**
 * Post-deployment validation script
 * Performs comprehensive health checks after deployment
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.DEPLOY_URL || 'https://pantrysync-demo.web.app',
  timeout: 10000,
  retries: 3,
  checks: {
    health: true,
    performance: true,
    security: true,
    functionality: true
  }
};

// Results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: []
};

// Utility functions
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const prefix = {
    'INFO': '✅',
    'WARN': '⚠️',
    'ERROR': '❌',
    'SUCCESS': '🎉'
  }[type] || 'ℹ️';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function addResult(name, passed, message, details = null) {
  results.total++;
  if (passed) {
    results.passed++;
    log(`${name}: ${message}`, 'INFO');
  } else {
    results.failed++;
    log(`${name}: ${message}`, 'ERROR');
  }
  
  results.checks.push({
    name,
    passed,
    message,
    details,
    timestamp: new Date().toISOString()
  });
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      timeout: CONFIG.timeout,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        data,
        responseTime: Date.now() - startTime
      }));
    });
    
    const startTime = Date.now();
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

// Health check functions
async function checkBasicConnectivity() {
  log('Running basic connectivity checks...');
  
  try {
    const response = await makeRequest(CONFIG.baseUrl);
    addResult(
      'Basic Connectivity',
      response.statusCode === 200,
      response.statusCode === 200 
        ? `Site accessible (${response.responseTime}ms)`
        : `Site returned status ${response.statusCode}`,
      { statusCode: response.statusCode, responseTime: response.responseTime }
    );
  } catch (error) {
    addResult('Basic Connectivity', false, `Connection failed: ${error.message}`);
  }
}

async function checkPerformance() {
  log('Running performance checks...');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(CONFIG.baseUrl);
    const loadTime = Date.now() - startTime;
    
    // Performance thresholds
    const maxLoadTime = 5000; // 5 seconds
    const warningLoadTime = 3000; // 3 seconds
    
    if (loadTime <= warningLoadTime) {
      addResult('Load Time', true, `Excellent load time: ${loadTime}ms`);
    } else if (loadTime <= maxLoadTime) {
      addResult('Load Time', true, `Acceptable load time: ${loadTime}ms (warning threshold exceeded)`);
      results.warnings++;
    } else {
      addResult('Load Time', false, `Poor load time: ${loadTime}ms (exceeds ${maxLoadTime}ms limit)`);
    }
    
    // Check content size
    const contentLength = response.headers['content-length'];
    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024;
      addResult(
        'Content Size',
        sizeKB < 1000, // Less than 1MB
        `Content size: ${sizeKB.toFixed(1)}KB`,
        { sizeKB }
      );
    }
    
  } catch (error) {
    addResult('Performance Check', false, `Performance check failed: ${error.message}`);
  }
}

async function checkSecurityHeaders() {
  log('Running security header checks...');
  
  try {
    const response = await makeRequest(CONFIG.baseUrl);
    const headers = response.headers;
    
    const securityHeaders = [
      { name: 'X-Frame-Options', required: false },
      { name: 'X-Content-Type-Options', required: false },
      { name: 'Referrer-Policy', required: false },
      { name: 'Content-Security-Policy', required: false },
      { name: 'Strict-Transport-Security', required: true } // Should be present for HTTPS
    ];
    
    securityHeaders.forEach(({ name, required }) => {
      const headerPresent = !!headers[name.toLowerCase()];
      if (required) {
        addResult(
          `Security Header - ${name}`,
          headerPresent,
          headerPresent ? `${name} header present` : `${name} header missing (required)`
        );
      } else {
        if (headerPresent) {
          log(`Security Header - ${name}: Present`, 'INFO');
        } else {
          log(`Security Header - ${name}: Missing (recommended)`, 'WARN');
          results.warnings++;
        }
      }
    });
    
  } catch (error) {
    addResult('Security Headers', false, `Security header check failed: ${error.message}`);
  }
}

async function checkFirebaseIntegration() {
  log('Checking Firebase integration...');
  
  try {
    // Check if Firebase SDK is loaded
    const response = await makeRequest(CONFIG.baseUrl);
    const hasFirebaseSDK = response.data.includes('firebase') || response.data.includes('firebaseapp');
    
    addResult(
      'Firebase Integration',
      hasFirebaseSDK,
      hasFirebaseSDK ? 'Firebase SDK detected' : 'Firebase SDK not detected in HTML'
    );
    
    // Check for Firebase configuration
    const hasFirebaseConfig = response.data.includes('apiKey') || response.data.includes('firebase');
    addResult(
      'Firebase Configuration',
      hasFirebaseConfig,
      hasFirebaseConfig ? 'Firebase configuration detected' : 'Firebase configuration not found'
    );
    
  } catch (error) {
    addResult('Firebase Integration', false, `Firebase integration check failed: ${error.message}`);
  }
}

async function checkRoutes() {
  log('Checking application routes...');
  
  const routes = [
    '/',
    '/auth',
    '/auth/signin',
    '/auth/signup'
  ];
  
  for (const route of routes) {
    try {
      const url = `${CONFIG.baseUrl}${route}`;
      const response = await makeRequest(url);
      
      addResult(
        `Route - ${route}`,
        response.statusCode < 400,
        response.statusCode < 400 
          ? `Route accessible (${response.statusCode})`
          : `Route returned ${response.statusCode}`,
        { route, statusCode: response.statusCode }
      );
    } catch (error) {
      addResult(`Route - ${route}`, false, `Route check failed: ${error.message}`);
    }
  }
}

async function checkCache() {
  log('Checking caching configuration...');
  
  try {
    const response = await makeRequest(CONFIG.baseUrl);
    const cacheControl = response.headers['cache-control'];
    const etag = response.headers['etag'];
    
    addResult(
      'Cache Headers',
      !!(cacheControl || etag),
      cacheControl 
        ? `Cache-Control header present: ${cacheControl}`
        : etag 
          ? `ETag header present: ${etag}`
          : 'No caching headers found',
      { cacheControl, etag }
    );
    
  } catch (error) {
    addResult('Cache Check', false, `Cache check failed: ${error.message}`);
  }
}

async function checkResourcesAccessibility() {
  log('Checking static resources...');
  
  const resources = [
    '/favicon.png',
    '/manifest.json'
  ];
  
  for (const resource of resources) {
    try {
      const url = `${CONFIG.baseUrl}${resource}`;
      const response = await makeRequest(url);
      
      addResult(
        `Resource - ${resource}`,
        response.statusCode === 200,
        response.statusCode === 200 
          ? `Resource accessible`
          : `Resource returned ${response.statusCode}`,
        { resource, statusCode: response.statusCode }
      );
    } catch (error) {
      // Resources might not exist, so we'll just warn
      log(`Resource - ${resource}: ${error.message}`, 'WARN');
      results.warnings++;
    }
  }
}

async function generateReport() {
  const reportData = {
    timestamp: new Date().toISOString(),
    deployment: {
      url: CONFIG.baseUrl,
      version: process.env.VERSION || 'unknown',
      buildId: process.env.BUILD_ID || 'unknown'
    },
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      successRate: ((results.passed / results.total) * 100).toFixed(1)
    },
    checks: results.checks
  };
  
  // Write detailed report to file
  const reportPath = path.join(process.cwd(), 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  log(`Detailed report written to: ${reportPath}`);
  
  return reportData;
}

// Main execution
async function runValidation() {
  log('🚀 Starting post-deployment validation...', 'INFO');
  log(`Target URL: ${CONFIG.baseUrl}`, 'INFO');
  
  try {
    // Run all checks
    await checkBasicConnectivity();
    
    if (CONFIG.checks.performance) {
      await checkPerformance();
    }
    
    if (CONFIG.checks.security) {
      await checkSecurityHeaders();
    }
    
    if (CONFIG.checks.functionality) {
      await checkFirebaseIntegration();
      await checkRoutes();
      await checkCache();
      await checkResourcesAccessibility();
    }
    
    // Generate report
    const report = await generateReport();
    
    // Summary
    log('', 'INFO');
    log('📊 Validation Summary:', 'INFO');
    log(`Total checks: ${results.total}`, 'INFO');
    log(`Passed: ${results.passed}`, 'SUCCESS');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'ERROR' : 'INFO');
    log(`Warnings: ${results.warnings}`, results.warnings > 0 ? 'WARN' : 'INFO');
    log(`Success rate: ${report.summary.successRate}%`, 'INFO');
    
    if (results.failed === 0) {
      log('🎉 All critical checks passed! Deployment validation successful.', 'SUCCESS');
      process.exit(0);
    } else {
      log('❌ Some checks failed. Please review the issues above.', 'ERROR');
      process.exit(1);
    }
    
  } catch (error) {
    log(`Validation failed with error: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runValidation();
}

module.exports = {
  runValidation,
  CONFIG,
  results
};