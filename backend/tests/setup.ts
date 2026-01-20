// =====================================
// 📁 FILE PATH: backend/tests/setup.ts
// 🧪 TEST SETUP & GLOBAL MOCKS
// =====================================

import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Mock Prisma Client
jest.mock('../src/lib/prisma', () => ({
	__esModule: true,
	default: mockDeep<PrismaClient>(),
}))

// Mock Firebase Admin
jest.mock('../src/config/firebase', () => ({
	auth: {
		verifyIdToken: jest.fn(),
		getUser: jest.fn(),
		setCustomUserClaims: jest.fn(),
		createUser: jest.fn(),
		updateUser: jest.fn(),
		deleteUser: jest.fn(),
		listUsers: jest.fn(),
		getUserByEmail: jest.fn(),
	},
}))

beforeEach(() => {
	// Reset mocks before each test
	mockReset(prismaMock)
})

// Global test helpers
export const prismaMock = require('../src/lib/prisma').default as DeepMockProxy<PrismaClient>

// Test data generators
export const generateMockUser = (overrides = {}) => ({
	id: 'test-user-id',
	email: 'test@example.com',
	name: 'Test User',
	phone: '+998901234567',
	password: null,
	role: 'CUSTOMER' as const,
	isBlocked: false,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

export const generateMockProduct = (overrides = {}) => ({
	id: 'test-product-id',
	name: 'Test Pizza',
	description: 'Test Description',
	basePrice: 50000,
	imageUrl: 'https://example.com/pizza.jpg',
	prepTime: 30,
	categoryId: 'test-category-id',
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	allergens: [],
	images: [],
	calories: 500,
	protein: 20,
	carbs: 60,
	fat: 15,
	...overrides,
})

export const generateMockOrder = (overrides = {}) => ({
	id: 'test-order-id',
	userId: 'test-user-id',
	totalAmount: 100000,
	status: 'PENDING' as const,
	paymentMethod: 'CASH' as const,
	paymentStatus: 'PENDING' as const,
	deliveryAddress: 'Test Address',
	deliveryPhone: '+998901234567',
	notes: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

// Environment variables for tests
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.FRONTEND_URLS = 'http://localhost:3000'
