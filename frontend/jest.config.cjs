/** @type {import('jest').Config} */
const config = {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
	cacheDirectory: '<rootDir>/.jest-cache',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
	},
	transform: {
		'^.+\\.(ts|tsx)$': [
			'@swc/jest',
			{
				jsc: {
					parser: {
						syntax: 'typescript',
						tsx: true,
					},
					transform: {
						react: {
							runtime: 'automatic',
						},
					},
				},
			},
		],
	},
	collectCoverageFrom: [
		'app/**/*.{ts,tsx}',
		'components/**/*.{ts,tsx}',
		'hooks/**/*.{ts,tsx}',
		'lib/**/*.{ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!**/*.types.ts',
	],
	// Coverage threshold disabled temporarily - increase as more tests are added
	// coverageThreshold: {
	// 	global: {
	// 		branches: 50,
	// 		functions: 50,
	// 		lines: 50,
	// 		statements: 50,
	// 	},
	// },
	testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
	testPathIgnorePatterns: ['/node_modules/', '/.next/'],
	transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
	maxWorkers: process.env.CI ? 2 : '50%',
	testTimeout: 10000,
}

module.exports = config
