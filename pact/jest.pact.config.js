module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  rootDir: '../',
  testMatch: ['**/*.pact.test.(ts|js)'],
}
