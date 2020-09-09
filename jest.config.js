module.exports = {
    transform: {
        '^.+.tsx?$': 'ts-jest',
    },
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    collectCoverageFrom: ['src/**/*.{ts,js}'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
