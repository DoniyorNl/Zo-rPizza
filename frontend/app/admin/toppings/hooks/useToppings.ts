// frontend/app/admin/toppings/hooks/useToppings.ts
// ✅ Toppings data hooks

import { api } from '@/lib/apiClient'
import { useEffect, useState } from 'react'
import { Topping } from '../types/topping.types'

export function useToppings() {
	const [toppings, setToppings] = useState<Topping[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const fetchToppings = async () => {
		try {
			const response = await api.get('/api/toppings')
			setToppings(response.data.data)
		} catch (err) {
			console.error('Error fetching toppings:', err)
			setError('Toppinglar yuklanmadi')
		} finally {
			setLoading(false)
		}
	}

	const deleteTopping = async (id: string) => {
		await api.delete(`/api/toppings/${id}`)
		await fetchToppings()
	}

	useEffect(() => {
		fetchToppings()
	}, [])

	return { toppings, loading, error, fetchToppings, deleteTopping }
}
