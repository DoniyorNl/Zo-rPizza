// frontend/app/admin/toppings/types/topping.types.ts
// ✅ Topping types for admin UI

export interface Topping {
	id: string
	name: string
	price: number
	isActive: boolean
	createdAt: string
}

export interface ToppingFormData {
	name: string
	price: string
	isActive: boolean
}

export interface ToppingFormErrors {
	name?: string
	price?: string
}
