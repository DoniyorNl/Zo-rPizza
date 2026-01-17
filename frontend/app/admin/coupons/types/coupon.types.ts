// frontend/app/admin/coupons/types/coupon.types.ts
// ✅ Coupon types for admin UI

export type DiscountType = 'PERCENT' | 'FIXED'

export interface Coupon {
	id: string
	code: string
	description?: string | null
	discountType: DiscountType
	discountValue: number
	isActive: boolean
	startsAt?: string | null
	endsAt?: string | null
	usageLimit?: number | null
	perUserLimit?: number | null
	createdAt: string
}

export interface CouponFormData {
	code: string
	description: string
	discountType: DiscountType
	discountValue: string
	isActive: boolean
	startsAt: string
	endsAt: string
	usageLimit: string
	perUserLimit: string
}

export interface CouponFormErrors {
	code?: string
	discountValue?: string
	dateRange?: string
}
