module.exports = {
    collectCoverage: true,
    roots: [
        "<rootDir>/src"
    ],
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx)",
        "**/?(*.)+(spec|test).+(ts|tsx)"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
};
