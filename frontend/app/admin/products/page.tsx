'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useProducts } from './hooks/useProducts'
import { Toast } from './components/Toast'
import { FilterBar } from './components/FilterBar'
import { ProductsTable } from './components/ProductsTable'
import { ProductModal } from './components/ProductModal'
import { Product } from './types/product.types'

export default function AdminProductsPage() {
	const [searchTerm, setSearchTerm] = useState('')
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)

	const {
		products,
		loading,
		toast,
		setToast,
		filterStatus,
		setFilterStatus,
		fetchProducts,
		handleDelete,
		handleRestore,
	} = useProducts()

	const filteredProducts = products.filter(
		product =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.description.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	if (loading) {
		return (
			<div className='p-6'>
				<div className='text-center py-12'>Yuklanmoqda...</div>
			</div>
		)
	}

	return (
		<div className='p-6'>
			{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

			{/* Header */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>Mahsulotlar Boshqaruvi</h1>
					<p className='text-gray-600'>Barcha mahsulotlarni ko'ring va boshqaring</p>
				</div>
				<Button onClick={() => setShowAddModal(true)} className='bg-orange-600 hover:bg-orange-700'>
					<Plus className='w-4 h-4 mr-2' />
					Yangi mahsulot
				</Button>
			</div>

			<FilterBar
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filterStatus={filterStatus}
				setFilterStatus={setFilterStatus}
			/>

			<ProductsTable
				products={filteredProducts}
				filterStatus={filterStatus}
				onEdit={setEditingProduct}
				onDelete={handleDelete}
				onRestore={handleRestore}
			/>

			{(showAddModal || editingProduct) && (
				<ProductModal
					product={editingProduct}
					onClose={() => {
						setShowAddModal(false)
						setEditingProduct(null)
					}}
					onSuccess={message => {
						fetchProducts()
						setShowAddModal(false)
						setEditingProduct(null)
						setToast({ message, type: 'success' })
					}}
				/>
			)}
		</div>
	)
}
