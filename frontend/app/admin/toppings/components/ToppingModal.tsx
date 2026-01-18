// frontend/app/admin/toppings/components/ToppingModal.tsx
// ✅ Topping create/edit modal

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Topping, ToppingFormData, ToppingFormErrors } from '../types/topping.types'

interface ToppingModalProps {
	topping: Topping | null
	onClose: () => void
	onSuccess: () => void
}

const initialFormData: ToppingFormData = {
	name: '',
	price: '',
	isActive: true,
}

export function ToppingModal({ topping, onClose, onSuccess }: ToppingModalProps) {
	const [formData, setFormData] = useState<ToppingFormData>(initialFormData)
	const [errors, setErrors] = useState<ToppingFormErrors>({})
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!topping) return
		setFormData({
			name: topping.name,
			price: topping.price.toString(),
			isActive: topping.isActive,
		})
	}, [topping])

	const validate = () => {
		const nextErrors: ToppingFormErrors = {}
		if (!formData.name.trim()) nextErrors.name = 'Nomi majburiy'
		if (!formData.price || Number(formData.price) < 0) {
			nextErrors.price = 'Narx 0 yoki undan katta bolishi kerak'
		}
		setErrors(nextErrors)
		return Object.keys(nextErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return

		setLoading(true)
		try {
			const payload = {
				name: formData.name.trim(),
				price: Number(formData.price),
				isActive: formData.isActive,
			}
			if (topping) {
				await api.put(`/api/toppings/${topping.id}`, payload)
			} else {
				await api.post('/api/toppings', payload)
			}
			onSuccess()
		} catch (err) {
			console.error('Error saving topping:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
			<Card className='w-full max-w-2xl'>
				<CardHeader>
					<CardTitle>{topping ? 'Topping tahrirlash' : 'Yangi topping'}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium mb-2'>Nomi *</label>
							<input
								value={formData.name}
								onChange={e => setFormData({ ...formData, name: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg'
							/>
							{errors.name && <p className='text-xs text-red-600 mt-1'>{errors.name}</p>}
						</div>

						<div>
							<label className='block text-sm font-medium mb-2'>Narx (so&apos;m)</label>
							<input
								type='number'
								value={formData.price}
								onChange={e => setFormData({ ...formData, price: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg'
							/>
							{errors.price && <p className='text-xs text-red-600 mt-1'>{errors.price}</p>}
						</div>

						<div className='flex items-center gap-2'>
							<input
								type='checkbox'
								checked={formData.isActive}
								onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
							/>
							<span className='text-sm'>Faol</span>
						</div>

						<div className='flex gap-4 pt-2'>
							<Button type='submit' className='flex-1 bg-orange-600 hover:bg-orange-700' disabled={loading}>
								{loading ? 'Saqlanmoqda...' : 'Saqlash'}
							</Button>
							<Button type='button' variant='outline' className='flex-1' onClick={onClose}>
								Bekor qilish
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
