module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.pact.test.ts'],
  collectCoverageFrom: [
    '<rootDir>/server/clients/manageRecallsApi/manageRecallsApiClient.ts',
    '<rootDir>/server/data/restClient.ts',
  ],
}
