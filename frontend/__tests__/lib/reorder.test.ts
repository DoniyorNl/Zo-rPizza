// frontend/__tests__/lib/reorder.test.ts
// 🔄 REORDER UTILITY TESTS

import { reorder, reorderWithConfirm, type Order, type OrderItem } from '@/lib/reorder'
import { useCartStore } from '@/store/cartStore'

const mockOrderItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
	productId: 'prod-1',
	name: 'Pepperoni Pizza',
	size: 'Medium',
	price: 50000,
	quantity: 1,
	variationId: 'var-1',
	addedToppingIds: [],
	removedToppingIds: [],
	product: {
		id: 'prod-1',
		name: 'Pepperoni Pizza',
		imageUrl: 'https://example.com/pizza.jpg',
	},
	...overrides,
})

const mockOrder = (overrides: Partial<Order> = {}): Order => ({
	id: 'order-1',
	orderNumber: '#0001',
	totalPrice: 50000,
	createdAt: new Date().toISOString(),
	items: [mockOrderItem()],
	...overrides,
})

describe('reorder', () => {
	beforeEach(() => {
		useCartStore.getState().clearCart()
		jest.spyOn(console, 'log').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('should add items to cart and return success', () => {
		const order = mockOrder()
		const result = reorder(order)

		expect(result.success).toBe(true)
		expect(result.addedCount).toBe(1)
		expect(useCartStore.getState().items).toHaveLength(1)
		expect(useCartStore.getState().items[0].productId).toBe('prod-1')
		expect(useCartStore.getState().items[0].name).toBe('Pepperoni Pizza')
	})

	it('should add multiple quantities', () => {
		const order = mockOrder({
			items: [mockOrderItem({ quantity: 3 })],
		})
		const result = reorder(order)

		expect(result.success).toBe(true)
		expect(result.addedCount).toBe(3)
		expect(useCartStore.getState().items[0].quantity).toBe(3)
	})

	it('should add multiple items from order', () => {
		const order = mockOrder({
			items: [
				mockOrderItem({ productId: 'prod-1', variationId: 'var-1', quantity: 1 }),
				mockOrderItem({
					productId: 'prod-2',
					variationId: 'var-2',
					name: 'Margherita',
					quantity: 2,
					product: {
						id: 'prod-2',
						name: 'Margherita',
						imageUrl: null,
					},
				}),
			],
		})
		const result = reorder(order)

		expect(result.success).toBe(true)
		expect(result.addedCount).toBe(3)
		expect(useCartStore.getState().items).toHaveLength(2)
	})

	it('should use product data when available', () => {
		const order = mockOrder({
			items: [
				mockOrderItem({
					product: {
						id: 'prod-1',
						name: 'Custom Pizza',
						imageUrl: 'https://example.com/custom.jpg',
						images: ['img1.jpg'],
					},
				}),
			],
		})
		reorder(order)

		expect(useCartStore.getState().items[0].name).toBe('Custom Pizza')
		expect(useCartStore.getState().items[0].imageUrl).toBe('https://example.com/custom.jpg')
	})

	it('should handle missing variationId', () => {
		const order = mockOrder({
			items: [mockOrderItem({ variationId: undefined })],
		})
		const result = reorder(order)

		expect(result.success).toBe(true)
		expect(useCartStore.getState().items[0].variationId).toBe('')
	})
})

describe('reorderWithConfirm', () => {
	beforeEach(() => {
		useCartStore.getState().clearCart()
		jest.spyOn(console, 'log').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('should reorder when cart is empty', async () => {
		const order = mockOrder()
		const result = await reorderWithConfirm(order)

		expect(result.success).toBe(true)
		expect(result.addedCount).toBe(1)
	})

	it('should clear cart and reorder when user confirms', async () => {
		useCartStore.getState().addItem({
			productId: 'old-prod',
			variationId: 'var-old',
			name: 'Old Pizza',
			size: 'Medium',
			price: 30000,
			imageUrl: '',
			addedToppingIds: [],
			removedToppingIds: [],
		})
		window.confirm = jest.fn().mockReturnValue(true)

		const order = mockOrder()
		const result = await reorderWithConfirm(order)

		expect(window.confirm).toHaveBeenCalled()
		expect(result.success).toBe(true)
		expect(useCartStore.getState().items.some(i => i.productId === 'prod-1')).toBe(true)
	})

	it('should not reorder when user cancels confirmation', async () => {
		useCartStore.getState().addItem({
			productId: 'old-prod',
			variationId: 'var-old',
			name: 'Old Pizza',
			size: 'Medium',
			price: 30000,
			imageUrl: '',
			addedToppingIds: [],
			removedToppingIds: [],
		})
		window.confirm = jest.fn().mockReturnValue(false)

		const order = mockOrder()
		const result = await reorderWithConfirm(order)

		expect(result.success).toBe(false)
		expect(result.addedCount).toBe(0)
		expect(useCartStore.getState().items[0].productId).toBe('old-prod')
	})
})
