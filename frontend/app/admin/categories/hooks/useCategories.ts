import { api } from '@/lib/apiClient'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { Category, FilterStatus, ToastType } from '../types/category.types'

export function useCategories() {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('active')

	const fetchCategories = useCallback(async () => {
		try {
			const response = await api.get('/api/categories', {
				params: filterStatus === 'all' ? {} : { isActive: filterStatus === 'active' },
			})
			setCategories(response.data.data)
		} catch (error) {
			console.error('Error fetching categories:', error)
			setToast({ message: 'Kategoriyalarni yuklashda xatolik', type: 'error' })
		} finally {
			setLoading(false)
		}
	}, [filterStatus])

	const handleDelete = async (id: string, categoryName: string) => {
		try {
			await api.delete(`/api/categories/${id}`)
			setToast({ message: `"${categoryName}" o'chirildi`, type: 'success' })
			fetchCategories()
		} catch (error: unknown) {
			console.error('Error deleting category:', error)
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || 'Xatolik yuz berdi'
				: 'Xatolik yuz berdi'
			setToast({ message, type: 'error' })
		}
	}

	const handleRestore = async (id: string, categoryName: string) => {
		try {
			await api.patch(`/api/categories/${id}/restore`)
			setToast({ message: `"${categoryName}" qayta faollashtirildi`, type: 'success' })
			fetchCategories()
		} catch (error: unknown) {
			console.error('Error restoring category:', error)
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || 'Xatolik yuz berdi'
				: 'Xatolik yuz berdi'
			setToast({ message, type: 'error' })
		}
	}

	useEffect(() => {
		fetchCategories()
	}, [fetchCategories])

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
