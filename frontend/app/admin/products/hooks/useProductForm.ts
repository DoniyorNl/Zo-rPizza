import { api } from '@/lib/apiClient'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { Category, Product, ProductFormData, ProductFormErrors } from '../types/product.types'

const initialFormData: ProductFormData = {
	name: '',
	description: '',
	basePrice: '',
	imageUrl: '',
	prepTime: '15',
	categoryId: '',
	isActive: true,
	variations: [],
	defaultToppingIds: [],
	ingredients: [],
	recipe: '',
	cookingTemp: '',
	cookingTime: '',
	cookingSteps: [],
	difficulty: '',
	servings: '',
	allergens: [],
	images: [],
	calories: '',
	protein: '',
	carbs: '',
	fat: '',
}

type ProductVariationPayload = {
	size: string
	price: number
	diameter?: number
	slices?: number
	weight?: number
}

type ProductPayload = {
	name: string
	description: string
	basePrice: number
	prepTime: number
	categoryId: string
	imageUrl: string | null
	isActive: boolean
	variations?: ProductVariationPayload[]
	ingredients?: ProductFormData['ingredients']
	recipe?: string
	cookingTemp?: number
	cookingTime?: number
	cookingSteps?: ProductFormData['cookingSteps']
	difficulty?: string
	servings?: number
	allergens?: string[]
	images?: string[]
	calories?: number
	protein?: number
	carbs?: number
	fat?: number
	defaultToppingIds?: string[]
}

type ProductVariationResponse = {
	size?: string
	price?: number
	diameter?: number | null
	slices?: number | null
	weight?: number | null
}

type ProductResponse = {
	name: string
	description: string
	basePrice?: number
	imageUrl?: string | null
	prepTime: number
	categoryId: string
	isActive: boolean
	variations?: ProductVariationResponse[]
	ingredients?: unknown
	recipe?: string
	cookingTemp?: number | null
	cookingTime?: number | null
	cookingSteps?: unknown
	difficulty?: string
	servings?: number | null
	allergens?: string[]
	images?: string[]
	calories?: number | null
	protein?: number | null
	carbs?: number | null
	fat?: number | null
	productToppings?: Array<{ topping: { id: string; name: string } }>
}

const parseJsonArray = <T,>(data: unknown): T[] | null => {
	if (!data) return null
	if (typeof data === 'string') {
		try {
			const parsed = JSON.parse(data)
			return Array.isArray(parsed) ? (parsed as T[]) : null
		} catch {
			return null
		}
	}
	return Array.isArray(data) ? (data as T[]) : null
}

