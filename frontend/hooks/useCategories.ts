// frontend/hooks/useCategories.ts
// 📂 PUBLIC CATEGORIES HOOK (User-facing)
// Faqat active kategoriyalarni fetch qiladi

'use client'

import { api } from '@/lib/apiClient'
import { Category, CategoryFilterOptions } from '@/types/category.types'
import { useCallback, useEffect, useState } from 'react'

/**
 * useCategories Hook
 * 
 * Public kategoriyalarni fetch qiladi va manage qiladi
 * Features:
 * - Cache support (5 minutes)
 * - Active categories only
 * - Product count included
 * - Smart filtering
 * 
 * @param options - Filter options
 * @returns categories, loading, error, refetch
 */
export function useCategories(options?: CategoryFilterOptions) {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Fetch categories from backend
	 */
	const fetchCategories = useCallback(async () => {
		// Check cache first (5 minutes TTL)
		const cacheKey = 'categories_cache'
		const cacheTTL = 5 * 60 * 1000 // 5 minutes
		
		if (typeof window !== 'undefined') {
			const cached = localStorage.getItem(cacheKey)
			if (cached) {
				try {
					const { data, timestamp } = JSON.parse(cached)
					const age = Date.now() - timestamp
					
					if (age < cacheTTL) {
						// Use cached data
						setCategories(data)
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

			const response = await api.get('/api/categories')
			let fetchedCategories: Category[] = response.data.data || []

			// ============================================
			// FILTERING
			// ============================================

			// 1. Filter by active status
			if (options?.isActive === true) {
				fetchedCategories = fetchedCategories.filter(cat => cat.isActive)
			}

			// 2. Filter by products (has products)
			if (options?.hasProducts) {
				fetchedCategories = fetchedCategories.filter(
					cat => (cat.productCount || 0) > 0
				)
			}

			// 3. Search by name
			if (options?.search) {
				const searchLower = options.search.toLowerCase()
				fetchedCategories = fetchedCategories.filter(cat =>
					cat.name.toLowerCase().includes(searchLower)
				)
			}

			// ============================================
			// SORTING
			// ============================================

			const sortBy = options?.sortBy || 'displayOrder'
			const sortOrder = options?.sortOrder || 'asc'

			fetchedCategories.sort((a, b) => {
				let comparison = 0

				switch (sortBy) {
					case 'name':
						comparison = a.name.localeCompare(b.name)
						break
					case 'displayOrder':
						comparison = (a.displayOrder || 999) - (b.displayOrder || 999)
						break
					case 'productCount':
						comparison = (b.productCount || 0) - (a.productCount || 0)
						break
					case 'createdAt':
						comparison =
							new Date(a.createdAt || 0).getTime() -
							new Date(b.createdAt || 0).getTime()
						break
				}

				return sortOrder === 'asc' ? comparison : -comparison
			})

			setCategories(fetchedCategories)

			// Cache the filtered results
			if (typeof window !== 'undefined') {
				try {
					const cacheData = {
						data: fetchedCategories,
						timestamp: Date.now(),
					}
					localStorage.setItem('categories_cache', JSON.stringify(cacheData))
				} catch (e) {
					// localStorage error, ignore
				}
			}
		} catch (err) {
			console.error('❌ Error fetching categories:', err)
			setError('Kategoriyalar yuklanmadi. Iltimos qayta urinib ko\'ring.')
		} finally {
			setLoading(false)
		}
	}, [options])

	/**
	 * Initial fetch
	 */
	useEffect(() => {
		fetchCategories()
	}, [fetchCategories])

	return {
		categories,
		loading,
		error,
		refetch: fetchCategories,
	}
}

/**
 * Get category by ID
 */
export function useCategory(categoryId: string) {
	const [category, setCategory] = useState<Category | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchCategory = async () => {
			try {
				setLoading(true)
				const response = await api.get(`/api/categories/${categoryId}`)
				setCategory(response.data.data)
			} catch (err) {
				console.error('❌ Error fetching category:', err)
				setError('Kategoriya topilmadi')
			} finally {
				setLoading(false)
			}
		}

		if (categoryId) {
			fetchCategory()
		}
	}, [categoryId])

	return { category, loading, error }
}
