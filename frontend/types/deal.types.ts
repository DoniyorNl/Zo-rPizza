// frontend/types/deal.types.ts
// 🎁 PUBLIC DEAL TYPES (User-facing deals)
// Bu types faqat public deal'lar uchun (admin deals'dan farqi bor)

/**
 * Deal Item - Har bir deal'dagi mahsulot
 */
export interface DealItem {
	id: string
	productId: string
	dealId: string
	quantity: number
	discountPercentage?: number
	product?: {
		id: string
		name: string
		imageUrl: string
		basePrice: number
	}
}

/**
 * Deal - Aksiya/Kupon
 */
export interface Deal {
	id: string
	name: string
	description: string
	imageUrl?: string
	discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y'
	discountValue: number
	minOrderAmount?: number | null
	maxDiscountAmount?: number | null
	startDate: string | Date
	endDate: string | Date
	isActive: boolean
	usageLimit?: number | null
	usageCount?: number | null
	terms?: string | null
	priority?: number | null // Display order (lower = higher priority)
	items?: DealItem[]
	createdAt?: string | Date
	updatedAt?: string | Date
}

/**
 * Deal Filter Options
 */
export interface DealFilterOptions {
	isActive?: boolean
	availableNow?: boolean // Current date between start and end
	hasStock?: boolean // usageCount < usageLimit
	minDiscount?: number
	sortBy?: 'priority' | 'discount' | 'endDate' | 'createdAt'
	sortOrder?: 'asc' | 'desc'
}

/**
 * Deal Statistics
 */
export interface DealStats {
	totalDeals: number
	activeDeals: number
	expiredDeals: number
	mostPopular?: Deal
	highestDiscount?: Deal
}
