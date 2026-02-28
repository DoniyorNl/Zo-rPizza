import { api } from '@/lib/apiClient'
import { useEffect, useState } from 'react'
import { Product, FilterStatus, ToastType } from '../types/product.types'

export function useProducts() {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('active')

	const fetchProducts = async () => {
		try {
			const response = await api.get('/api/products', {
				params: filterStatus === 'all' ? {} : { isActive: filterStatus === 'active' },
			})
			setProducts(response.data.data)
		} catch (error) {
			console.error('Error fetching products:', error)
			setToast({ message: 'Mahsulotlarni yuklashda xatolik', type: 'error' })
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (id: string, productName: string) => {
		try {
			await api.delete(`/api/products/${id}`)
			setToast({ message: `"${productName}" menyudan yashirildi`, type: 'success' })
			fetchProducts()
		} catch (error: unknown) {
			console.error('Error deleting product:', error)
			const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik yuz berdi'
			setToast({ message, type: 'error' })
		}
	}

	const handleRestore = async (id: string, productName: string) => {
		try {
			await api.patch(`/api/products/${id}/restore`)
			setToast({ message: `"${productName}" qayta faollashtirildi`, type: 'success' })
			fetchProducts()
		} catch (error: unknown) {
			console.error('Error restoring product:', error)
			const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Xatolik yuz berdi'
			setToast({ message, type: 'error' })
		}
	}

	useEffect(() => {
		fetchProducts()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterStatus])

	return {
		products,
		loading,
		toast,
		setToast,
		filterStatus,
		setFilterStatus,
		fetchProducts,
		handleDelete,
		handleRestore,
	}
}
