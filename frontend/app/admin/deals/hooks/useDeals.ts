// frontend/app/admin/deals/hooks/useDeals.ts
// ✅ Deals data hooks

import { api } from '@/lib/apiClient'
import { useEffect, useState } from 'react'
import { Deal } from '../types/deal.types'

export function useDeals() {
	const [deals, setDeals] = useState<Deal[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const fetchDeals = async () => {
		try {
			const response = await api.get('/api/deals')
			setDeals(response.data.data)
		} catch (err) {
			console.error('Error fetching deals:', err)
			setError('Deals yuklanmadi')
		} finally {
			setLoading(false)
		}
	}

	const deleteDeal = async (id: string) => {
		await api.delete(`/api/deals/${id}`)
		await fetchDeals()
	}

	useEffect(() => {
		fetchDeals()
	}, [])

	return {
		deals,
		loading,
		error,
		fetchDeals,
		deleteDeal,
	}
}
