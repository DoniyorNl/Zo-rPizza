// frontend/app/admin/coupons/hooks/useCoupons.ts
// ✅ Coupons data hooks

import axios from 'axios'
import { useEffect, useState } from 'react'
import { Coupon } from '../types/coupon.types'

export function useCoupons() {
	const [coupons, setCoupons] = useState<Coupon[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const fetchCoupons = async () => {
		try {
			const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons`)
			setCoupons(response.data.data)
		} catch (err) {
			console.error('Error fetching coupons:', err)
			setError('Kuponlar yuklanmadi')
		} finally {
			setLoading(false)
		}
	}

	const deleteCoupon = async (id: string) => {
		await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/${id}`)
		await fetchCoupons()
	}

	useEffect(() => {
		fetchCoupons()
	}, [])

	return { coupons, loading, error, fetchCoupons, deleteCoupon }
}
