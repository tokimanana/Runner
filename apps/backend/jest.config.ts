import type { Config } from 'jest';
import { createDefaultEsmPreset } from 'ts-jest';

const presetConfig = createDefaultEsmPreset({
  tsconfig: '<rootDir>/tsconfig.json',
  isolatedModules: true,
});

const config: Config = {
  displayName: 'backend',
  ...presetConfig,
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  coverageDirectory: '../../coverage/apps/backend',
  moduleNameMapper: {
    '^@backend/(.*)$': '<rootDir>/src/$1',
    '^@runner/shared/types$': '<rootDir>/../libs/shared/types/src/index.ts',
  },
};

export default config;
