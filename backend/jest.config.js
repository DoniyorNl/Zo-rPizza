/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: {
		'^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
	},
	roots: ['<rootDir>/src', '<rootDir>/tests'],
	testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/server.ts',
		'!src/**/*.types.ts',
		'!src/config/**',
	],
	// Coverage threshold lowered temporarily - increase as more tests are added
	// coverageThreshold: {
	// 	global: {
	// 		branches: 70,
	// 		functions: 70,
	// 		lines: 70,
	// 		statements: 70,
	// 	},
	// },
	setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
	testTimeout: 10000,
	verbose: true,
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
}
