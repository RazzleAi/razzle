/* eslint-disable */
export default {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  setupFilesAfterEnv: [
    // './testing-utils/integration-testing'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '<rootDir>/testing-utils/',
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/backend',
}
