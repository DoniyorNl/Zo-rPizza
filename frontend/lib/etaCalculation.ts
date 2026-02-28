// frontend/lib/etaCalculation.ts
// ⏱️ ESTIMATED TIME OF ARRIVAL - Dynamic delivery time calculation

/**
 * Calculate ETA based on distance, kitchen load, and time of day
 */
export interface ETAParams {
	distance?: number // km
	activeOrdersCount?: number
	timeOfDay?: Date
	productCount?: number
	hasComplexItems?: boolean // e.g., custom pizzas with many toppings
}

export interface ETAResult {
	estimatedMinutes: number
	minMinutes: number
	maxMinutes: number
	breakdown: {
		prepTime: number
		deliveryTime: number
		bufferTime: number
	}
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BASE_PREP_TIME = 15 // minutes - base pizza preparation time
const PREP_TIME_PER_ITEM = 3 // minutes per additional item
const COMPLEX_ITEM_EXTRA = 5 // extra minutes for custom pizzas
const DELIVERY_SPEED = 30 // km/h - average delivery speed in city
const KITCHEN_LOAD_FACTOR = 2 // minutes added per active order
const MAX_KITCHEN_DELAY = 20 // max delay from kitchen load
const BUFFER_TIME = 5 // safety buffer

// Peak hours (slower delivery)
const PEAK_HOURS = [12, 13, 18, 19, 20] // lunch and dinner
const PEAK_HOUR_MULTIPLIER = 1.3

// ============================================================================
// CALCULATION
// ============================================================================

/**
 * Calculate estimated delivery time
 */
export const calculateETA = (params: ETAParams = {}): ETAResult => {
	const {
		distance = 3, // default 3km
		activeOrdersCount = 0,
		timeOfDay = new Date(),
		productCount = 1,
		hasComplexItems = false,
	} = params

	// 1. PREP TIME
	let prepTime = BASE_PREP_TIME
	
	// Add time for each additional item
	if (productCount > 1) {
		prepTime += (productCount - 1) * PREP_TIME_PER_ITEM
	}

	// Add time for complex items (custom pizzas)
	if (hasComplexItems) {
		prepTime += COMPLEX_ITEM_EXTRA
	}

	// Kitchen load factor (more orders = longer wait)
	const kitchenDelay = Math.min(
		activeOrdersCount * KITCHEN_LOAD_FACTOR,
		MAX_KITCHEN_DELAY
	)
	prepTime += kitchenDelay

	// 2. DELIVERY TIME
	// Time = Distance / Speed
	let deliveryTime = (distance / DELIVERY_SPEED) * 60 // convert to minutes

	// Peak hour adjustment
	const hour = timeOfDay.getHours()
	if (PEAK_HOURS.includes(hour)) {
		deliveryTime *= PEAK_HOUR_MULTIPLIER
	}

	// 3. BUFFER TIME
	const bufferTime = BUFFER_TIME

	// 4. TOTAL ETA
	const totalMinutes = Math.ceil(prepTime + deliveryTime + bufferTime)

	// Min/Max range (±5 minutes)
	const minMinutes = Math.max(10, totalMinutes - 5)
	const maxMinutes = totalMinutes + 5

	return {
		estimatedMinutes: totalMinutes,
		minMinutes,
		maxMinutes,
		breakdown: {
			prepTime: Math.ceil(prepTime),
			deliveryTime: Math.ceil(deliveryTime),
			bufferTime,
		},
	}
}

/**
 * Format ETA for display
 */
export const formatETA = (eta: ETAResult): string => {
	if (eta.minMinutes === eta.maxMinutes) {
		return `${eta.estimatedMinutes} daqiqa`
	}
	return `${eta.minMinutes}-${eta.maxMinutes} daqiqa`
}

/**
 * Get ETA description
 */
export const getETADescription = (eta: ETAResult): string => {
	const { estimatedMinutes } = eta

	if (estimatedMinutes < 20) {
		return '⚡ Tezkor yetkazib berish'
	} else if (estimatedMinutes < 35) {
		return '✅ Standart yetkazish'
	} else {
		return '⏰ Band vaqt - biroz kechikish mumkin'
	}
}

/**
 * Calculate ETA from backend order data
 */
export const calculateETAFromOrder = async (orderId: string): Promise<ETAResult | null> => {
	try {
		const { api } = await import('./apiClient')
		
		// Get order details
		const response = await api.get(`/api/orders/${orderId}`)
		const order = response.data.data

		if (!order) return null

		// Calculate distance if coordinates available
		let distance = 3 // default
		if (order.deliveryLat && order.deliveryLng) {
			// You can integrate with a distance calculation service here
			// For now, use a simple approximation
			distance = Math.random() * 5 + 1 // 1-6 km (placeholder)
		}

		// Get active orders count
		const dashboardResponse = await api.get('/api/dashboard')
		const activeOrders = dashboardResponse.data.data?.activeOrders || 0

		// Calculate ETA
		return calculateETA({
			distance,
			activeOrdersCount: activeOrders,
			productCount: order.items?.length || 1,
			hasComplexItems: order.items?.some((item: { toppings?: unknown[]; halfHalf?: boolean }) => 
				(item.toppings && Array.isArray(item.toppings) && item.toppings.length > 0) || item.halfHalf
			),
		})
	} catch (error) {
		console.error('❌ [ETA] Calculation error:', error)
		return null
	}
}
