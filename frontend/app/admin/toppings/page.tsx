// frontend/app/admin/toppings/page.tsx
// ✅ Toppings admin page

'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ToppingModal } from './components/ToppingModal'
import { ToppingsTable } from './components/ToppingsTable'
import { useToppings } from './hooks/useToppings'
import { Topping } from './types/topping.types'

export default function AdminToppingsPage() {
	const { toppings, loading, error, fetchToppings, deleteTopping } = useToppings()
	const [activeTopping, setActiveTopping] = useState<Topping | null>(null)
	const [showModal, setShowModal] = useState(false)

	if (loading) {
		return <div className='p-6 text-center'>Yuklanmoqda...</div>
	}

	return (
		<div className='p-6 space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Toppinglar boshqaruvi</h1>
					<p className='text-gray-600'>Extra ingredientlarni boshqaring</p>
				</div>
				<Button className='bg-orange-600 hover:bg-orange-700' onClick={() => setShowModal(true)}>
					<Plus className='w-4 h-4 mr-2' /> Yangi topping
				</Button>
			</div>

			{error && <div className='text-red-600'>{error}</div>}

			<ToppingsTable
				toppings={toppings}
				onEdit={topping => {
					setActiveTopping(topping)
					setShowModal(true)
				}}
				onDelete={async topping => {
					await deleteTopping(topping.id)
				}}
			/>

			{showModal && (
				<ToppingModal
					topping={activeTopping}
					onClose={() => {
						setActiveTopping(null)
						setShowModal(false)
					}}
					onSuccess={async () => {
						await fetchToppings()
						setActiveTopping(null)
						setShowModal(false)
					}}
				/>
			)}
		</div>
	)
}
