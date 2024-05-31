module.exports = {
    collectCoverageFrom: [
        'src/**/*.ts'
    ],
    coveragePathIgnorePatterns: [
        'src/constants',
        'src/test-artifacts',
        'src/main/test-apps',
        'src/index.ts'
    ],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
            diagnostics: false,
        },
    },
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost/'
    },
    transform: {
        '\\.[jt]sx?$': 'ts-jest'
    }
};

