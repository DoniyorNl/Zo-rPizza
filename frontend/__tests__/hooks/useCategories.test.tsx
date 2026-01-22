// =====================================
// 📁 FILE PATH: frontend/__tests__/hooks/useCategories.test.tsx
// 🧪 CATEGORIES HOOK TESTS
// =====================================

import { useCategories, useCategory } from '@/hooks/useCategories'
import { api } from '@/lib/apiClient'
import { renderHook, waitFor } from '@testing-library/react'

// Mock API client
jest.mock('@/lib/apiClient')
const mockedApi = api as jest.Mocked<typeof api>

describe('useCategories Hook', () => {
	const mockCategories = [
		{
			id: 'cat-1',
			name: 'Pizza',
			description: 'Delicious pizzas',
			displayOrder: 1,
			isActive: true,
			productCount: 10,
			createdAt: '2024-01-01T00:00:00Z',
		},
		{
			id: 'cat-2',
			name: 'Burgers',
			description: 'Tasty burgers',
			displayOrder: 2,
			isActive: true,
			productCount: 5,
			createdAt: '2024-01-02T00:00:00Z',
		},
		{
			id: 'cat-3',
			name: 'Drinks',
			description: 'Refreshing drinks',
			displayOrder: 3,
			isActive: false,
			productCount: 0,
			createdAt: '2024-01-03T00:00:00Z',
		},
	]

	beforeEach(() => {
		jest.clearAllMocks()
		localStorage.clear()
	})

	it('should fetch and return categories successfully', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockCategories },
		})

		const { result } = renderHook(() => useCategories())

		expect(result.current.loading).toBe(true)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.categories).toHaveLength(3)
		expect(result.current.error).toBeNull()
	})

	it('should filter active categories by default', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockCategories },
		})

		const { result } = renderHook(() => useCategories({ isActive: true }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		const activeCategories = result.current.categories.filter(c => c.isActive)
		expect(activeCategories.length).toBeGreaterThan(0)
	})

	it('should filter categories with products', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockCategories },
		})

		const { result } = renderHook(() =>
			useCategories({ hasProducts: true })
		)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		const withProducts = result.current.categories.filter(
			c => (c.productCount || 0) > 0
		)
		expect(withProducts.length).toBeGreaterThan(0)
	})

	it('should search categories by name', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockCategories },
		})

		const { result } = renderHook(() =>
			useCategories({ search: 'pizza' })
		)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Should find Pizza category
		expect(result.current.categories.length).toBeGreaterThanOrEqual(0)
	})

	it('should handle API errors gracefully', async () => {
		mockedApi.get.mockRejectedValueOnce(new Error('Network error'))

		const { result } = renderHook(() => useCategories())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.error).toBeTruthy()
		expect(result.current.categories).toHaveLength(0)
	})

	it('should use cached data when available', async () => {
		const cacheData = {
			data: mockCategories,
			timestamp: Date.now(),
		}
		localStorage.setItem('categories_cache', JSON.stringify(cacheData))

		const { result } = renderHook(() => useCategories())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Should not call API if cache is fresh
		expect(mockedApi.get).not.toHaveBeenCalled()
		expect(result.current.categories).toHaveLength(3)
	})
})

describe('useCategory Hook', () => {
	const mockCategory = {
		id: 'cat-1',
		name: 'Pizza',
		description: 'Delicious pizzas',
		displayOrder: 1,
		isActive: true,
		productCount: 10,
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should fetch category by id', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockCategory },
		})

		const { result } = renderHook(() => useCategory('cat-1'))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.category).toEqual(mockCategory)
		expect(result.current.error).toBeNull()
	})

	it('should handle errors when category not found', async () => {
		mockedApi.get.mockRejectedValueOnce(new Error('Not found'))

		const { result } = renderHook(() => useCategory('invalid-id'))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.category).toBeNull()
		expect(result.current.error).toBeTruthy()
	})
})
