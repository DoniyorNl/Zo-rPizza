import { useState } from 'react'
import axios from 'axios'
import { Category, CategoryFormData } from '../types/category.types'

const initialFormData: CategoryFormData = {
	name: '',
	description: '',
	imageUrl: '',
	isActive: true,
}

export function useCategoryForm(category: Category | null) {
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState<CategoryFormData>(
		category
			? {
					name: category.name,
					description: category.description || '',
					imageUrl: category.imageUrl || '',
					isActive: category.isActive,
			  }
			: initialFormData,
	)

	const handleSubmit = async (onSuccess: (message: string) => void) => {
		setLoading(true)

		try {
			const data = {
				name: formData.name,
				description: formData.description || null,
				imageUrl: formData.imageUrl || null,
				isActive: formData.isActive,
			}

			if (category) {
				await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${category.id}`, data)
				onSuccess('Kategoriya muvaffaqiyatli yangilandi')
			} else {
				await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, data)
				onSuccess("Kategoriya muvaffaqiyatli qo'shildi")
			}
		} catch (error: any) {
			console.error('Error saving category:', error)
			throw new Error(error.response?.data?.message || 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return {
		loading,
		formData,
		setFormData,
		handleSubmit,
	}
}
