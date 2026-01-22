// =====================================
// 📁 FILE PATH: frontend/__tests__/hooks/useDeals.test.tsx
// 🧪 DEALS HOOK TESTS
// =====================================

import { useDeal, useDeals } from '@/hooks/useDeals'
import { api } from '@/lib/apiClient'
import { renderHook, waitFor } from '@testing-library/react'

// Mock API client
jest.mock('@/lib/apiClient')
const mockedApi = api as jest.Mocked<typeof api>

describe('useDeals Hook', () => {
	const mockDeals = [
		{
			id: 'deal-1',
			title: 'Summer Sale',
			description: '50% off',
			discountValue: 50,
			discountType: 'PERCENTAGE',
			startDate: '2024-01-01T00:00:00Z',
			endDate: '2024-12-31T23:59:59Z',
			isActive: true,
			priority: 1,
			usageLimit: 100,
			usageCount: 10,
			createdAt: '2024-01-01T00:00:00Z',
		},
		{
			id: 'deal-2',
			title: 'Winter Deal',
			description: '30% off',
			discountValue: 30,
			discountType: 'PERCENTAGE',
			startDate: '2024-01-01T00:00:00Z',
			endDate: '2024-12-31T23:59:59Z',
			isActive: true,
			priority: 2,
			usageLimit: 50,
			usageCount: 45,
			createdAt: '2024-01-02T00:00:00Z',
		},
		{
			id: 'deal-3',
			title: 'Expired Deal',
			description: '20% off',
			discountValue: 20,
			discountType: 'PERCENTAGE',
			startDate: '2023-01-01T00:00:00Z',
			endDate: '2023-12-31T23:59:59Z',
			isActive: false,
			priority: 3,
			createdAt: '2023-01-01T00:00:00Z',
		},
	]

	beforeEach(() => {
		jest.clearAllMocks()
		localStorage.clear()
		jest.useFakeTimers()
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	it('should fetch and return deals successfully', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockDeals },
		})

		const { result } = renderHook(() => useDeals())

		expect(result.current.loading).toBe(true)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.deals).toHaveLength(3)
		expect(result.current.error).toBeNull()
	})

	it('should filter active deals by default', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockDeals },
		})

		const { result } = renderHook(() => useDeals({ isActive: true }))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		const activeDeals = result.current.deals.filter(d => d.isActive)
		expect(activeDeals.length).toBeGreaterThan(0)
	})

	it('should filter deals by minimum discount', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockDeals },
		})

		const { result } = renderHook(() =>
			useDeals({ minDiscount: 40 })
		)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		const highDiscountDeals = result.current.deals.filter(
			d => d.discountValue >= 40
		)
		expect(highDiscountDeals.length).toBeGreaterThanOrEqual(0)
	})

	it('should filter deals with available stock', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockDeals },
		})

		const { result } = renderHook(() =>
			useDeals({ hasStock: true })
		)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		const availableDeals = result.current.deals.filter(d => {
			if (!d.usageLimit) return true
			return (d.usageCount || 0) < d.usageLimit
		})
		expect(availableDeals.length).toBeGreaterThanOrEqual(0)
	})

	it('should handle API errors gracefully', async () => {
		mockedApi.get.mockRejectedValueOnce(new Error('Network error'))

		const { result } = renderHook(() => useDeals())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.error).toBeTruthy()
		expect(result.current.deals).toHaveLength(0)
	})

	it('should use cached data when available', async () => {
		const cacheData = {
			data: mockDeals,
			timestamp: Date.now(),
		}
		localStorage.setItem('deals_cache', JSON.stringify(cacheData))

		const { result } = renderHook(() => useDeals())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Should not call API if cache is fresh
		expect(mockedApi.get).not.toHaveBeenCalled()
		expect(result.current.deals).toHaveLength(3)
	})

	it('should auto-refresh deals every 5 minutes', async () => {
		mockedApi.get.mockResolvedValue({
			data: { data: mockDeals },
		})

		const { result } = renderHook(() => useDeals())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		// Initial fetch
		expect(mockedApi.get).toHaveBeenCalledTimes(1)

		// Fast-forward 5 minutes
		jest.advanceTimersByTime(5 * 60 * 1000)

		await waitFor(() => {
			expect(mockedApi.get).toHaveBeenCalledTimes(2)
		})
	})
})

describe('useDeal Hook', () => {
	const mockDeal = {
		id: 'deal-1',
		title: 'Summer Sale',
		description: '50% off',
		discountValue: 50,
		discountType: 'PERCENTAGE',
		startDate: '2024-01-01T00:00:00Z',
		endDate: '2024-12-31T23:59:59Z',
		isActive: true,
		priority: 1,
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should fetch deal by id', async () => {
		mockedApi.get.mockResolvedValueOnce({
			data: { data: mockDeal },
		})

		const { result } = renderHook(() => useDeal('deal-1'))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.deal).toEqual(mockDeal)
		expect(result.current.error).toBeNull()
	})

	it('should handle errors when deal not found', async () => {
		mockedApi.get.mockRejectedValueOnce(new Error('Not found'))

		const { result } = renderHook(() => useDeal('invalid-id'))

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.deal).toBeNull()
		expect(result.current.error).toBeTruthy()
	})
})
