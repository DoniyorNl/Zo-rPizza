// =====================================
// 📁 FILE PATH: frontend/jest.setup.cjs
// 🧪 JEST SETUP FOR FRONTEND TESTS
// =====================================

require('@testing-library/jest-dom')

// Mock Next.js router
jest.mock('next/navigation', () => ({
	useRouter() {
		return {
			push: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn(),
			back: jest.fn(),
			pathname: '/',
			query: {},
			asPath: '/',
			refresh: jest.fn(),
		}
	},
	usePathname() {
		return '/'
	},
	useSearchParams() {
		return new URLSearchParams()
	},
}))

// Mock Firebase
jest.mock('./lib/firebase', () => ({
	auth: {
		currentUser: null,
		onAuthStateChanged: jest.fn(),
		signInWithEmailAndPassword: jest.fn(),
		createUserWithEmailAndPassword: jest.fn(),
		signOut: jest.fn(),
	},
}))

// Mock localStorage
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation(query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	takeRecords() {
		return []
	}
	unobserve() {}
}

// Mock fetch to avoid noisy warnings in tests
global.fetch = jest.fn().mockResolvedValue({
	ok: true,
	json: async () => ({}),
})

// Suppress console errors in tests (optional)
// global.console.error = jest.fn()
