import { useState, useEffect } from 'react'
import axios from 'axios'
import { Category, FilterStatus, ToastType } from '../types/category.types'

export function useCategories() {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('active')

	const fetchCategories = async () => {
		try {
			const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
				params: filterStatus === 'all' ? {} : { isActive: filterStatus === 'active' },
			})
			setCategories(response.data.data)
		} catch (error) {
			console.error('Error fetching categories:', error)
			setToast({ message: 'Kategoriyalarni yuklashda xatolik', type: 'error' })
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (id: string, categoryName: string) => {
		try {
			await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`)
			setToast({ message: `"${categoryName}" o'chirildi`, type: 'success' })
			fetchCategories()
		} catch (error: any) {
			console.error('Error deleting category:', error)
			const message = error.response?.data?.message || 'Xatolik yuz berdi'
			setToast({ message, type: 'error' })
		}
	}

	const handleRestore = async (id: string, categoryName: string) => {
		try {
			await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}/restore`)
			setToast({ message: `"${categoryName}" qayta faollashtirildi`, type: 'success' })
			fetchCategories()
		} catch (error: any) {
			console.error('Error restoring category:', error)
			const message = error.response?.data?.message || 'Xatolik yuz berdi'
			setToast({ message, type: 'error' })
		}
	}

	useEffect(() => {
		fetchCategories()
	}, [filterStatus])

	return {
		categories,
		loading,
		toast,
		setToast,
		filterStatus,
		setFilterStatus,
		fetchCategories,
		handleDelete,
		handleRestore,
	}
}
