// frontend/lib/favorites.ts
// ❤️ FAVORITES - Save favorite products

import { api } from './apiClient'

export interface FavoriteProduct {
	id: string
	name: string
	basePrice: number
	imageUrl: string | null
	category?: {
		name: string
	}
}

/**
 * Get user's favorite products
 */
export const getFavorites = async (): Promise<string[]> => {
	try {
		const response = await api.get('/api/profile')
		const favoriteProducts = response.data.data?.favoriteProducts

		if (Array.isArray(favoriteProducts)) {
			return favoriteProducts
		}

		// If stored as JSON string
		if (typeof favoriteProducts === 'string') {
			return JSON.parse(favoriteProducts)
		}

		return []
	} catch (error) {
		console.error('❌ [FAVORITES] Get error:', error)
		return []
	}
}

/**
 * Add product to favorites
 */
export const addToFavorites = async (productId: string): Promise<boolean> => {
	try {
		const favorites = await getFavorites()

		if (favorites.includes(productId)) {
			console.log('⚠️  [FAVORITES] Already in favorites')
			return true
		}

		const newFavorites = [...favorites, productId]

		await api.patch('/api/profile', {
			favoriteProducts: newFavorites,
		})

		console.log('✅ [FAVORITES] Added:', productId)
		return true
	} catch (error) {
		console.error('❌ [FAVORITES] Add error:', error)
		return false
	}
}

/**
 * Remove product from favorites
 */
export const removeFromFavorites = async (productId: string): Promise<boolean> => {
	try {
		const favorites = await getFavorites()
		const newFavorites = favorites.filter(id => id !== productId)

		await api.patch('/api/profile', {
			favoriteProducts: newFavorites,
		})

		console.log('✅ [FAVORITES] Removed:', productId)
		return true
	} catch (error) {
		console.error('❌ [FAVORITES] Remove error:', error)
		return false
	}
}

/**
 * Toggle favorite
 */
export const toggleFavorite = async (productId: string): Promise<boolean> => {
	const favorites = await getFavorites()
	const isFavorite = favorites.includes(productId)

	if (isFavorite) {
		return await removeFromFavorites(productId)
	} else {
		return await addToFavorites(productId)
	}
}

/**
 * Get favorite products with details
 */
export const getFavoriteProductsWithDetails = async (): Promise<FavoriteProduct[]> => {
	try {
		const favoriteIds = await getFavorites()

		if (favoriteIds.length === 0) {
			return []
		}

		// Fetch product details
		const response = await api.get('/api/products', {
			params: {
				ids: favoriteIds.join(','),
			},
		})

		return response.data.data || []
	} catch (error) {
		console.error('❌ [FAVORITES] Get details error:', error)
		return []
	}
}
