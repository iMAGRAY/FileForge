module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/src/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  moduleFileExtensions: ['js', 'cjs'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**'
  ],
  testTimeout: 30000,
  verbose: true
}; 