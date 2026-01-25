// frontend/__tests__/hooks/useCategories.test.tsx
// 📂 CATEGORIES HOOK TESTS
// Test useCategories hook for fetching and managing categories

import { act, renderHook, waitFor } from '@testing-library/react'
import { useCategories, useCategory } from '@/hooks/useCategories'
import { api } from '@/lib/apiClient'

// Mock API client
jest.mock('@/lib/apiClient', () => ({
	api: {
		get: jest.fn(),
	},
}))

const mockedApi = api as jest.Mocked<typeof api>

// Mock category data
const mockCategories = [
	{
		id: 'cat-1',
		name: 'Pizza',
		description: 'Delicious pizzas',
		imageUrl: 'https://example.com/pizza.jpg',
		isActive: true,
		displayOrder: 1,
		productCount: 10,
		createdAt: new Date('2026-01-01').toISOString(),
		updatedAt: new Date('2026-01-01').toISOString(),
	},
	{
		id: 'cat-2',
		name: 'Burgers',
		description: 'Tasty burgers',
		imageUrl: 'https://example.com/burger.jpg',
		isActive: false,
		displayOrder: 2,
		productCount: 5,
		createdAt: new Date('2026-01-02').toISOString(),
		updatedAt: new Date('2026-01-02').toISOString(),
	},
	{
		id: 'cat-3',
		name: 'Pasta',
		description: 'Italian pasta',
		imageUrl: 'https://example.com/pasta.jpg',
		isActive: true,
		displayOrder: 3,
		productCount: 0,
		createdAt: new Date('2026-01-03').toISOString(),
		updatedAt: new Date('2026-01-03').toISOString(),
	},
]

describe('useCategories Hook', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		localStorage.clear()
	})

	/**
	 * TEST 1: Fetch categories successfully
	 */
	it('should fetch categories successfully', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() => useCategories())

		// Initial state
		expect(result.current.loading).toBe(true)
		expect(result.current.categories).toEqual([])

		// Wait for fetch to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.categories).toEqual(mockCategories)
		expect(result.current.error).toBeNull()
		expect(mockedApi.get).toHaveBeenCalledWith('/api/categories')
	})

	/**
	 * TEST 2: Filter active categories
	 */
	it('should filter active categories only', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() => useCategories({ isActive: true }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Only active categories (cat-1, cat-3)
		expect(result.current.categories).toHaveLength(2)
		expect(result.current.categories.every(cat => cat.isActive)).toBe(true)
	})

	/**
	 * TEST 3: Filter categories with products
	 */
	it('should filter categories with products', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() => useCategories({ hasProducts: true }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Only categories with products (cat-1, cat-2)
		expect(result.current.categories).toHaveLength(2)
		expect(result.current.categories.every(cat => (cat.productCount || 0) > 0)).toBe(true)
	})

	/**
	 * TEST 4: Search categories by name
	 */
	it('should search categories by name', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() => useCategories({ search: 'pizza' }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Only Pizza category
		expect(result.current.categories).toHaveLength(1)
		expect(result.current.categories[0].name).toBe('Pizza')
	})

	/**
	 * TEST 5: Sort by display order (default)
	 */
	it('should sort categories by display order', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() => useCategories({ sortBy: 'displayOrder' }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Should be ordered 1, 2, 3
		expect(result.current.categories[0].displayOrder).toBe(1)
		expect(result.current.categories[1].displayOrder).toBe(2)
		expect(result.current.categories[2].displayOrder).toBe(3)
	})

	/**
	 * TEST 6: Sort by name
	 */
	it('should sort categories by name', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() => useCategories({ sortBy: 'name' }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Alphabetical: Burgers, Pasta, Pizza
		expect(result.current.categories[0].name).toBe('Burgers')
		expect(result.current.categories[1].name).toBe('Pasta')
		expect(result.current.categories[2].name).toBe('Pizza')
	})

	/**
	 * TEST 7: Sort by product count
	 */
	it('should sort categories by product count', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() => useCategories({ sortBy: 'productCount' }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Descending: 10, 5, 0
		expect(result.current.categories[0].productCount).toBe(10)
		expect(result.current.categories[1].productCount).toBe(5)
		expect(result.current.categories[2].productCount).toBe(0)
	})

	/**
	 * TEST 8: Handle API errors
	 */
	it('should handle fetch errors', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
		
		mockedApi.get.mockRejectedValueOnce(new Error('Network error'))

		const { result } = renderHook(() => useCategories())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.error).toBeTruthy()
		expect(result.current.categories).toEqual([])
		
		consoleErrorSpy.mockRestore()
	})

	/**
	 * TEST 9: Cache functionality
	 */
	it('should use cached data if available', async () => {
		// Set up cache
		const cacheData = {
			data: mockCategories,
			timestamp: Date.now(),
		}
		localStorage.setItem('categories_cache', JSON.stringify(cacheData))

		const { result } = renderHook(() => useCategories())

		// Should load from cache immediately
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.categories).toEqual(mockCategories)
		// API should not be called
		expect(mockedApi.get).not.toHaveBeenCalled()
	})

	/**
	 * TEST 10: Expired cache should fetch fresh data
	 */
	it('should fetch fresh data if cache is expired', async () => {
		// Set up expired cache (6 minutes old)
		const cacheData = {
			data: mockCategories,
			timestamp: Date.now() - (6 * 60 * 1000),
		}
		localStorage.setItem('categories_cache', JSON.stringify(cacheData))

		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() => useCategories())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Should call API for fresh data
		expect(mockedApi.get).toHaveBeenCalledWith('/api/categories')
	})

	/**
	 * TEST 11: Refetch manually
	 */
	it('should refetch categories manually', async () => {
		mockedApi.get.mockResolvedValue({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() => useCategories())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Initial call
		expect(mockedApi.get).toHaveBeenCalledTimes(1)

		// Manual refetch
		await act(async () => {
			await result.current.refetch()
		})

		// Should call again
		expect(mockedApi.get).toHaveBeenCalledTimes(2)
	})

	/**
	 * TEST 12: Multiple filters combined
	 */
	it('should apply multiple filters', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategories },
		})

		const { result } = renderHook(() =>
			useCategories({
				isActive: true,
				hasProducts: true,
			})
		)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Only cat-1 (active AND has products)
		expect(result.current.categories).toHaveLength(1)
		expect(result.current.categories[0].id).toBe('cat-1')
	})
})

// ============================================
// useCategory Hook Tests
// ============================================

describe('useCategory Hook', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	/**
	 * TEST 13: Fetch single category by ID
	 */
	it('should fetch category by ID', async () => {
		const mockCategory = mockCategories[0]
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockCategory },
		})

		const { result } = renderHook(() => useCategory('cat-1'))

		expect(result.current.loading).toBe(true)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.category).toEqual(mockCategory)
		expect(result.current.error).toBeNull()
		expect(mockedApi.get).toHaveBeenCalledWith('/api/categories/cat-1')
	})

	/**
	 * TEST 14: Handle category not found
	 */
	it('should handle category not found', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
		
		mockedApi.get.mockRejectedValueOnce(new Error('Not found'))

		const { result } = renderHook(() => useCategory('cat-999'))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.category).toBeNull()
		expect(result.current.error).toBeTruthy()
		
		consoleErrorSpy.mockRestore()
	})

	/**
	 * TEST 15: Skip fetch if no categoryId provided
	 */
	it('should not fetch if categoryId is empty', async () => {
		const { result } = renderHook(() => useCategory(''))

		// Should stay in loading state
		expect(result.current.loading).toBe(true)
		expect(mockedApi.get).not.toHaveBeenCalled()
	})
})
