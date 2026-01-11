'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCategories } from './hooks/useCategories'
import { FilterBar } from './components/FilterBar'
import { CategoriesTable } from './components/CategoriesTable'
import { CategoryModal } from './components/CategoryModal'
import { Toast } from '../products/components/Toast' // Reuse from products
import { Category } from './types/category.types'

export default function AdminCategoriesPage() {
	const [searchTerm, setSearchTerm] = useState('')
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingCategory, setEditingCategory] = useState<Category | null>(null)

	const {
		categories,
		loading,
		toast,
		setToast,
		filterStatus,
		setFilterStatus,
		fetchCategories,
		handleDelete,
		handleRestore,
	} = useCategories()

	const filteredCategories = categories.filter(
		category =>
			category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(category.description &&
				category.description.toLowerCase().includes(searchTerm.toLowerCase())),
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
					<h1 className='text-3xl font-bold mb-2'>Kategoriyalar Boshqaruvi</h1>
					<p className='text-gray-600'>Mahsulot kategoriyalarini boshqaring</p>
				</div>
				<Button onClick={() => setShowAddModal(true)} className='bg-orange-600 hover:bg-orange-700'>
					<Plus className='w-4 h-4 mr-2' />
					Yangi kategoriya
				</Button>
			</div>

			<FilterBar
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filterStatus={filterStatus}
				setFilterStatus={setFilterStatus}
			/>

			<CategoriesTable
				categories={filteredCategories}
				filterStatus={filterStatus}
				onEdit={setEditingCategory}
				onDelete={handleDelete}
				onRestore={handleRestore}
			/>

			{(showAddModal || editingCategory) && (
				<CategoryModal
					category={editingCategory}
					onClose={() => {
						setShowAddModal(false)
						setEditingCategory(null)
					}}
					onSuccess={message => {
						fetchCategories()
						setShowAddModal(false)
						setEditingCategory(null)
						setToast({ message, type: 'success' })
					}}
				/>
			)}
		</div>
	)
}
