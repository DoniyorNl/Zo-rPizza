// frontend/types/category.types.ts
// 📂 PUBLIC CATEGORY TYPES (User-facing categories)
// Bu types faqat public kategoriyalar uchun

/**
 * Category - Mahsulot kategoriyasi
 */
export interface Category {
	id: string
	name: string
	description?: string
	icon?: string // Icon name yoki emoji
	imageUrl?: string
	slug?: string // URL-friendly name
	isActive: boolean
	displayOrder?: number // Display order (lower = first)
	productCount?: number // Bu kategoryadagi mahsulotlar soni
	createdAt?: string | Date
	updatedAt?: string | Date
}

/**
 * Category with Products
 */
export interface CategoryWithProducts extends Category {
	products: {
		id: string
		name: string
		imageUrl: string
		basePrice: number
		isActive: boolean
	}[]
}

/**
 * Category Filter Options
 */
export interface CategoryFilterOptions {
	isActive?: boolean
	hasProducts?: boolean // Faqat mahsuloti bo'lgan kategoriyalar
	search?: string
	sortBy?: 'name' | 'displayOrder' | 'productCount' | 'createdAt'
	sortOrder?: 'asc' | 'desc'
}

/**
 * Category Navigation Item (for horizontal menu)
 */
export interface CategoryNavItem {
	id: string
	name: string
	icon?: string
	slug?: string
	productCount?: number
	isActive: boolean
}
