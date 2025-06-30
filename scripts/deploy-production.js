#!/usr/bin/env node

/**
 * Production Deployment Workflow
 * Orchestrates the complete production deployment process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import our validation and metadata scripts
const { validateEnvironmentVariables, validateApiKeys, checkAccessPermissions, confirmDeploymentAuthorization } = require('./validate-deployment');
const { updateBuildMetadata, generateBuildInfo } = require('./update-build-metadata');

function initializeDeployment() {
  console.log('🚀 Initializing production deployment workflow...\n');
  
  const deploymentConfig = path.join(__dirname, '..', 'config', 'deployment.json');
  
  if (!fs.existsSync(deploymentConfig)) {
    console.error('❌ Deployment configuration not found. Run setup first.');
    return false;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(deploymentConfig, 'utf8'));
    
    console.log('📋 Deployment Configuration:');
    console.log(`   Environment: ${config.deployment.environment}`);
    console.log(`   Version: ${config.deployment.version}`);
    console.log(`   User: ${config.deployment.user}`);
    console.log(`   Timestamp: ${config.deployment.timestamp}`);
    console.log(`   Build: ${config.deployment.build}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Error reading deployment configuration:', error.message);
    return false;
  }
}

function runSecurityValidation() {
  console.log('🛡️  Running security validation...');
  
  try {
    // Run security validation as a separate process
    execSync('node scripts/validate-deployment.js', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    return true;
  } catch (error) {
    console.error('❌ Security validation failed');
    return false;
  }
}

function updateMetadata() {
  console.log('📦 Updating build metadata...');
  
  try {
    // Run metadata update as a separate process
    execSync('node scripts/update-build-metadata.js', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    return true;
  } catch (error) {
    console.error('❌ Metadata update failed');
    return false;
  }
}

function buildForProduction() {
  console.log('🔨 Building for production...');
  
  try {
    console.log('   Running: npm run build:web');
    execSync('npm run build:web', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    
    console.log('✅ Production build completed');
    return true;
  } catch (error) {
    console.error('❌ Production build failed:', error.message);
    return false;
  }
}

function deployToFirebase() {
  console.log('🚀 Deploying to Firebase...');
  
  try {
    console.log('   Running: firebase deploy --only hosting');
    execSync('firebase deploy --only hosting', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    
    console.log('✅ Firebase deployment completed');
    return true;
  } catch (error) {
    console.error('❌ Firebase deployment failed:', error.message);
    return false;
  }
}

function updateDeploymentStatus(success) {
  const deploymentConfig = path.join(__dirname, '..', 'config', 'deployment.json');
  
  try {
    const config = JSON.parse(fs.readFileSync(deploymentConfig, 'utf8'));
    
    config.deployment.deploymentStatus = success ? 'success' : 'failed';
    config.deployment.deploymentCompletedAt = new Date().toISOString();
    
    if (success) {
      config.deployment.lastSuccessfulDeployment = new Date().toISOString();
    }
    
    fs.writeFileSync(deploymentConfig, JSON.stringify(config, null, 2));
    console.log(`📝 Deployment status updated: ${success ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error('❌ Error updating deployment status:', error.message);
  }
}

function generateDeploymentSummary() {
  console.log('\n📊 Deployment Summary');
  console.log('=' .repeat(50));
  
  const deploymentConfig = path.join(__dirname, '..', 'config', 'deployment.json');
  const buildInfoPath = path.join(__dirname, '..', 'build-info.json');
  
  try {
    const config = JSON.parse(fs.readFileSync(deploymentConfig, 'utf8'));
    const buildInfo = fs.existsSync(buildInfoPath) ? JSON.parse(fs.readFileSync(buildInfoPath, 'utf8')) : null;
    
    console.log(`Environment: ${config.deployment.environment}`);
    console.log(`Version: ${config.deployment.version}`);
    console.log(`Build: ${config.deployment.buildNumber || 'N/A'}`);
    console.log(`User: ${config.deployment.user}`);
    console.log(`Status: ${config.deployment.deploymentStatus || 'In Progress'}`);
    
    if (buildInfo) {
      console.log(`Commit: ${buildInfo.commitHash?.substring(0, 8) || 'N/A'}`);
      console.log(`Branch: ${buildInfo.branch || 'N/A'}`);
      console.log(`Platform: ${buildInfo.platform || 'N/A'}`);
    }
    
    console.log('\nSecurity Checks:');
    console.log(`   Environment Variables: ${config.security.environmentValidated ? '✅' : '❌'}`);
    console.log(`   API Keys: ${config.security.apiKeysVerified ? '✅' : '❌'}`);
    console.log(`   Access Permissions: ${config.security.accessPermissionsChecked ? '✅' : '❌'}`);
    console.log(`   Deployment Authorization: ${config.security.deploymentAuthorized ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error generating deployment summary:', error.message);
  }
}

// Main deployment workflow
async function main() {
  console.log('🎯 Starting Production Deployment Workflow');
  console.log('=' .repeat(50));
  
  let deploymentSuccess = false;
  
  try {
    // Step 1: Initialize deployment
    if (!initializeDeployment()) {
      throw new Error('Deployment initialization failed');
    }
    
    // Step 2: Update build metadata
    if (!updateMetadata()) {
      throw new Error('Metadata update failed');
    }
    
    // Step 3: Run security validation
    if (!runSecurityValidation()) {
      throw new Error('Security validation failed');
    }
    
    // Step 4: Build for production
    if (!buildForProduction()) {
      throw new Error('Production build failed');
    }
    
    // Step 5: Deploy to Firebase
    if (!deployToFirebase()) {
      throw new Error('Firebase deployment failed');
    }
    
    deploymentSuccess = true;
    console.log('\n🎉 Production deployment completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    deploymentSuccess = false;
  } finally {
    // Update deployment status
    updateDeploymentStatus(deploymentSuccess);
    
    // Generate summary
    generateDeploymentSummary();
    
    process.exit(deploymentSuccess ? 0 : 1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Deployment workflow error:', error);
    process.exit(1);
  });
}

module.exports = {
  initializeDeployment,
  runSecurityValidation,
  updateMetadata,
  buildForProduction,
  deployToFirebase
};