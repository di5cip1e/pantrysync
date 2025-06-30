#!/usr/bin/env node

/**
 * Build Metadata Generator
 * Updates build information and deployment metadata
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getCurrentCommitHash() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('⚠️  Could not get git commit hash:', error.message);
    return 'unknown';
  }
}

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('⚠️  Could not get git branch:', error.message);
    return 'unknown';
  }
}

function updateBuildMetadata() {
  console.log('📦 Updating build metadata...');
  
  const deploymentConfigPath = path.join(__dirname, '..', 'config', 'deployment.json');
  
  if (!fs.existsSync(deploymentConfigPath)) {
    console.error('❌ Deployment configuration not found');
    return false;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(deploymentConfigPath, 'utf8'));
    
    // Update git information
    config.deployment.commitHash = getCurrentCommitHash();
    config.deployment.branch = getCurrentBranch();
    
    // Update build timestamp
    config.deployment.buildTimestamp = new Date().toISOString();
    
    // Increment build number if same version
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    if (config.deployment.version === packageJson.version) {
      config.deployment.buildNumber = (config.deployment.buildNumber || 0) + 1;
    } else {
      config.deployment.version = packageJson.version;
      config.deployment.buildNumber = 1;
    }
    
    // Update metadata
    config.metadata.buildTimestamp = new Date().toISOString();
    config.metadata.nodeVersion = process.version;
    
    fs.writeFileSync(deploymentConfigPath, JSON.stringify(config, null, 2));
    
    console.log('✅ Build metadata updated:');
    console.log(`   Version: ${config.deployment.version}`);
    console.log(`   Build: ${config.deployment.buildNumber}`);
    console.log(`   Commit: ${config.deployment.commitHash.substring(0, 8)}`);
    console.log(`   Branch: ${config.deployment.branch}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating build metadata:', error.message);
    return false;
  }
}

function generateBuildInfo() {
  console.log('📋 Generating build info file...');
  
  const deploymentConfigPath = path.join(__dirname, '..', 'config', 'deployment.json');
  const buildInfoPath = path.join(__dirname, '..', 'build-info.json');
  
  try {
    const config = JSON.parse(fs.readFileSync(deploymentConfigPath, 'utf8'));
    
    const buildInfo = {
      version: config.deployment.version,
      buildNumber: config.deployment.buildNumber,
      buildTimestamp: config.deployment.buildTimestamp || config.deployment.timestamp,
      commitHash: config.deployment.commitHash,
      branch: config.deployment.branch,
      environment: config.deployment.environment,
      user: config.deployment.user,
      platform: config.metadata.platform,
      nodeVersion: config.metadata.nodeVersion
    };
    
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    console.log('✅ Build info file generated');
    
    return true;
  } catch (error) {
    console.error('❌ Error generating build info:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔧 Starting build metadata update...\n');
  
  const metadataUpdated = updateBuildMetadata();
  const buildInfoGenerated = generateBuildInfo();
  
  if (metadataUpdated && buildInfoGenerated) {
    console.log('\n🎉 Build metadata update completed successfully!');
    process.exit(0);
  } else {
    console.log('\n🚨 Build metadata update failed!');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Build metadata error:', error);
    process.exit(1);
  });
}

module.exports = {
  updateBuildMetadata,
  generateBuildInfo,
  getCurrentCommitHash,
  getCurrentBranch
};