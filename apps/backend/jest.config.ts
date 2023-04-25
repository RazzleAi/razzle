/* eslint-disable */
export default {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  setupFilesAfterEnv: [
    // './testing-utils/integration-testing'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '<rootDir>/testing-utils/'],  
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/backend',
}
