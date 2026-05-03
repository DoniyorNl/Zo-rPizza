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
 * Deal - Aksiya/Kupon (matches backend Prisma schema)
 */
export interface Deal {
	id: string
	title: string
	description?: string | null
	imageUrl?: string | null
	discountType: 'PERCENT' | 'FIXED'
	discountValue: number
	isActive: boolean
	startsAt?: string | Date | null
	endsAt?: string | Date | null
	items?: DealItem[]
	createdAt?: string | Date
	updatedAt?: string | Date
}

/**
 * Deal Filter Options
 */
export interface DealFilterOptions {
	isActive?: boolean
	availableNow?: boolean // Current date between startsAt and endsAt
	hasStock?: boolean // kept for API compatibility
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
