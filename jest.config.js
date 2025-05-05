/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // assumes your code/tests are in the 'src' folder
  testPathIgnorePatterns: ['/dist/', '\\.js$'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,
};

