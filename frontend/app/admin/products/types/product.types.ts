export interface Product {
	id: string
	name: string
	description: string
	price: number
	imageUrl: string | null
	prepTime: number
	isActive: boolean
	category: {
		id: string
		name: string
	}
	ingredientsRel?: Array<{
		id: string
		quantity: number
		ingredient: {
			id: string
			name: string
			unit: string
		}
	}>
	createdAt: string
}

export interface Category {
	id: string
	name: string
}

export interface ProductFormData {
	name: string
	description: string
	price: string
	imageUrl: string
	prepTime: string
	categoryId: string
	isActive: boolean
	ingredients: Array<{ name: string; amount: string; icon?: string }>
	recipe: string
	cookingTemp: string
	cookingTime: string
	cookingSteps: Array<{ step: number; title: string; description: string }>
	difficulty: string
	servings: string
	allergens: string[]
	images: string[]
	calories: string
	protein: string
	carbs: string
	fat: string
}

export type FilterStatus = 'all' | 'active' | 'inactive'
export type ToastType = 'success' | 'error'
export type TabType = 'basic' | 'details' | 'nutrition'
