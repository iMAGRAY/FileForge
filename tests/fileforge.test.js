/**
 * Basic tests for FileForge Node.js components
 */

const fs = require('fs');
const path = require('path');

describe('FileForge Basic Tests', () => {
  test('fileforge.cjs file exists', () => {
    const filePath = path.join(__dirname, '..', 'src', 'fileforge.cjs');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('package.json has correct main file', () => {
    const packageJson = require('../package.json');
    expect(packageJson.main).toBe('src/fileforge.cjs');
  });

  test('required directories exist', () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const docsDir = path.join(__dirname, '..', 'docs');
    const examplesDir = path.join(__dirname, '..', 'examples');
    
    expect(fs.existsSync(srcDir)).toBe(true);
    expect(fs.existsSync(docsDir)).toBe(true);
    expect(fs.existsSync(examplesDir)).toBe(true);
  });

  test('fileforge.cjs has valid syntax structure', () => {
    const filePath = path.join(__dirname, '..', 'src', 'fileforge.cjs');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for basic CommonJS structure
    expect(content).toContain('require');
    expect(content.length).toBeGreaterThan(1000); // Should be substantial
  });
}); 