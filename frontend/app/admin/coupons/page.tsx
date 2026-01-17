// frontend/app/admin/coupons/page.tsx
// ✅ Coupons admin page

'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CouponModal } from './components/CouponModal'
import { CouponsTable } from './components/CouponsTable'
import { useCoupons } from './hooks/useCoupons'
import { Coupon } from './types/coupon.types'

export default function AdminCouponsPage() {
	const { coupons, loading, error, fetchCoupons, deleteCoupon } = useCoupons()
	const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null)
	const [showModal, setShowModal] = useState(false)

	if (loading) {
		return <div className='p-6 text-center'>Yuklanmoqda...</div>
	}

	return (
		<div className='p-6 space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Kuponlar boshqaruvi</h1>
					<p className='text-gray-600'>Promo va kuponlarni boshqaring</p>
				</div>
				<Button className='bg-orange-600 hover:bg-orange-700' onClick={() => setShowModal(true)}>
					<Plus className='w-4 h-4 mr-2' /> Yangi kupon
				</Button>
			</div>

			{error && <div className='text-red-600'>{error}</div>}

			<CouponsTable
				coupons={coupons}
				onEdit={coupon => {
					setActiveCoupon(coupon)
					setShowModal(true)
				}}
				onDelete={async coupon => {
					await deleteCoupon(coupon.id)
				}}
			/>

			{showModal && (
				<CouponModal
					coupon={activeCoupon}
					onClose={() => {
						setActiveCoupon(null)
						setShowModal(false)
					}}
					onSuccess={async () => {
						await fetchCoupons()
						setActiveCoupon(null)
						setShowModal(false)
					}}
				/>
			)}
		</div>
	)
}
