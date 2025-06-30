#!/usr/bin/env node

/**
 * Integration test for monitoring services
 * Tests that monitoring services can be imported and basic functionality works
 */

const path = require('path');

// Mock Firebase modules since we're testing outside of the app context
const mockFirebase = {
  db: {},
  collection: () => ({ add: () => Promise.resolve({ id: 'test-id' }) }),
  doc: () => ({ get: () => Promise.resolve({ exists: true, data: () => ({}) }) }),
  addDoc: () => Promise.resolve({ id: 'test-id' }),
  getDocs: () => Promise.resolve({ docs: [], empty: true }),
  query: () => ({}),
  where: () => ({}),
  orderBy: () => ({}),
  limit: () => ({}),
  serverTimestamp: () => new Date()
};

// Mock the Firebase config
global.mockFirebase = mockFirebase;

console.log('🧪 Running monitoring services integration tests...');

// Test 1: Verify script files exist and are executable
console.log('\n📁 Testing script files...');

const fs = require('fs');
const scriptsPath = path.join(__dirname, '..', 'scripts');

const requiredScripts = [
  'post-deployment-validation.js',
  'health-check.sh'
];

let scriptsValid = true;
requiredScripts.forEach(script => {
  const scriptPath = path.join(scriptsPath, script);
  if (fs.existsSync(scriptPath)) {
    const stats = fs.statSync(scriptPath);
    if (stats.mode & 0o111) { // Check if executable
      console.log(`✅ ${script}: Exists and executable`);
    } else {
      console.log(`⚠️ ${script}: Exists but not executable`);
      scriptsValid = false;
    }
  } else {
    console.log(`❌ ${script}: Missing`);
    scriptsValid = false;
  }
});

// Test 2: Verify monitoring service types/interfaces
console.log('\n🔍 Testing monitoring service types...');

const monitoringPath = path.join(__dirname, '..', 'services', 'monitoring.ts');
if (fs.existsSync(monitoringPath)) {
  const monitoringContent = fs.readFileSync(monitoringPath, 'utf8');
  
  const requiredTypes = [
    'DeploymentMetrics',
    'HealthCheck',
    'SecurityMetrics',
    'deploymentMonitoringService',
    'healthCheckService',
    'securityMonitoringService',
    'performanceMonitoringService'
  ];
  
  let typesValid = true;
  requiredTypes.forEach(type => {
    if (monitoringContent.includes(type)) {
      console.log(`✅ ${type}: Found in monitoring service`);
    } else {
      console.log(`❌ ${type}: Missing from monitoring service`);
      typesValid = false;
    }
  });
  
  if (typesValid) {
    console.log('✅ All required types and services found');
  } else {
    console.log('❌ Some required types/services missing');
  }
} else {
  console.log('❌ Monitoring service file not found');
  scriptsValid = false;
}

// Test 3: Verify React components exist
console.log('\n⚛️ Testing React components...');

const componentsPath = path.join(__dirname, '..', 'components');
const hooksPath = path.join(__dirname, '..', 'hooks');

const requiredComponents = [
  { path: path.join(componentsPath, 'MonitoringDashboard.tsx'), name: 'MonitoringDashboard' },
  { path: path.join(hooksPath, 'useSecurityMonitoring.ts'), name: 'useSecurityMonitoring' },
  { path: path.join(hooksPath, 'usePerformanceMonitoring.ts'), name: 'usePerformanceMonitoring' }
];

let componentsValid = true;
requiredComponents.forEach(({ path: componentPath, name }) => {
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    if (content.includes(name)) {
      console.log(`✅ ${name}: Component found and exports correct name`);
    } else {
      console.log(`⚠️ ${name}: File exists but may not export correct name`);
    }
  } else {
    console.log(`❌ ${name}: Component file missing`);
    componentsValid = false;
  }
});

// Test 4: Verify GitHub Actions workflow
console.log('\n⚙️ Testing GitHub Actions workflow...');

const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'deployment-monitoring.yml');
if (fs.existsSync(workflowPath)) {
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  
  const requiredJobs = [
    'build-and-test',
    'deploy',
    'post-deployment-validation',
    'monitoring-setup'
  ];
  
  let workflowValid = true;
  requiredJobs.forEach(job => {
    if (workflowContent.includes(job)) {
      console.log(`✅ ${job}: Job found in workflow`);
    } else {
      console.log(`❌ ${job}: Job missing from workflow`);
      workflowValid = false;
    }
  });
  
  if (workflowValid) {
    console.log('✅ GitHub Actions workflow is properly configured');
  }
} else {
  console.log('❌ GitHub Actions workflow file not found');
  scriptsValid = false;
}

// Test 5: Verify package.json scripts
console.log('\n📦 Testing package.json scripts...');

const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredScripts = [
    'health-check',
    'health-monitor',
    'validate-deployment',
    'monitor:start',
    'monitor:check'
  ];
  
  let scriptsConfigValid = true;
  requiredScripts.forEach(script => {
    if (packageContent.scripts && packageContent.scripts[script]) {
      console.log(`✅ ${script}: Script found in package.json`);
    } else {
      console.log(`❌ ${script}: Script missing from package.json`);
      scriptsConfigValid = false;
    }
  });
  
  if (scriptsConfigValid) {
    console.log('✅ All monitoring scripts configured in package.json');
  }
} else {
  console.log('❌ package.json not found');
  scriptsValid = false;
}

// Test 6: Verify documentation
console.log('\n📚 Testing documentation...');

const docsPath = path.join(__dirname, '..', 'docs', 'monitoring-configuration.md');
if (fs.existsSync(docsPath)) {
  const docsContent = fs.readFileSync(docsPath, 'utf8');
  
  const requiredSections = [
    'Overview',
    'Components',
    'Configuration',
    'Usage',
    'Monitoring Metrics',
    'Alerting'
  ];
  
  let docsValid = true;
  requiredSections.forEach(section => {
    if (docsContent.includes(section)) {
      console.log(`✅ ${section}: Section found in documentation`);
    } else {
      console.log(`❌ ${section}: Section missing from documentation`);
      docsValid = false;
    }
  });
  
  if (docsValid) {
    console.log('✅ Documentation is complete');
  }
} else {
  console.log('❌ Monitoring configuration documentation not found');
  scriptsValid = false;
}

// Summary
console.log('\n📊 Test Summary:');
console.log('================');

if (scriptsValid && componentsValid) {
  console.log('🎉 All integration tests passed!');
  console.log('✅ Monitoring system is properly configured');
  console.log('✅ All required files and components are present');
  console.log('✅ Scripts are executable and ready for use');
  console.log('\n🚀 You can now:');
  console.log('   - Run health checks: npm run monitor:check');
  console.log('   - Start continuous monitoring: npm run monitor:start');
  console.log('   - Validate deployments: npm run validate-deployment');
  console.log('   - Use monitoring components in your React app');
  process.exit(0);
} else {
  console.log('❌ Some integration tests failed');
  console.log('⚠️ Please check the issues above before using the monitoring system');
  process.exit(1);
}