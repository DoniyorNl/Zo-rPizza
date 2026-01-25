// =====================================
// 📁 FILE PATH: backend/tests/setup.ts
// 🧪 TEST SETUP & GLOBAL MOCKS
// =====================================

import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// =====================================
// 🗄️ PRISMA MOCK
// =====================================
jest.mock('../src/lib/prisma', () => ({
	__esModule: true,
	default: mockDeep<PrismaClient>(),
}))

export const prismaMock = require('../src/lib/prisma').default as DeepMockProxy<PrismaClient>

// =====================================
// 🔥 FIREBASE ADMIN MOCK
// =====================================
const mockAuth = {
	verifyIdToken: jest.fn(),
	getUser: jest.fn(),
	setCustomUserClaims: jest.fn(),
	createUser: jest.fn(),
	updateUser: jest.fn(),
	deleteUser: jest.fn(),
	listUsers: jest.fn(),
	getUserByEmail: jest.fn(),
}

jest.mock('../src/config/firebase', () => ({
	__esModule: true,
	auth: mockAuth,
	firestore: jest.fn(),
	default: {
		auth: () => mockAuth,
	},
}))

// =====================================
// 🧹 TEST LIFECYCLE HOOKS
// =====================================

beforeEach(() => {
	// Har bir test dan oldin barcha mocklarni tozalash
	jest.clearAllMocks()
	mockReset(prismaMock)
})

afterEach(() => {
	// Har bir test dan keyin cleanup
	jest.clearAllTimers()
})

afterAll(async () => {
	// ✅ MUHIM: Barcha open handlerlarni yopish
	try {
		await prismaMock.$disconnect()
	} catch (error) {
		console.error('Error disconnecting Prisma mock:', error)
	}

	// Timer va mocklarni tozalash
	jest.clearAllTimers()
	jest.clearAllMocks()
	jest.restoreAllMocks()
})

// =====================================
// 🏭 TEST DATA GENERATORS
// =====================================

export const generateMockUser = (overrides = {}) => ({
	id: 'test-user-id',
	email: 'test@example.com',
	name: 'Test User',
	phone: '+998901234567',
	password: null,
	firebaseUid: 'test-firebase-uid',
	role: 'CUSTOMER' as const,
	isBlocked: false,
	isDriver: false,
	driverStatus: null,
	currentLocation: null,
	vehicleType: null,
	vehicleNumber: null,
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
	orderNumber: 'ORD-001',
	userId: 'test-user-id',
	totalPrice: 100000,
	status: 'PENDING' as const,
	paymentMethod: 'CASH' as const,
	paymentStatus: 'PENDING' as const,
	deliveryAddress: 'Test Address',
	deliveryPhone: '+998901234567',
	deliveryLat: null,
	deliveryLng: null,
	driverId: null,
	deliveryLocation: null,
	driverLocation: null,
	estimatedTime: null,
	actualDistance: null,
	trackingStartedAt: null,
	deliveryStartedAt: null,
	deliveryCompletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

export const generateMockCategory = (overrides = {}) => ({
	id: 'test-category-id',
	name: 'Test Category',
	description: 'Test Category Description',
	imageUrl: 'https://example.com/category.jpg',
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

export const generateMockOrderItem = (overrides = {}) => ({
	id: 'test-order-item-id',
	orderId: 'test-order-id',
	productId: 'test-product-id',
	quantity: 1,
	price: 50000,
	size: 'MEDIUM',
	variationId: null,
	createdAt: new Date(),
	...overrides,
})

// =====================================
// 🔧 TEST HELPERS
// =====================================

/**
 * Mock authenticated request
 */
export const mockAuthRequest = (userId = 'test-user-id', role = 'CUSTOMER') => ({
	user: {
		uid: userId,
		email: 'test@example.com',
		role,
	},
	headers: {
		authorization: 'Bearer test-token',
	},
})

/**
 * Mock Firebase decoded token
 */
export const mockDecodedToken = (overrides = {}) => ({
	uid: 'test-firebase-uid',
	email: 'test@example.com',
	email_verified: true,
	role: 'CUSTOMER',
	...overrides,
})

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// =====================================
// 🌍 ENVIRONMENT VARIABLES
// =====================================
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-123'

// Database URL - faqat test environment uchun
if (!process.env.DATABASE_URL || process.env.NODE_ENV === 'test') {
	process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/zorpizza_test'
}

// Frontend URLs
process.env.FRONTEND_URLS = 'http://localhost:3000'

// Firebase (agar kerak bo'lsa)
process.env.FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY = 'test-private-key'

// =====================================
// 🎯 CONSOLE OVERRIDES (Optional)
// =====================================

// Test paytida console.error larni yashirish (optional)
const originalError = console.error
beforeAll(() => {
	console.error = jest.fn()
})

afterAll(() => {
	console.error = originalError
})
