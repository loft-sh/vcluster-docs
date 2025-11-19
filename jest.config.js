/**
 * Jest Configuration for vCluster Documentation
 *
 * This configuration is set up to test React components in the Docusaurus project.
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Root directory for tests
  roots: ['<rootDir>/src'],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module name mapper for Docusaurus aliases and CSS modules
  moduleNameMapper: {
    // Handle Docusaurus @site alias
    '^@site/(.*)$': '<rootDir>/$1',

    // Handle CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Handle YAML files
    '\\.(yaml|yml)$': '<rootDir>/__mocks__/yamlMock.js',

    // Handle static file imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    }],
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx,ts,tsx}',
    '!src/components/**/*.d.ts',
    '!src/components/**/index.{js,jsx}', // Exclude barrel exports
  ],

  // Coverage thresholds (optional - adjust as needed)
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.docusaurus/',
    '/build/',
  ],

  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

  // Verbose output
  verbose: true,
};
