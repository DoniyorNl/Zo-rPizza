export interface Category {
	id: string
	name: string
	description: string | null
	imageUrl: string | null
	isActive: boolean
	createdAt: string
	updatedAt: string
	_count?: {
		products: number
	}
}

export interface CategoryFormData {
	name: string
	description: string
	imageUrl: string
	isActive: boolean
}

export type FilterStatus = 'all' | 'active' | 'inactive'
export type ToastType = 'success' | 'error'
