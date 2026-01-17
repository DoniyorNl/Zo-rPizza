// frontend/store/cartStore.ts
// 🛒 CART STORE - ZUSTAND (Updated with Variations Support)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================
// TYPES & INTERFACES
// ============================================

interface CartItem {
	id: string // ✅ Unique ID (productId-variationId)
	productId: string // ✅ NEW: Product ID
	variationId: string // ✅ NEW: Variation ID
	name: string
	size: string // ✅ NEW: Size ("Small", "Medium", "Large", "XL")
	price: number
	imageUrl: string
	quantity: number
	addedToppingIds: string[]
	removedToppingIds: string[]
	halfProductId?: string
	halfProductName?: string
}

interface CartStore {
	items: CartItem[]
	addItem: (product: Omit<CartItem, 'id' | 'quantity'>) => void // ✅ Updated
	removeItem: (id: string) => void
	updateQuantity: (id: string, quantity: number) => void
	clearCart: () => void
	getTotalPrice: () => number
	getTotalItems: () => number
}

// ============================================
// STORE
// ============================================

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],

			// ============================================
			// ADD ITEM (Updated with Variations)
			// ============================================
			addItem: product => {
				set(state => {
					const addedKey = product.addedToppingIds.join(',')
					const removedKey = product.removedToppingIds.join(',')
					const halfKey = product.halfProductId || 'single'
					const itemId = `${product.productId}-${product.variationId}-${halfKey}-${addedKey}-${removedKey}`
					const existing = state.items.find(item => item.id === itemId)

					if (existing) {
						// Mavjud bo'lsa quantity +1
						return {
							items: state.items.map(item =>
								item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
							),
						}
					}

					// Yangi mahsulot (with unique ID)
					return {
						items: [
							...state.items,
							{
								...product,
								id: itemId, // ✅ Set unique ID
								quantity: 1,
							},
						],
					}
				})
			},

			// ============================================
			// REMOVE ITEM
			// ============================================
			removeItem: id => {
				set(state => ({
					items: state.items.filter(item => item.id !== id),
				}))
			},

			// ============================================
			// UPDATE QUANTITY
			// ============================================
			updateQuantity: (id, quantity) => {
				if (quantity <= 0) {
					get().removeItem(id)
					return
				}

				set(state => ({
					items: state.items.map(item => (item.id === id ? { ...item, quantity } : item)),
				}))
			},

			// ============================================
			// CLEAR CART
			// ============================================
			clearCart: () => {
				set({ items: [] })
			},

			// ============================================
			// GET TOTAL PRICE
			// ============================================
			getTotalPrice: () => {
				return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
			},

			// ============================================
			// GET TOTAL ITEMS
			// ============================================
			getTotalItems: () => {
				return get().items.reduce((total, item) => total + item.quantity, 0)
			},
		}),
		{
			name: 'cart-storage', // localStorage key
		},
	),
)
