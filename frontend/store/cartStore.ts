// frontend/store/cartStore.ts
// 🛒 CART STORE - ZUSTAND

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
	id: string
	name: string
	price: number
	imageUrl: string
	quantity: number
}

interface CartStore {
	items: CartItem[]
	addItem: (product: Omit<CartItem, 'quantity'>) => void
	removeItem: (id: string) => void
	updateQuantity: (id: string, quantity: number) => void
	clearCart: () => void
	getTotalPrice: () => number
	getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],

			// Mahsulot qo'shish
			addItem: product => {
				set(state => {
					const existing = state.items.find(item => item.id === product.id)

					if (existing) {
						// Mavjud bo'lsa quantity +1
						return {
							items: state.items.map(item =>
								item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
							),
						}
					}

					// Yangi mahsulot
					return {
						items: [...state.items, { ...product, quantity: 1 }],
					}
				})
			},

			// Mahsulot o'chirish
			removeItem: id => {
				set(state => ({
					items: state.items.filter(item => item.id !== id),
				}))
			},

			// Quantity o'zgartirish
			updateQuantity: (id, quantity) => {
				if (quantity <= 0) {
					get().removeItem(id)
					return
				}

				set(state => ({
					items: state.items.map(item => (item.id === id ? { ...item, quantity } : item)),
				}))
			},

			// Savatchani tozalash
			clearCart: () => {
				set({ items: [] })
			},

			// Jami narx
			getTotalPrice: () => {
				return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
			},

			// Jami mahsulotlar soni
			getTotalItems: () => {
				return get().items.reduce((total, item) => total + item.quantity, 0)
			},
		}),
		{
			name: 'cart-storage', // localStorage key
		},
	),
)
