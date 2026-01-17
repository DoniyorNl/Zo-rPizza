// frontend/app/admin/deals/page.tsx
// ✅ Deals admin page

'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { DealModal } from './components/DealModal'
import { DealsTable } from './components/DealsTable'
import { useDeals } from './hooks/useDeals'
import { Deal } from './types/deal.types'

export default function AdminDealsPage() {
	const { deals, loading, error, fetchDeals, deleteDeal } = useDeals()
	const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
	const [showModal, setShowModal] = useState(false)

	if (loading) {
		return <div className='p-6 text-center'>Yuklanmoqda...</div>
	}

	return (
		<div className='p-6 space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Deals boshqaruvi</h1>
					<p className='text-gray-600'>Combo va chegirmalarni boshqaring</p>
				</div>
				<Button className='bg-orange-600 hover:bg-orange-700' onClick={() => setShowModal(true)}>
					<Plus className='w-4 h-4 mr-2' /> Yangi deal
				</Button>
			</div>

			{error && <div className='text-red-600'>{error}</div>}

			<DealsTable
				deals={deals}
				onEdit={deal => {
					setActiveDeal(deal)
					setShowModal(true)
				}}
				onDelete={async deal => {
					await deleteDeal(deal.id)
				}}
			/>

			{showModal && (
				<DealModal
					deal={activeDeal}
					onClose={() => {
						setActiveDeal(null)
						setShowModal(false)
					}}
					onSuccess={async () => {
						await fetchDeals()
						setActiveDeal(null)
						setShowModal(false)
					}}
				/>
			)}
		</div>
	)
}
