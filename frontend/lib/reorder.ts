// frontend/lib/reorder.ts
// 🔄 RE-ORDER UTILITY - One-click reorder from order history

import { useCartStore } from '@/store/cartStore'

export interface OrderItem {
	productId: string
	name: string
	size?: string
	price: number
	quantity: number
	variationId?: string
	addedToppingIds?: string[]
	removedToppingIds?: string[]
	halfProductId?: string
	halfProductName?: string
	product?: {
		id: string
		name: string
		imageUrl: string | null
		images?: string[]
	}
}

export interface Order {
	id: string
	orderNumber: string
	totalPrice: number
	items: OrderItem[]
	createdAt: string
}

/**
 * Re-add all items from a previous order to cart
 */
export const reorder = (order: Order): { success: boolean; addedCount: number } => {
	const { addItem } = useCartStore.getState()
	
	let addedCount = 0

	try {
		// Optional: Ask user if they want to clear current cart
		// For now, we just add to existing cart

		order.items.forEach(item => {
			const productId = item.product?.id || item.productId
			const imageUrl = item.product?.imageUrl || item.product?.images?.[0] || '/images/placeholder.png'

			const itemData = {
				productId,
				name: item.product?.name || item.name,
				size: item.size || 'Medium',
				price: item.price,
				imageUrl,
				variationId: item.variationId ?? '',
				addedToppingIds: item.addedToppingIds || [],
				removedToppingIds: item.removedToppingIds || [],
				halfProductId: item.halfProductId,
				halfProductName: item.halfProductName,
			}

			for (let i = 0; i < item.quantity; i++) {
				addItem(itemData)
				addedCount++
			}
		})

		console.log(`✅ [REORDER] Added ${addedCount} items to cart`)

		return { success: true, addedCount }
	} catch (error) {
		console.error('❌ [REORDER] Failed:', error)
		return { success: false, addedCount }
	}
}

/**
 * Re-order with cart clear confirmation
 */
export const reorderWithConfirm = async (order: Order): Promise<{ success: boolean; addedCount: number }> => {
	const { items: currentCartItems, clearCart } = useCartStore.getState()

	// If cart is not empty, ask for confirmation
	if (currentCartItems.length > 0) {
		const confirmed = window.confirm(
			`Hozirgi savatchada ${currentCartItems.length} ta mahsulot bor. Tozalash va qayta buyurtma qilish?`
		)

		if (confirmed) {
			clearCart()
		} else {
			// User cancelled
			return { success: false, addedCount: 0 }
		}
	}

	return reorder(order)
}
