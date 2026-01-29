// frontend/__tests__/hooks/useDeals.test.tsx
// 🎁 DEALS HOOK TESTS
// Test useDeals hook for fetching and managing deals

import { useDeal, useDeals } from '@/hooks/useDeals'
import { api } from '@/lib/apiClient'
import { act, renderHook, waitFor } from '@testing-library/react'

// Mock API client
jest.mock('@/lib/apiClient', () => ({
	api: {
		get: jest.fn(),
	},
}))

const mockedApi = api as jest.Mocked<typeof api>

// Mock deal data
const mockDeals = [
	{
		id: 'deal-1',
		name: 'Pizza 50% OFF',
		description: 'Get 50% off on all pizzas',
		discountType: 'PERCENTAGE',
		discountValue: 50,
		startDate: new Date('2026-01-01').toISOString(),
		endDate: new Date('2026-12-31').toISOString(),
		isActive: true,
		priority: 1,
		usageLimit: 100,
		usageCount: 10,
		createdAt: new Date('2026-01-01').toISOString(),
		updatedAt: new Date('2026-01-01').toISOString(),
		items: [],
	},
	{
		id: 'deal-2',
		name: 'Buy 1 Get 1',
		description: 'Buy one pizza get one free',
		discountType: 'PERCENTAGE',
		discountValue: 100,
		startDate: new Date('2025-01-01').toISOString(),
		endDate: new Date('2025-12-31').toISOString(),
		isActive: false,
		priority: 2,
		usageLimit: null,
		usageCount: 0,
		createdAt: new Date('2025-01-01').toISOString(),
		updatedAt: new Date('2025-01-01').toISOString(),
		items: [],
	},
]

