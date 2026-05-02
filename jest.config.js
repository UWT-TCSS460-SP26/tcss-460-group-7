/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { diagnostics: { ignoreCodes: [151002] } }],
  },
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/generated/prisma/client$': '<rootDir>/tests/__mocks__/generatedPrismaClient.ts',
    '^../generated/prisma/client$': '<rootDir>/tests/__mocks__/generatedPrismaClient.ts',
    '^\\.\\./generated/prisma/client$': '<rootDir>/tests/__mocks__/generatedPrismaClient.ts',
    '^\\.\\/generated/prisma/client$': '<rootDir>/tests/__mocks__/generatedPrismaClient.ts',
    '^@scalar/express-api-reference$': '<rootDir>/tests/__mocks__/scalarMock.cjs',
    '^.*/middleware/requireAuth$': '<rootDir>/tests/__mocks__/requireAuth.ts',
  },
};
