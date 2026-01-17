// frontend/app/admin/deals/types/deal.types.ts
// ✅ Deal types for admin UI

export type DiscountType = 'PERCENT' | 'FIXED'
export type DealItemType = 'PIZZA' | 'DRINK' | 'SIDE'

export interface DealProduct {
	id: string
	name: string
	imageUrl: string | null
}

export interface DealItem {
	id: string
	productId: string
	itemType: DealItemType
	quantity: number
	product: DealProduct
}

export interface Deal {
	id: string
	title: string
	description?: string | null
	imageUrl?: string | null
	discountType: DiscountType
	discountValue: number
	isActive: boolean
	startsAt?: string | null
	endsAt?: string | null
	items: DealItem[]
	createdAt: string
}

export interface DealItemForm {
	productId: string
	itemType: DealItemType
	quantity: string
}

export interface DealFormData {
	title: string
	description: string
	imageUrl: string
	discountType: DiscountType
	discountValue: string
	isActive: boolean
	startsAt: string
	endsAt: string
	items: DealItemForm[]
}

export interface DealFormErrors {
	title?: string
	discountValue?: string
	dateRange?: string
	items?: string
	itemRows?: Array<{
		productId?: string
		quantity?: string
	}>
}
