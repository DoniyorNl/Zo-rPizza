// frontend/app/admin/coupons/hooks/useCoupons.ts
// ✅ Coupons data hooks

import { api } from '@/lib/apiClient'
import { useEffect, useState } from 'react'
import { Coupon } from '../types/coupon.types'

export function useCoupons() {
	const [coupons, setCoupons] = useState<Coupon[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const fetchCoupons = async () => {
		try {
			const response = await api.get('/api/coupons')
			setCoupons(response.data.data)
		} catch (err) {
			console.error('Error fetching coupons:', err)
			setError('Kuponlar yuklanmadi')
		} finally {
			setLoading(false)
		}
	}

	const deleteCoupon = async (id: string) => {
		await api.delete(`/api/coupons/${id}`)
		await fetchCoupons()
	}

	useEffect(() => {
		fetchCoupons()
	}, [])

	return { coupons, loading, error, fetchCoupons, deleteCoupon }
}
