"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    displayName: 'backend',
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    roots: ['<rootDir>/src', '<rootDir>/test'],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    coverageDirectory: '<rootDir>/../../coverage/apps/backend',
    transform: {
        '^.+\\.(t|j)s$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.json',
                useESM: true,
                isolatedModules: true,
            },
        ],
    },
    extensionsToTreatAsEsm: ['.ts'],
};
exports.default = config;
