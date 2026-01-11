import { useState, useEffect } from 'react'
import axios from 'axios'
import { Product, ProductFormData, Category } from '../types/product.types'

const initialFormData: ProductFormData = {
	name: '',
	description: '',
	price: '',
	imageUrl: '',
	prepTime: '15',
	categoryId: '',
	isActive: true,
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

export function useProductForm(product: Product | null) {
	const [loading, setLoading] = useState(false)
	const [categories, setCategories] = useState<Category[]>([])
	const [formData, setFormData] = useState<ProductFormData>(initialFormData)

	useEffect(() => {
		fetchCategories()
		if (product) {
			fetchProductDetails(product.id)
		}
	}, [product])

	const fetchCategories = async () => {
		try {
			const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
			setCategories(response.data.data)
			if (response.data.data.length > 0 && !product) {
				setFormData(prev => ({ ...prev, categoryId: response.data.data[0].id }))
			}
		} catch (error) {
			console.error('Error fetching categories:', error)
		}
	}

	const fetchProductDetails = async (productId: string) => {
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`,
			)
			const fullProduct = response.data.data

			const parseJson = (data: any) => {
				if (!data) return null
				return typeof data === 'string' ? JSON.parse(data) : data
			}

			setFormData({
				name: fullProduct.name,
				description: fullProduct.description,
				price: fullProduct.price.toString(),
				imageUrl: fullProduct.imageUrl || '',
				prepTime: fullProduct.prepTime.toString(),
				categoryId: fullProduct.categoryId,
				isActive: fullProduct.isActive,
				ingredients: parseJson(fullProduct.ingredients) || [],
				recipe: fullProduct.recipe || '',
				cookingTemp: fullProduct.cookingTemp?.toString() || '',
				cookingTime: fullProduct.cookingTime?.toString() || '',
				cookingSteps: parseJson(fullProduct.cookingSteps) || [],
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
	}

	const handleSubmit = async (onSuccess: (message: string) => void) => {
		setLoading(true)

		try {
			const data: any = {
				name: formData.name,
				description: formData.description,
				price: parseFloat(formData.price),
				prepTime: parseInt(formData.prepTime),
				categoryId: formData.categoryId,
				imageUrl: formData.imageUrl || null,
				isActive: formData.isActive,
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
				await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${product.id}`, data)
				onSuccess('Mahsulot muvaffaqiyatli yangilandi')
			} else {
				await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, data)
				onSuccess("Mahsulot muvaffaqiyatli qo'shildi")
			}
		} catch (error: any) {
			console.error('Error saving product:', error)
			alert(error.response?.data?.message || 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return {
		loading,
		categories,
		formData,
		setFormData,
		handleSubmit,
	}
}
