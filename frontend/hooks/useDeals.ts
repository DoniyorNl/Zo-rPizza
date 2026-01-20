// frontend/hooks/useDeals.ts
// 🎁 PUBLIC DEALS HOOK (User-facing)
// Admin deals hook'dan farqi: faqat active va valid deals

'use client'

import { api } from '@/lib/apiClient'
import { Deal, DealFilterOptions } from '@/types/deal.types'
import { useCallback, useEffect, useState } from 'react'

/**
 * useDeals Hook
 * 
 * Public deals'ni fetch qiladi va manage qiladi
 * Features:
 * - Auto-refresh (5 minutes)
 * - Active deals only
 * - Date validation
 * - Cache support
 * 
 * @param options - Filter options
 * @returns deals, loading, error, refetch
 */
export function useDeals(options?: DealFilterOptions) {
	const [deals, setDeals] = useState<Deal[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Fetch deals from backend
	 */
	const fetchDeals = useCallback(async () => {
		// Check cache first (5 minutes TTL)
		const cacheKey = 'deals_cache'
		const cacheTTL = 5 * 60 * 1000 // 5 minutes
		
		if (typeof window !== 'undefined') {
			const cached = localStorage.getItem(cacheKey)
			if (cached) {
				try {
					const { data, timestamp } = JSON.parse(cached)
					const age = Date.now() - timestamp
					
					if (age < cacheTTL) {
						// Use cached data
						setDeals(data)
						setLoading(false)
						return
					}
				} catch (e) {
					// Invalid cache, continue to fetch
				}
			}
		}

		try {
			setLoading(true)
			setError(null)

			const response = await api.get('/api/deals')
			let fetchedDeals: Deal[] = response.data.data || []

			// ============================================
			// FILTERING
			// ============================================

			// 1. Filter by active status
			if (options?.isActive !== false) {
				fetchedDeals = fetchedDeals.filter(deal => deal.isActive)
			}

			// 2. Filter by date (available now)
			if (options?.availableNow !== false) {
				const now = new Date()
				fetchedDeals = fetchedDeals.filter(deal => {
					const startDate = new Date(deal.startDate)
					const endDate = new Date(deal.endDate)
					return now >= startDate && now <= endDate
				})
			}

			// 3. Filter by usage limit
			if (options?.hasStock !== false) {
				fetchedDeals = fetchedDeals.filter(deal => {
					if (!deal.usageLimit) return true
					return (deal.usageCount || 0) < deal.usageLimit
				})
			}

			// 4. Filter by minimum discount
			if (options?.minDiscount) {
				fetchedDeals = fetchedDeals.filter(
					deal => deal.discountValue >= options.minDiscount!
				)
			}

			// ============================================
			// SORTING
			// ============================================

			const sortBy = options?.sortBy || 'priority'
			const sortOrder = options?.sortOrder || 'asc'

			fetchedDeals.sort((a, b) => {
				let comparison = 0

				switch (sortBy) {
					case 'priority':
						comparison = (a.priority || 999) - (b.priority || 999)
						break
					case 'discount':
						comparison = b.discountValue - a.discountValue
						break
					case 'endDate':
						comparison =
							new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
						break
					case 'createdAt':
						comparison =
							new Date(a.createdAt || 0).getTime() -
							new Date(b.createdAt || 0).getTime()
						break
				}

				return sortOrder === 'asc' ? comparison : -comparison
			})

			setDeals(fetchedDeals)

			// Cache the results
			if (typeof window !== 'undefined') {
				try {
					const cacheData = {
						data: fetchedDeals,
						timestamp: Date.now(),
					}
					localStorage.setItem('deals_cache', JSON.stringify(cacheData))
				} catch (e) {
					// localStorage error, ignore
				}
			}
		} catch (err) {
			console.error('❌ Error fetching deals:', err)
			setError('Aksiyalar yuklanmadi. Iltimos qayta urinib ko\'ring.')
		} finally {
			setLoading(false)
		}
	}, []) // Remove options dependency

	/**
	 * Initial fetch
	 */
	useEffect(() => {
		fetchDeals()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run once on mount

	/**
	 * Auto-refresh every 5 minutes
	 */
	useEffect(() => {
		const interval = setInterval(() => {
			fetchDeals()
		}, 5 * 60 * 1000) // 5 minutes

		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		deals,
		loading,
		error,
		refetch: fetchDeals,
	}
}

/**
 * Get deal by ID
 */
export function useDeal(dealId: string) {
	const [deal, setDeal] = useState<Deal | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchDeal = async () => {
			try {
				setLoading(true)
				const response = await api.get(`/api/deals/${dealId}`)
				setDeal(response.data.data)
			} catch (err) {
				console.error('❌ Error fetching deal:', err)
				setError('Aksiya topilmadi')
			} finally {
				setLoading(false)
			}
		}

		if (dealId) {
			fetchDeal()
		}
	}, [dealId])

	return { deal, loading, error }
}
