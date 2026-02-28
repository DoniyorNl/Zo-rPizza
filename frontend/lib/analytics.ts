// frontend/lib/analytics.ts
// 📊 GOOGLE ANALYTICS 4 - Event Tracking

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// ============================================================================
// INITIALIZE GA4
// ============================================================================

export const initGA = () => {
	if (!GA_MEASUREMENT_ID) {
		console.warn('⚠️  NEXT_PUBLIC_GA_MEASUREMENT_ID not found. Analytics disabled.')
		return
	}

	// GA4 script already loaded via Script tag in layout
	console.log('✅ [GA4] Initialized:', GA_MEASUREMENT_ID)
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

declare global {
	interface Window {
		gtag?: (...args: any[]) => void
	}
}

/**
 * Send custom event to GA4
 */
export const trackEvent = (
	eventName: string,
	params?: Record<string, any>,
) => {
	if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
		window.gtag('event', eventName, params)
		console.log(`📊 [GA4] Event tracked: ${eventName}`, params)
	} else {
		console.log(`📊 [GA4 SIMULATION] Event: ${eventName}`, params)
	}
}

// ============================================================================
// E-COMMERCE EVENTS (GA4 Standard)
// ============================================================================

/**
 * Track page view
 */
export const trackPageView = (url: string, title?: string) => {
	trackEvent('page_view', {
		page_location: url,
		page_title: title || document.title,
	})
}

/**
 * Track product view
 */
export const trackProductView = (product: {
	id: string
	name: string
	price: number
	category?: string
}) => {
	trackEvent('view_item', {
		currency: 'UZS',
		value: product.price,
		items: [
			{
				item_id: product.id,
				item_name: product.name,
				price: product.price,
				item_category: product.category || 'Pizza',
			},
		],
	})
}

/**
 * Track add to cart
 */
export const trackAddToCart = (product: {
	id: string
	name: string
	price: number
	quantity: number
	category?: string
}) => {
	trackEvent('add_to_cart', {
		currency: 'UZS',
		value: product.price * product.quantity,
		items: [
			{
				item_id: product.id,
				item_name: product.name,
				price: product.price,
				quantity: product.quantity,
				item_category: product.category || 'Pizza',
			},
		],
	})
}

/**
 * Track remove from cart
 */
export const trackRemoveFromCart = (product: {
	id: string
	name: string
	price: number
	quantity: number
}) => {
	trackEvent('remove_from_cart', {
		currency: 'UZS',
		value: product.price * product.quantity,
		items: [
			{
				item_id: product.id,
				item_name: product.name,
				price: product.price,
				quantity: product.quantity,
			},
		],
	})
}

/**
 * Track begin checkout
 */
export const trackBeginCheckout = (cart: {
	items: Array<{ id: string; name: string; price: number; quantity: number }>
	totalPrice: number
}) => {
	trackEvent('begin_checkout', {
		currency: 'UZS',
		value: cart.totalPrice,
		items: cart.items.map(item => ({
			item_id: item.id,
			item_name: item.name,
			price: item.price,
			quantity: item.quantity,
		})),
	})
}

/**
 * Track purchase (order completed)
 */
export const trackPurchase = (order: {
	orderId: string
	orderNumber: string
	totalPrice: number
	paymentMethod: string
	items: Array<{ id: string; name: string; price: number; quantity: number }>
}) => {
	trackEvent('purchase', {
		transaction_id: order.orderId,
		affiliation: 'Zor Pizza',
		value: order.totalPrice,
		currency: 'UZS',
		payment_method: order.paymentMethod,
		items: order.items.map(item => ({
			item_id: item.id,
			item_name: item.name,
			price: item.price,
			quantity: item.quantity,
		})),
	})
}

/**
 * Track search
 */
export const trackSearch = (searchTerm: string) => {
	trackEvent('search', {
		search_term: searchTerm,
	})
}

/**
 * Track user signup
 */
export const trackSignup = (method: string) => {
	trackEvent('sign_up', {
		method: method, // 'email', 'google', 'facebook'
	})
}

/**
 * Track user login
 */
export const trackLogin = (method: string) => {
	trackEvent('login', {
		method: method,
	})
}

/**
 * Track custom events
 */
export const trackCustomEvent = (
	eventName: string,
	params?: Record<string, any>,
) => {
	trackEvent(eventName, params)
}
