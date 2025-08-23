#!/usr/bin/env node

/**
 * Pre-publish verification script for homebridge-ahoy-dtu
 * Checks that all required files and configurations are present
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-publish verification for homebridge-ahoy-dtu\n');

let hasErrors = false;

// Required files for npm package
const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'INSTALL.md',
  'CONTRIBUTING.md',
  'config.schema.json',
  'dist/index.js',
  '.npmignore'
];

// Required GitHub files
const githubFiles = [
  '.github/workflows/build.yml',
  '.github/workflows/publish.yml',
  '.github/ISSUE_TEMPLATE',
  '.github/pull_request_template.md'
];

function checkFile(filePath, required = true) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : (required ? '❌' : '⚠️');
  const statusText = exists ? 'Found' : (required ? 'MISSING' : 'Optional');
  
  console.log(`${status} ${filePath} - ${statusText}`);
  
  if (!exists && required) {
    hasErrors = true;
  }
  
  return exists;
}

console.log('📦 Checking required npm package files:');
requiredFiles.forEach(file => checkFile(file));

console.log('\n🐙 Checking GitHub integration files:');
githubFiles.forEach(file => checkFile(file));

console.log('\n📋 Checking package.json configuration:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check required package.json fields
  const requiredFields = ['name', 'version', 'description', 'main', 'author', 'license', 'keywords', 'engines'];
  requiredFields.forEach(field => {
    if (packageJson[field]) {
      console.log(`✅ ${field}: ${typeof packageJson[field] === 'object' ? 'configured' : packageJson[field]}`);
    } else {
      console.log(`❌ ${field}: MISSING`);
      hasErrors = true;
    }
  });
  
  // Check for WIP in description
  if (packageJson.description && packageJson.description.includes('[WIP]')) {
    console.log('⚠️ Description contains [WIP] - should be removed for production');
  }
  
  // Check files array
  if (packageJson.files && packageJson.files.length > 0) {
    console.log(`✅ files: ${packageJson.files.length} entries`);
  } else {
    console.log('❌ files: Not specified or empty');
    hasErrors = true;
  }
  
} catch (error) {
  console.log('❌ package.json: Invalid JSON');
  hasErrors = true;
}

console.log('\n🏗️ Checking build output:');
if (fs.existsSync('dist/index.js')) {
  const stats = fs.statSync('dist/index.js');
  console.log(`✅ dist/index.js: ${Math.round(stats.size / 1024)}KB`);
} else {
  console.log('❌ dist/index.js: Not found - run npm run build');
  hasErrors = true;
}

console.log('\n🎯 Testing npm pack (dry run):');
try {
  const { execSync } = require('child_process');
  const packOutput = execSync('npm pack --dry-run', { encoding: 'utf8' });
  
  // Extract the tarball contents section
  const contentsMatch = packOutput.match(/Tarball Contents[\s\S]*?Tarball Details/);
  if (contentsMatch) {
    const contents = contentsMatch[0];
    
    // Count files that would be included
    const fileLines = contents.split('\n').filter(line => 
      line.includes('kB ') || line.includes('B ') && !line.includes('Tarball')
    );
    console.log(`✅ npm pack: ${fileLines.length} files would be included`);
    
    // Check if important files are included
    const importantFiles = ['dist/', 'config.schema.json', 'README.md', 'LICENSE'];
    importantFiles.forEach(file => {
      const included = contents.includes(file);
      console.log(`${included ? '✅' : '❌'} ${file}: ${included ? 'included' : 'NOT included'}`);
      if (!included) hasErrors = true;
    });
  } else {
    console.log('✅ npm pack: Files detected in output');
    // Fallback check
    const importantFiles = ['dist/', 'config.schema.json', 'README.md', 'LICENSE'];
    importantFiles.forEach(file => {
      const included = packOutput.includes(file);
      console.log(`${included ? '✅' : '⚠️'} ${file}: ${included ? 'included' : 'check manually'}`);
    });
  }
  
} catch (error) {
  console.log('❌ npm pack test failed:', error.message);
  hasErrors = true;
}

console.log('\n📊 Final verification result:');
if (hasErrors) {
  console.log('❌ VERIFICATION FAILED - Please fix the issues above before publishing');
  process.exit(1);
} else {
  console.log('✅ ALL CHECKS PASSED - Ready for publishing!');
  console.log('\n🚀 Next steps:');
  console.log('  1. npm publish (for npm)');
  console.log(`  2. git tag v${packageJson.version} && git push --tags (for GitHub release)`);
  console.log('  3. Create GitHub release with changelog');
}