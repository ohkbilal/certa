module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/golden/**/*.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['./tests/setup.js'],
  verbose: true,
  
  // V15 Policy Compliance
  // These tests must pass before deployment (V16 §20.1.1)
  testPathIgnorePatterns: [
    '/node_modules/'
  ]
};
