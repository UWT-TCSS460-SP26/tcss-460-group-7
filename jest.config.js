/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [151002],
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/lib/prisma$': '<rootDir>/src/lib/__mocks__/prisma.ts',
    '.*/lib/prisma$': '<rootDir>/src/lib/__mocks__/prisma.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@scalar/express-api-reference$': '<rootDir>/tests/__mocks__/scalarMock.cjs',
    '^.+/middleware/requireAuth(\\.[jt]s)?$': '<rootDir>/tests/__mocks__/requireAuth.ts',
  },
};