export function useProductForm(product: Product | null) {
	const [loading, setLoading] = useState(false)
	const [categories, setCategories] = useState<Category[]>([])
	const [formData, setFormData] = useState<ProductFormData>(initialFormData)
	const [errors, setErrors] = useState<ProductFormErrors>({})
	const [toppings, setToppings] = useState<Array<{ id: string; name: string }>>([])

	const fetchCategories = useCallback(async () => {
		try {
			const response = await api.get('/api/categories')
			setCategories(response.data.data)
			if (response.data.data.length > 0 && !product) {
				setFormData(prev => ({ ...prev, categoryId: response.data.data[0].id }))
			}
		} catch (error) {
			console.error('Error fetching categories:', error)
		}
	}, [product])

	const fetchToppings = useCallback(async () => {
		try {
			const response = await api.get('/api/toppings')
			setToppings(response.data.data)
		} catch (error) {
			console.error('Error fetching toppings:', error)
		}
	}, [])

	const fetchProductDetails = useCallback(async (productId: string) => {
		try {
			const response = await api.get(`/api/products/${productId}`)
			const fullProduct = response.data.data as ProductResponse

			setFormData({
				name: fullProduct.name,
				description: fullProduct.description,
				basePrice: fullProduct.basePrice?.toString() || '',
				imageUrl: fullProduct.imageUrl || '',
				prepTime: fullProduct.prepTime.toString(),
				categoryId: fullProduct.categoryId,
				isActive: fullProduct.isActive,
				variations: Array.isArray(fullProduct.variations)
					? fullProduct.variations.map(variation => ({
						size: variation.size || 'Medium',
						price: variation.price?.toString() || '',
						diameter: variation.diameter?.toString() || '',
						slices: variation.slices?.toString() || '',
						weight: variation.weight?.toString() || '',
					}))
					: [],
				defaultToppingIds: fullProduct.productToppings
					? fullProduct.productToppings.map(item => item.topping.id)
					: [],
				ingredients:
					parseJsonArray<ProductFormData['ingredients'][number]>(fullProduct.ingredients) || [],
				recipe: fullProduct.recipe || '',
				cookingTemp: fullProduct.cookingTemp?.toString() || '',
				cookingTime: fullProduct.cookingTime?.toString() || '',
				cookingSteps:
					parseJsonArray<ProductFormData['cookingSteps'][number]>(fullProduct.cookingSteps) || [],
				difficulty: fullProduct.difficulty || '',
				servings: fullProduct.servings?.toString() || '',
				allergens: fullProduct.allergens || [],
				images: fullProduct.images || [],
				calories: fullProduct.calories?.toString() || '',
				protein: fullProduct.protein?.toString() || '',
				carbs: fullProduct.carbs?.toString() || '',
				fat: fullProduct.fat?.toString() || '',
			})
		} catch (error) {
			console.error('Error fetching product details:', error)
		}
	}, [])

	useEffect(() => {
		fetchCategories()
		fetchToppings()
		if (product) {
			fetchProductDetails(product.id)
		}
	}, [product, fetchCategories, fetchToppings, fetchProductDetails])

	const validateForm = () => {
		const nextErrors: ProductFormErrors = {}

		if (!formData.name.trim()) nextErrors.name = 'Nomi majburiy'
		if (!formData.description.trim()) nextErrors.description = 'Tavsif majburiy'
		if (!formData.basePrice || Number(formData.basePrice) <= 0) {
			nextErrors.basePrice = 'Asosiy narx 0 dan katta bo‘lishi kerak'
		}
		if (!formData.prepTime || Number(formData.prepTime) <= 0) {
			nextErrors.prepTime = 'Tayyorlash vaqti 0 dan katta bo‘lishi kerak'
		}
		if (!formData.categoryId) nextErrors.categoryId = 'Kategoriya tanlang'

		if (formData.variations.length > 0) {
			const sizes = formData.variations.map(variation => variation.size)
			const uniqueSizes = new Set(sizes)
			if (uniqueSizes.size !== sizes.length) {
				nextErrors.variations = 'O‘lchamlar takrorlanmasligi kerak'
			}

			nextErrors.variationRows = formData.variations.map(variation => {
				const rowErrors: { size?: string; price?: string } = {}
				if (!variation.size) rowErrors.size = 'O‘lcham tanlang'
				if (!variation.price || Number(variation.price) <= 0) {
					rowErrors.price = 'Narx 0 dan katta bo‘lishi kerak'
				}
				return rowErrors
			})
		}

		setErrors(nextErrors)
		return Object.keys(nextErrors).length === 0
	}

	const handleSubmit = async (onSuccess: (message: string) => void) => {
		if (!validateForm()) return

		setLoading(true)

		try {
			const data: ProductPayload = {
				name: formData.name,
				description: formData.description,
				basePrice: parseFloat(formData.basePrice),
				prepTime: parseInt(formData.prepTime),
				categoryId: formData.categoryId,
				imageUrl: formData.imageUrl || null,
				isActive: formData.isActive,
			}

			if (formData.variations.length > 0) {
				data.variations = formData.variations.map(variation => ({
					size: variation.size,
					price: parseFloat(variation.price),
					diameter: variation.diameter ? parseInt(variation.diameter) : undefined,
					slices: variation.slices ? parseInt(variation.slices) : undefined,
					weight: variation.weight ? parseInt(variation.weight) : undefined,
				}))
			} else {
				data.variations = []
			}

			if (formData.defaultToppingIds.length > 0) {
				data.defaultToppingIds = formData.defaultToppingIds
			} else {
				data.defaultToppingIds = []
			}

			// Add optional fields
			if (formData.ingredients.length > 0) data.ingredients = formData.ingredients
			if (formData.recipe) data.recipe = formData.recipe
			if (formData.cookingTemp) data.cookingTemp = parseInt(formData.cookingTemp)
			if (formData.cookingTime) data.cookingTime = parseInt(formData.cookingTime)
			if (formData.cookingSteps.length > 0) data.cookingSteps = formData.cookingSteps
			if (formData.difficulty) data.difficulty = formData.difficulty
			if (formData.servings) data.servings = parseInt(formData.servings)
			if (formData.allergens.length > 0) data.allergens = formData.allergens
			if (formData.images.length > 0) data.images = formData.images
			if (formData.calories) data.calories = parseInt(formData.calories)
			if (formData.protein) data.protein = parseFloat(formData.protein)
			if (formData.carbs) data.carbs = parseFloat(formData.carbs)
			if (formData.fat) data.fat = parseFloat(formData.fat)

			if (product) {
				await api.put(`/api/products/${product.id}`, data)
				onSuccess('Mahsulot muvaffaqiyatli yangilandi')
			} else {
				await api.post('/api/products', data)
				onSuccess("Mahsulot muvaffaqiyatli qo'shildi")
			}
		} catch (error: unknown) {
			console.error('Error saving product:', error)
			if (axios.isAxiosError(error)) {
				alert(error.response?.data?.message || 'Xatolik yuz berdi')
			} else {
				alert('Xatolik yuz berdi')
			}
		} finally {
			setLoading(false)
		}
	}

	return {
		loading,
		categories,
		formData,
		setFormData,
		errors,
		setErrors,
		toppings,
		handleSubmit,
	}
}