describe('useDeals Hook', () => {
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

	/**
	 * TEST 1: Fetch deals successfully
	 */
	it('should fetch deals successfully', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockDeals },
		})

		const { result } = renderHook(() => useDeals())

		// Initial state
		expect(result.current.loading).toBe(true)
		expect(result.current.deals).toEqual([])

		// Wait for fetch to complete
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.deals).toEqual(mockDeals)
		expect(result.current.error).toBeNull()
		expect(mockedApi.get).toHaveBeenCalledWith('/api/deals')
	})

	/**
	 * TEST 2: Filter active deals
	 */
	it('should filter active deals only', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockDeals },
		})

		const { result } = renderHook(() => useDeals({ isActive: true }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Only active deals (deal-1)
		expect(result.current.deals).toHaveLength(1)
		expect(result.current.deals[0].id).toBe('deal-1')
		expect(result.current.deals[0].isActive).toBe(true)
	})

	/**
	 * TEST 3: Filter available deals (date range)
	 */
	it('should filter deals available now', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockDeals },
		})

		const { result } = renderHook(() => useDeals({ availableNow: true }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Only deal-1 is currently valid (2026)
		expect(result.current.deals).toHaveLength(1)
		expect(result.current.deals[0].id).toBe('deal-1')
	})

	/**
	 * TEST 4: Filter by stock availability
	 */
	it('should filter deals with available stock', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockDeals },
		})

		const { result } = renderHook(() => useDeals({ hasStock: true }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// All deals have stock (deal-1: 10/100, deal-2: no limit)
		expect(result.current.deals.length).toBeGreaterThan(0)
	})

	/**
	 * TEST 5: Filter by minimum discount
	 */
	it('should filter deals by minimum discount', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockDeals },
		})

		const { result } = renderHook(() => useDeals({ minDiscount: 60 }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Only deal-2 has 100% discount (>= 60%)
		expect(result.current.deals).toHaveLength(1)
		expect(result.current.deals[0].discountValue).toBeGreaterThanOrEqual(60)
	})

	/**
	 * TEST 6: Sort by priority
	 */
	it('should sort deals by priority', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockDeals },
		})

		const { result } = renderHook(() => useDeals({ sortBy: 'priority' }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// deal-1 (priority 1) should be first
		expect(result.current.deals[0].priority).toBeLessThanOrEqual(
			result.current.deals[1]?.priority || 999,
		)
	})

	/**
	 * TEST 7: Handle API errors
	 */
	it('should handle fetch errors', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

		mockedApi.get.mockRejectedValueOnce(new Error('Network error'))

		const { result } = renderHook(() => useDeals())

		await waitFor(
			() => {
				expect(result.current.loading).toBe(false)
			},
			{ timeout: 3000 },
		)

		expect(result.current.error).toBeTruthy()
		expect(result.current.deals).toEqual([])

		consoleErrorSpy.mockRestore()
	})

	/**
	 * TEST 8: Cache functionality
	 */
	it('should use cached data if available', async () => {
		// Set up cache
		const cacheData = {
			data: mockDeals,
			timestamp: Date.now(),
		}
		localStorage.setItem('deals_cache', JSON.stringify(cacheData))

		const { result } = renderHook(() => useDeals())

		// Should load from cache immediately
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.deals).toEqual(mockDeals)
		// API should not be called
		expect(mockedApi.get).not.toHaveBeenCalled()
	})

	/**
	 * TEST 9: Auto-refresh every 5 minutes
	 */
	it('should auto-refresh deals every 5 minutes', async () => {
		mockedApi.get.mockResolvedValue({
			data: { success: true, data: mockDeals },
		})

		const { result } = renderHook(() => useDeals())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Initial call
		expect(mockedApi.get).toHaveBeenCalledTimes(1)

		// Fast-forward 5 minutes
		await act(async () => {
			jest.advanceTimersByTime(5 * 60 * 1000)
		})

		// Should call again (forced, bypassing cache)
		await waitFor(
			() => {
				expect(mockedApi.get).toHaveBeenCalledTimes(2)
			},
			{ timeout: 3000 },
		)
	})

	/**
	 * TEST 10: Refetch manually
	 */
	it('should refetch deals manually', async () => {
		mockedApi.get.mockResolvedValue({
			data: { success: true, data: mockDeals },
		})

		const { result } = renderHook(() => useDeals())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Initial call
		expect(mockedApi.get).toHaveBeenCalledTimes(1)

		// Manual refetch - should bypass cache
		await act(async () => {
			await result.current.refetch()
		})

		// Should call again
		// Should call again
		expect(mockedApi.get).toHaveBeenCalledTimes(2)
	})
})

// ============================================
// useDeal Hook Tests
// ============================================

describe('useDeal Hook', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	/**
	 * TEST 11: Fetch single deal by ID
	 */
	it('should fetch deal by ID', async () => {
		const mockDeal = mockDeals[0]
		mockedApi.get.mockResolvedValueOnce({
			data: { success: true, data: mockDeal },
		})

		const { result } = renderHook(() => useDeal('deal-1'))

		expect(result.current.loading).toBe(true)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.deal).toEqual(mockDeal)
		expect(result.current.error).toBeNull()
		expect(mockedApi.get).toHaveBeenCalledWith('/api/deals/deal-1')
	})

	/**
	 * TEST 12: Handle deal not found
	 */
	it('should handle deal not found', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

		mockedApi.get.mockRejectedValueOnce(new Error('Not found'))

		const { result } = renderHook(() => useDeal('deal-999'))

		await waitFor(
			() => {
				expect(result.current.loading).toBe(false)
			},
			{ timeout: 3000 },
		)

		expect(result.current.deal).toBeNull()
		expect(result.current.error).toBeTruthy()

		consoleErrorSpy.mockRestore()
	})

	/**
	 * TEST 13: Skip fetch if no dealId provided
	 */
	it('should not fetch if dealId is empty', async () => {
		const { result } = renderHook(() => useDeal(''))

		// Should stay in loading state
		expect(result.current.loading).toBe(true)
		expect(mockedApi.get).not.toHaveBeenCalled()
	})
})
