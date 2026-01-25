// frontend/hooks/usePopularProducts.ts
// ⭐ POPULAR PRODUCTS HOOK
// Top selling yoki trending products

'use client'

import { api } from '@/lib/apiClient'
import { useCallback, useEffect, useState } from 'react'

/**
 * Product interface (minimal)
 */
interface Product {
	id: string
	name: string
	description: string
	basePrice: number
	imageUrl: string
	prepTime: number
	difficulty?: string
	calories?: number
	isActive: boolean
	variations?: {
		id: string
		size: string
		price: number
	}[]
	_count?: {
		orderItems?: number
	}
}

/**
 * usePopularProducts Hook
 * 
 * Eng mashhur mahsulotlarni fetch qiladi
 * Features:
 * - Top selling products
 * - Active products only
 * - Configurable limit
 * - Auto-refresh
 * 
 * @param limit - Maximum number of products (default: 6)
 * @returns popularProducts, loading, error, refetch
 */
export function usePopularProducts(limit: number = 6) {
	const [popularProducts, setPopularProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Fetch popular products
	 */
	const fetchPopularProducts = useCallback(async (force = false) => {
		// Check cache first (10 minutes TTL)
		const cacheKey = 'popular_products_cache'
		const cacheTTL = 10 * 60 * 1000 // 10 minutes
		
		if (!force && typeof window !== 'undefined') {
			const cached = localStorage.getItem(cacheKey)
			if (cached) {
				try {
					const { data, timestamp } = JSON.parse(cached)
					const age = Date.now() - timestamp
					
					if (age < cacheTTL) {
						// Use cached data
						setPopularProducts(data)
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

			// Fetch all products
			const response = await api.get('/api/products')
			let products: Product[] = response.data.data || []

			// Filter: active only
			products = products.filter(p => p.isActive)

			// Sort by order count (if available) or randomly
			// NOTE: Backend should provide order count
			if (products.length > 0 && products[0]._count?.orderItems !== undefined) {
				// Sort by popularity (order count)
				products.sort((a, b) => {
					const aCount = a._count?.orderItems || 0
					const bCount = b._count?.orderItems || 0
					return bCount - aCount
				})
			} else {
				// Random shuffle (fallback if no order count)
				products = products.sort(() => Math.random() - 0.5)
			}

			// Take top N
			const topProducts = products.slice(0, limit)

			setPopularProducts(topProducts)

			// Cache the results
			if (typeof window !== 'undefined') {
				try {
					const cacheData = {
						data: topProducts,
						timestamp: Date.now(),
					}
					localStorage.setItem('popular_products_cache', JSON.stringify(cacheData))
				} catch (e) {
					// localStorage error, ignore
				}
			}
		} catch (err) {
			console.error('❌ Error fetching popular products:', err)
			setError('Mashhur mahsulotlar yuklanmadi.')
		} finally {
			setLoading(false)
		}
	}, [limit])

	/**
	 * Initial fetch
	 */
	useEffect(() => {
		fetchPopularProducts()
	}, [fetchPopularProducts])

	/**
	 * Auto-refresh every 10 minutes
	 */
	useEffect(() => {
		const interval = setInterval(() => {
			fetchPopularProducts(true) // Force refresh
		}, 10 * 60 * 1000) // 10 minutes

		return () => clearInterval(interval)
	}, [fetchPopularProducts])

	return {
		popularProducts,
		loading,
		error,
		refetch: () => fetchPopularProducts(true), // Force refresh
	}
}
