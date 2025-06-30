#!/usr/bin/env node

/**
 * Pre-deployment Check Script
 * Validates all requirements before starting deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkNodeVersion() {
  console.log('🔍 Checking Node.js version...');
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.error(`❌ Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`);
    return false;
  }
  
  console.log(`✅ Node.js version ${nodeVersion} is supported`);
  return true;
}

function checkPackageJson() {
  console.log('🔍 Checking package.json...');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check required scripts
    const requiredScripts = ['build:web', 'deploy:production', 'validate:deployment'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      console.error('❌ Missing required scripts:', missingScripts);
      return false;
    }
    
    console.log('✅ package.json configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    return false;
  }
}

function checkFirebaseConfig() {
  console.log('🔍 Checking Firebase configuration...');
  
  const firebaseJsonPath = path.join(__dirname, '..', 'firebase.json');
  const firebaseRcPath = path.join(__dirname, '..', '.firebaserc');
  
  if (!fs.existsSync(firebaseJsonPath)) {
    console.error('❌ firebase.json not found');
    return false;
  }
  
  if (!fs.existsSync(firebaseRcPath)) {
    console.error('❌ .firebaserc not found');
    return false;
  }
  
  try {
    const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    const firebaseRc = JSON.parse(fs.readFileSync(firebaseRcPath, 'utf8'));
    
    if (!firebaseJson.hosting) {
      console.error('❌ Firebase hosting configuration not found');
      return false;
    }
    
    if (!firebaseRc.projects || !firebaseRc.projects.default) {
      console.error('❌ Firebase project configuration not found');
      return false;
    }
    
    console.log(`✅ Firebase configuration valid (project: ${firebaseRc.projects.default})`);
    return true;
  } catch (error) {
    console.error('❌ Error reading Firebase configuration:', error.message);
    return false;
  }
}

function checkDeploymentConfig() {
  console.log('🔍 Checking deployment configuration...');
  
  const deploymentConfigPath = path.join(__dirname, '..', 'config', 'deployment.json');
  
  if (!fs.existsSync(deploymentConfigPath)) {
    console.error('❌ Deployment configuration not found');
    return false;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(deploymentConfigPath, 'utf8'));
    
    // Check required fields
    const requiredFields = ['deployment', 'security', 'metadata'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing deployment configuration fields:', missingFields);
      return false;
    }
    
    console.log('✅ Deployment configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Error reading deployment configuration:', error.message);
    return false;
  }
}

function checkGitRepository() {
  console.log('🔍 Checking Git repository...');
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim()) {
      console.warn('⚠️  Git repository has uncommitted changes:');
      console.warn(status);
      console.warn('   Consider committing changes before deployment');
    } else {
      console.log('✅ Git repository is clean');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking Git repository:', error.message);
    return false;
  }
}

function checkEnvironmentFile() {
  console.log('🔍 Checking environment configuration...');
  
  const envExamplePath = path.join(__dirname, '..', '.env.production.example');
  const envPath = path.join(__dirname, '..', '.env.production');
  
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.production.example not found');
    return false;
  }
  
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env.production file not found');
    console.warn('   Copy .env.production.example to .env.production and fill in values');
    console.warn('   Or set environment variables directly');
  } else {
    console.log('✅ Environment configuration file found');
  }
  
  return true;
}

// Main pre-deployment check
async function main() {
  console.log('🏁 Starting Pre-deployment Checks');
  console.log('=' .repeat(40));
  
  const checks = [
    checkNodeVersion,
    checkPackageJson,
    checkFirebaseConfig,
    checkDeploymentConfig,
    checkGitRepository,
    checkEnvironmentFile
  ];
  
  let allChecksPassed = true;
  
  for (const check of checks) {
    try {
      const result = check();
      if (!result) {
        allChecksPassed = false;
      }
    } catch (error) {
      console.error('❌ Check failed:', error.message);
      allChecksPassed = false;
    }
    console.log(); // Add spacing between checks
  }
  
  console.log('📊 Pre-deployment Check Summary');
  console.log('=' .repeat(40));
  
  if (allChecksPassed) {
    console.log('🎉 All pre-deployment checks passed!');
    console.log('📋 Next steps:');
    console.log('   1. Set environment variables (or create .env.production)');
    console.log('   2. Run: npm run deploy:production');
    process.exit(0);
  } else {
    console.log('🚨 Some pre-deployment checks failed!');
    console.log('📋 Please fix the issues above before deploying');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Pre-deployment check error:', error);
    process.exit(1);
  });
}

module.exports = {
  checkNodeVersion,
  checkPackageJson,
  checkFirebaseConfig,
  checkDeploymentConfig,
  checkGitRepository,
  checkEnvironmentFile
};