module.exports = {
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/main.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ]
};
