module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/src/test/styleMock.js',
  },
  testMatch: ['**/*.test.js', '**/*.test.jsx'],
}
