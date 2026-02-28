// frontend/__tests__/store/cartStore.test.ts
// 🛒 CART STORE TESTS - Senior Level Best Practices

import { act, renderHook } from '@testing-library/react'
import { useCartStore } from '@/store/cartStore'

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockCartItem = (overrides: Record<string, unknown> = {}) => ({
	productId: 'product-1',
	variationId: 'variation-1',
	name: 'Pepperoni Pizza',
	size: 'Medium',
	price: 50000,
	imageUrl: 'https://example.com/pizza.jpg',
	addedToppingIds: [],
	removedToppingIds: [],
	...overrides,
})

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

describe('Cart Store (Zustand)', () => {
	beforeEach(() => {
		// Clear store before each test
		act(() => {
			useCartStore.getState().clearCart()
		})
		// Clear localStorage
		localStorage.clear()
	})

	afterEach(() => {
		localStorage.clear()
	})

	// ========================================================================
	// Initial State Tests
	// ========================================================================
	describe('Initial State', () => {
		it('should have empty cart on initialization', () => {
			const { result } = renderHook(() => useCartStore())

			expect(result.current.items).toEqual([])
			expect(result.current.getTotalItems()).toBe(0)
			expect(result.current.getTotalPrice()).toBe(0)
		})
	})

	// ========================================================================
	// addItem Tests
	// ========================================================================
	describe('addItem', () => {
		it('should add new item to cart', () => {
			const { result } = renderHook(() => useCartStore())
			const product = generateMockCartItem()

			act(() => {
				result.current.addItem(product)
			})

			expect(result.current.items).toHaveLength(1)
			expect(result.current.items[0]).toMatchObject({
				productId: 'product-1',
				variationId: 'variation-1',
				name: 'Pepperoni Pizza',
				size: 'Medium',
				price: 50000,
				quantity: 1,
			})
		})

		it('should generate unique ID for cart item', () => {
			const { result } = renderHook(() => useCartStore())
			const product = generateMockCartItem()

			act(() => {
				result.current.addItem(product)
			})

			const item = result.current.items[0]
			expect(item.id).toBeDefined()
			expect(item.id).toContain(product.productId)
			expect(item.id).toContain(product.variationId)
		})

		it('should increment quantity for duplicate items', () => {
			const { result } = renderHook(() => useCartStore())
			const product = generateMockCartItem()

			act(() => {
				result.current.addItem(product)
				result.current.addItem(product)
				result.current.addItem(product)
			})

			expect(result.current.items).toHaveLength(1)
			expect(result.current.items[0].quantity).toBe(3)
		})

		it('should treat items with different toppings as separate', () => {
			const { result } = renderHook(() => useCartStore())

			const product1 = generateMockCartItem({
				addedToppingIds: ['topping-1'],
			})

			const product2 = generateMockCartItem({
				addedToppingIds: ['topping-2'],
			})

			act(() => {
				result.current.addItem(product1)
				result.current.addItem(product2)
			})

			expect(result.current.items).toHaveLength(2)
			expect(result.current.items[0].addedToppingIds).toEqual(['topping-1'])
			expect(result.current.items[1].addedToppingIds).toEqual(['topping-2'])
		})

		it('should treat items with different variations as separate', () => {
			const { result } = renderHook(() => useCartStore())

			const smallPizza = generateMockCartItem({
				variationId: 'var-small',
				size: 'Small',
				price: 40000,
			})

			const largePizza = generateMockCartItem({
				variationId: 'var-large',
				size: 'Large',
				price: 60000,
			})

			act(() => {
				result.current.addItem(smallPizza)
				result.current.addItem(largePizza)
			})

			expect(result.current.items).toHaveLength(2)
			expect(result.current.items[0].size).toBe('Small')
			expect(result.current.items[1].size).toBe('Large')
		})

		it('should handle half-and-half pizzas correctly', () => {
			const { result } = renderHook(() => useCartStore())

			const halfPizza = generateMockCartItem({
				halfProductId: 'product-2',
				halfProductName: 'Margherita',
			})

			act(() => {
				result.current.addItem(halfPizza)
			})

			expect(result.current.items).toHaveLength(1)
			expect(result.current.items[0].halfProductId).toBe('product-2')
			expect(result.current.items[0].halfProductName).toBe('Margherita')
		})

		it('should handle removed toppings', () => {
			const { result } = renderHook(() => useCartStore())

			const productWithRemovedToppings = generateMockCartItem({
				removedToppingIds: ['topping-1', 'topping-2'],
			})

			act(() => {
				result.current.addItem(productWithRemovedToppings)
			})

			expect(result.current.items[0].removedToppingIds).toEqual(['topping-1', 'topping-2'])
		})
	})

	// ========================================================================
	// removeItem Tests
	// ========================================================================
	describe('removeItem', () => {
		it('should remove item from cart', () => {
			const { result } = renderHook(() => useCartStore())
			const product = generateMockCartItem()

			act(() => {
				result.current.addItem(product)
			})

			const itemId = result.current.items[0].id

			act(() => {
				result.current.removeItem(itemId)
			})

			expect(result.current.items).toHaveLength(0)
		})

		it('should remove only specified item', () => {
			const { result } = renderHook(() => useCartStore())

			const product1 = generateMockCartItem({ productId: 'product-1' })
			const product2 = generateMockCartItem({ productId: 'product-2' })

			act(() => {
				result.current.addItem(product1)
				result.current.addItem(product2)
			})

			const itemId1 = result.current.items[0].id

			act(() => {
				result.current.removeItem(itemId1)
			})

			expect(result.current.items).toHaveLength(1)
			expect(result.current.items[0].productId).toBe('product-2')
		})

		it('should handle removing non-existent item gracefully', () => {
			const { result } = renderHook(() => useCartStore())

			act(() => {
				result.current.removeItem('non-existent-id')
			})

			expect(result.current.items).toHaveLength(0)
		})
	})

	// ========================================================================
	// updateQuantity Tests
	// ========================================================================
	describe('updateQuantity', () => {
		it('should update item quantity', () => {
			const { result } = renderHook(() => useCartStore())
			const product = generateMockCartItem()

			act(() => {
				result.current.addItem(product)
			})

			const itemId = result.current.items[0].id

			act(() => {
				result.current.updateQuantity(itemId, 5)
			})

			expect(result.current.items[0].quantity).toBe(5)
		})

		it('should remove item if quantity is 0', () => {
			const { result } = renderHook(() => useCartStore())
			const product = generateMockCartItem()

			act(() => {
				result.current.addItem(product)
			})

			const itemId = result.current.items[0].id

			act(() => {
				result.current.updateQuantity(itemId, 0)
			})

			expect(result.current.items).toHaveLength(0)
		})

		it('should remove item if quantity is negative', () => {
			const { result } = renderHook(() => useCartStore())
			const product = generateMockCartItem()

			act(() => {
				result.current.addItem(product)
			})

			const itemId = result.current.items[0].id

			act(() => {
				result.current.updateQuantity(itemId, -5)
			})

			expect(result.current.items).toHaveLength(0)
		})

		it('should not affect other items when updating quantity', () => {
			const { result } = renderHook(() => useCartStore())

			const product1 = generateMockCartItem({ productId: 'product-1' })
			const product2 = generateMockCartItem({ productId: 'product-2' })

			act(() => {
				result.current.addItem(product1)
				result.current.addItem(product2)
			})

			const itemId1 = result.current.items[0].id

			act(() => {
				result.current.updateQuantity(itemId1, 10)
			})

			expect(result.current.items[0].quantity).toBe(10)
			expect(result.current.items[1].quantity).toBe(1)
		})
	})

	// ========================================================================
	// clearCart Tests
	// ========================================================================
	describe('clearCart', () => {
		it('should clear all items from cart', () => {
			const { result } = renderHook(() => useCartStore())

			const product1 = generateMockCartItem({ productId: 'product-1' })
			const product2 = generateMockCartItem({ productId: 'product-2' })
			const product3 = generateMockCartItem({ productId: 'product-3' })

			act(() => {
				result.current.addItem(product1)
				result.current.addItem(product2)
				result.current.addItem(product3)
			})

			expect(result.current.items).toHaveLength(3)

			act(() => {
				result.current.clearCart()
			})

			expect(result.current.items).toHaveLength(0)
		})

		it('should work on already empty cart', () => {
			const { result } = renderHook(() => useCartStore())

			act(() => {
				result.current.clearCart()
			})

			expect(result.current.items).toHaveLength(0)
		})
	})

	// ========================================================================
	// getTotalPrice Tests
	// ========================================================================
	describe('getTotalPrice', () => {
		it('should calculate total price correctly', () => {
			const { result } = renderHook(() => useCartStore())

			const product1 = generateMockCartItem({ price: 50000 })
			const product2 = generateMockCartItem({
				productId: 'product-2',
				price: 75000,
			})

			act(() => {
				result.current.addItem(product1)
				result.current.addItem(product2)
			})

			expect(result.current.getTotalPrice()).toBe(125000) // 50k + 75k
		})

		it('should account for quantities', () => {
			const { result } = renderHook(() => useCartStore())

			const product = generateMockCartItem({ price: 50000 })

			act(() => {
				result.current.addItem(product)
				result.current.addItem(product)
				result.current.addItem(product)
			})

			expect(result.current.getTotalPrice()).toBe(150000) // 50k * 3
		})

		it('should return 0 for empty cart', () => {
			const { result } = renderHook(() => useCartStore())

			expect(result.current.getTotalPrice()).toBe(0)
		})

		it('should update total price after removing item', () => {
			const { result } = renderHook(() => useCartStore())

			const product1 = generateMockCartItem({ price: 50000 })
			const product2 = generateMockCartItem({
				productId: 'product-2',
				price: 75000,
			})

			act(() => {
				result.current.addItem(product1)
				result.current.addItem(product2)
			})

			expect(result.current.getTotalPrice()).toBe(125000)

			const itemId1 = result.current.items[0].id

			act(() => {
				result.current.removeItem(itemId1)
			})

			expect(result.current.getTotalPrice()).toBe(75000)
		})
	})

	// ========================================================================
	// getTotalItems Tests
	// ========================================================================
	describe('getTotalItems', () => {
		it('should calculate total item count correctly', () => {
			const { result } = renderHook(() => useCartStore())

			const product = generateMockCartItem()

			act(() => {
				result.current.addItem(product)
				result.current.addItem(product)
				result.current.addItem(product)
			})

			expect(result.current.getTotalItems()).toBe(3)
		})

		it('should count items from different products', () => {
			const { result } = renderHook(() => useCartStore())

			const product1 = generateMockCartItem({ productId: 'product-1' })
			const product2 = generateMockCartItem({ productId: 'product-2' })

			act(() => {
				result.current.addItem(product1)
				result.current.addItem(product1)
				result.current.addItem(product2)
				result.current.addItem(product2)
				result.current.addItem(product2)
			})

			expect(result.current.getTotalItems()).toBe(5) // 2 + 3
		})

		it('should return 0 for empty cart', () => {
			const { result } = renderHook(() => useCartStore())

			expect(result.current.getTotalItems()).toBe(0)
		})
	})

	// ========================================================================
	// Persistence Tests (LocalStorage)
	// ========================================================================
	describe('Persistence', () => {
		it('should persist cart to localStorage', () => {
			const { result } = renderHook(() => useCartStore())
			const product = generateMockCartItem()

			act(() => {
				result.current.addItem(product)
			})

			// Check localStorage
			const stored = localStorage.getItem('cart-storage')
			expect(stored).toBeDefined()

			if (stored) {
				const parsed = JSON.parse(stored)
				expect(parsed.state.items).toHaveLength(1)
			}
		})

		it('should restore cart from localStorage on initialization', () => {
			// First session: add item
			const { result: result1 } = renderHook(() => useCartStore())
			const product = generateMockCartItem()

			act(() => {
				result1.current.addItem(product)
			})

			// Simulate page reload by creating new hook instance
			const { result: result2 } = renderHook(() => useCartStore())

			expect(result2.current.items).toHaveLength(1)
			expect(result2.current.items[0].name).toBe('Pepperoni Pizza')
		})
	})

	// ========================================================================
	// Complex Scenarios
	// ========================================================================
	describe('Complex Scenarios', () => {
		it('should handle multiple operations in sequence', () => {
			const { result } = renderHook(() => useCartStore())

			const product1 = generateMockCartItem({ productId: 'product-1', price: 50000 })
			const product2 = generateMockCartItem({ productId: 'product-2', price: 75000 })

			// Add items
			act(() => {
				result.current.addItem(product1)
				result.current.addItem(product1)
				result.current.addItem(product2)
			})

			expect(result.current.items).toHaveLength(2)
			expect(result.current.getTotalItems()).toBe(3)
			expect(result.current.getTotalPrice()).toBe(175000) // 50k*2 + 75k

			// Update quantity
			const itemId1 = result.current.items[0].id
			act(() => {
				result.current.updateQuantity(itemId1, 5)
			})

			expect(result.current.getTotalItems()).toBe(6) // 5 + 1
			expect(result.current.getTotalPrice()).toBe(325000) // 50k*5 + 75k

			// Remove item
			const itemId2 = result.current.items[1].id
			act(() => {
				result.current.removeItem(itemId2)
			})

			expect(result.current.items).toHaveLength(1)
			expect(result.current.getTotalPrice()).toBe(250000) // 50k*5
		})

		it('should handle cart with customized pizzas', () => {
			const { result } = renderHook(() => useCartStore())

			const customPizza = generateMockCartItem({
				addedToppingIds: ['extra-cheese', 'olives'],
				removedToppingIds: ['onions'],
				price: 55000,
			})

			act(() => {
				result.current.addItem(customPizza)
			})

			expect(result.current.items[0].addedToppingIds).toEqual(['extra-cheese', 'olives'])
			expect(result.current.items[0].removedToppingIds).toEqual(['onions'])
		})
	})
})
