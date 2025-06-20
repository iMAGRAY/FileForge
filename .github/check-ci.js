#!/usr/bin/env node
/**
 * Simple CI validation script
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking CI setup...');

// Check required files
const requiredFiles = [
  'src/fileforge.cjs',
  'package.json',
  'requirements.txt',
  'tests/fileforge.test.js',
  'tests/test_fileforge.py',
  'jest.config.js',
  '.eslintrc.json'
];

let allGood = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
});

// Check package.json scripts
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (pkg.scripts && pkg.scripts.test && pkg.scripts.lint) {
    console.log('✅ package.json scripts');
  } else {
    console.log('❌ package.json missing required scripts');
    allGood = false;
  }
} catch (e) {
  console.log('❌ Error reading package.json:', e.message);
  allGood = false;
}

if (allGood) {
  console.log('🎉 CI setup looks good!');
  process.exit(0);
} else {
  console.log('💥 CI setup has issues');
  process.exit(1);
} 