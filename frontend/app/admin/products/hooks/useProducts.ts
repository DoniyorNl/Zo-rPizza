import { useState, useEffect } from 'react'
import axios from 'axios'
import { Product, FilterStatus, ToastType } from '../types/product.types'

export function useProducts() {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
	const [filterStatus, setFilterStatus] = useState<FilterStatus>('active')

	const fetchProducts = async () => {
		try {
			const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
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
			await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
			setToast({ message: `"${productName}" menyudan yashirildi`, type: 'success' })
			fetchProducts()
		} catch (error: any) {
			console.error('Error deleting product:', error)
			const message = error.response?.data?.message || 'Xatolik yuz berdi'
			setToast({ message, type: 'error' })
		}
	}

	const handleRestore = async (id: string, productName: string) => {
		try {
			await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}/restore`)
			setToast({ message: `"${productName}" qayta faollashtirildi`, type: 'success' })
			fetchProducts()
		} catch (error: any) {
			console.error('Error restoring product:', error)
			const message = error.response?.data?.message || 'Xatolik yuz berdi'
			setToast({ message, type: 'error' })
		}
	}

	useEffect(() => {
		fetchProducts()
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
