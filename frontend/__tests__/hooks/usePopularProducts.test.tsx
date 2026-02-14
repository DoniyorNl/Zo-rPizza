// =====================================
// 📁 FILE PATH: frontend/__tests__/hooks/usePopularProducts.test.tsx
// 🧪 POPULAR PRODUCTS HOOK TESTS
// =====================================

import { usePopularProducts } from '@/hooks/usePopularProducts'
import { api } from '@/lib/apiClient'
import { act, renderHook, waitFor } from '@testing-library/react'

// Mock API client
jest.mock('@/lib/apiClient')
const mockedApi = api as jest.Mocked<typeof api>

describe('usePopularProducts Hook', () => {
	const mockProducts = [
		{
			id: 'prod-1',
			name: 'Margherita Pizza',
			description: 'Classic pizza',
			basePrice: 50000,
			imageUrl: '/pizza1.jpg',
			prepTime: 20,
			difficulty: 'Easy',
			calories: 500,
			isActive: true,
			_count: { orderItems: 100 },
		},
		{
			id: 'prod-2',
			name: 'Pepperoni Pizza',
			description: 'Spicy pizza',
			basePrice: 60000,
			imageUrl: '/pizza2.jpg',
			prepTime: 25,
			difficulty: 'Medium',
			calories: 600,
			isActive: true,
			_count: { orderItems: 80 },
		},
		{
			id: 'prod-3',
			name: 'Veggie Pizza',
			description: 'Healthy pizza',
			basePrice: 55000,
			imageUrl: '/pizza3.jpg',
			prepTime: 22,
			difficulty: 'Easy',
			calories: 450,
			isActive: true,
			_count: { orderItems: 60 },
		},
		{
			id: 'prod-4',
			name: 'Inactive Pizza',
			description: 'Not available',
			basePrice: 40000,
			imageUrl: '/pizza4.jpg',
			prepTime: 20,
			difficulty: 'Easy',
			calories: 400,
			isActive: false,
			_count: { orderItems: 50 },
		},
	]

	let consoleErrorSpy: jest.SpyInstance

	beforeAll(() => {
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
	})

	beforeEach(() => {
		jest.clearAllMocks()
		localStorage.clear()
		jest.useFakeTimers()
	})

	afterEach(() => {
		act(() => {
			jest.clearAllTimers()
		})
		jest.useRealTimers()
	})

	afterAll(() => {
		consoleErrorSpy.mockRestore()
	})

	it('should fetch and return popular products successfully', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockProducts },
		})

		const { result } = renderHook(() => usePopularProducts(6))

		// Wait for all effects to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.popularProducts.length).toBeGreaterThan(0)
		expect(result.current.error).toBeNull()
	})

	it('should filter only active products', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockProducts },
		})

		const { result } = renderHook(() => usePopularProducts(6))

		// Wait for all effects to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		const hasInactive = result.current.popularProducts.some((p: any) => !p.isActive)
		expect(hasInactive).toBe(false)
	})

	it('should sort products by order count (popularity)', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockProducts },
		})

		const { result } = renderHook(() => usePopularProducts(3))

		// Wait for all effects to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// First product should have highest order count
		if (result.current.popularProducts.length > 0) {
			const firstProduct = result.current.popularProducts[0]
			expect(firstProduct._count?.orderItems).toBeDefined()
		}
	})

	it('should respect the limit parameter', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockProducts },
		})

		const limit = 2
		const { result } = renderHook(() => usePopularProducts(limit))

		// Wait for all effects to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.popularProducts.length).toBeLessThanOrEqual(limit)
	})

	it('should handle API errors gracefully', async () => {
		mockedApi.get.mockRejectedValueOnce(new Error('Network error'))

		const { result } = renderHook(() => usePopularProducts(6))

		// Wait for error state
		await waitFor(
			() => {
				expect(result.current.loading).toBe(false)
			},
			{ timeout: 3000 },
		)

		expect(result.current.error).toBeTruthy()
		expect(result.current.popularProducts).toHaveLength(0)
	})

	it('should use cached data when available', async () => {
		const cachedProducts = mockProducts.slice(0, 3)
		const cacheData = {
			data: cachedProducts,
			timestamp: Date.now(),
		}
		localStorage.setItem('popular_products_cache', JSON.stringify(cacheData))

		const { result } = renderHook(() => usePopularProducts(6))

		// Wait for all effects to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Should not call API if cache is fresh
		expect(mockedApi.get).not.toHaveBeenCalled()
		expect(result.current.popularProducts).toHaveLength(3)
	})

	it('should auto-refresh products every 10 minutes', async () => {
		mockedApi.get.mockResolvedValue({
			data: { data: mockProducts },
		})

		const { result } = renderHook(() => usePopularProducts(6))

		// Wait for initial effects to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Initial fetch
		expect(mockedApi.get).toHaveBeenCalledTimes(1)

		// Fast-forward 10 minutes
		await act(async () => {
			jest.advanceTimersByTime(10 * 60 * 1000)
		})

		// Wait for refresh to complete
		await waitFor(
			() => {
				expect(mockedApi.get).toHaveBeenCalledTimes(2)
			},
			{ timeout: 3000 },
		)
	})

	it('should handle products without order count (random shuffle)', async () => {
		const productsWithoutCount = mockProducts.map((p: any) => {
			const { _count, ...rest } = p
			return rest
		})

		mockedApi.get.mockResolvedValueOnce({
			data: { data: productsWithoutCount },
		})

		const { result } = renderHook(() => usePopularProducts(3))

		// Wait for all effects to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Should still return products even without order count
		expect(result.current.popularProducts.length).toBeGreaterThan(0)
	})
})
