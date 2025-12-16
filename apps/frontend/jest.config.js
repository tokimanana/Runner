const config = {
    displayName: 'frontend',
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$'
            }
        ]
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    coverageDirectory: '<rootDir>/../../coverage/apps/frontend'
};
export default config;
//# sourceMappingURL=jest.config.js.map