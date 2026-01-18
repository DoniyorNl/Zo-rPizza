// frontend/app/admin/deals/components/DealModal.tsx
// ✅ Deal create/edit modal

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import axios from 'axios'
import { useEffect, useState } from 'react'
import {
	Deal,
	DealFormData,
	DealFormErrors,
	DealItemForm,
	DealItemType,
	DealProduct,
	DiscountType,
} from '../types/deal.types'

interface DealModalProps {
	deal: Deal | null
	onClose: () => void
	onSuccess: (message: string) => void
}

const initialFormData: DealFormData = {
	title: '',
	description: '',
	imageUrl: '',
	discountType: 'PERCENT',
	discountValue: '',
	isActive: true,
	startsAt: '',
	endsAt: '',
	items: [],
}

export function DealModal({ deal, onClose, onSuccess }: DealModalProps) {
	const [formData, setFormData] = useState<DealFormData>(initialFormData)
	const [errors, setErrors] = useState<DealFormErrors>({})
	const [products, setProducts] = useState<DealProduct[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const fetchProducts = async () => {
			const response = await api.get('/api/products')
			setProducts(response.data.data)
		}
		fetchProducts()
	}, [])

	useEffect(() => {
		if (!deal) return
		setFormData({
			title: deal.title,
			description: deal.description || '',
			imageUrl: deal.imageUrl || '',
			discountType: deal.discountType,
			discountValue: deal.discountValue.toString(),
			isActive: deal.isActive,
			startsAt: deal.startsAt ? deal.startsAt.slice(0, 10) : '',
			endsAt: deal.endsAt ? deal.endsAt.slice(0, 10) : '',
			items: deal.items.map(item => ({
				productId: item.productId,
				itemType: item.itemType,
				quantity: item.quantity.toString(),
			})),
		})
	}, [deal])

	const addItem = () => {
		setFormData(prev => ({
			...prev,
			items: [
				...prev.items,
				{
					productId: '',
					itemType: 'PIZZA',
					quantity: '1',
				},
			],
		}))
	}

	const updateItem = (index: number, patch: Partial<DealItemForm>) => {
		const next = [...formData.items]
		next[index] = { ...next[index], ...patch }
		setFormData({ ...formData, items: next })
	}

	const removeItem = (index: number) => {
		setFormData(prev => ({
			...prev,
			items: prev.items.filter((_, i) => i !== index),
		}))
	}

	const validate = () => {
		const nextErrors: DealFormErrors = {}
		if (!formData.title.trim()) nextErrors.title = 'Sarlavha majburiy'
		if (!formData.discountValue || Number(formData.discountValue) <= 0) {
			nextErrors.discountValue = 'Chegirma 0 dan katta bolishi kerak'
		}
		if (formData.startsAt && formData.endsAt && formData.startsAt > formData.endsAt) {
			nextErrors.dateRange = 'Sana oraligi notogri'
		}
		if (formData.items.length === 0) {
			nextErrors.items = 'Kamida bitta mahsulot kerak'
		}
		nextErrors.itemRows = formData.items.map(item => {
			const rowErrors: { productId?: string; quantity?: string } = {}
			if (!item.productId) rowErrors.productId = 'Mahsulot tanlang'
			if (!item.quantity || Number(item.quantity) <= 0) {
				rowErrors.quantity = 'Miqdor 0 dan katta bolishi kerak'
			}
			return rowErrors
		})
		setErrors(nextErrors)
		return Object.keys(nextErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return

		setLoading(true)
		try {
			const payload = {
				title: formData.title,
				description: formData.description || undefined,
				imageUrl: formData.imageUrl || undefined,
				discountType: formData.discountType,
				discountValue: Number(formData.discountValue),
				isActive: formData.isActive,
				startsAt: formData.startsAt ? new Date(formData.startsAt) : undefined,
				endsAt: formData.endsAt ? new Date(formData.endsAt) : undefined,
				items: formData.items.map(item => ({
					productId: item.productId,
					itemType: item.itemType as DealItemType,
					quantity: Number(item.quantity),
				})),
			}

			if (deal) {
				await api.put(`/api/deals/${deal.id}`, payload)
				onSuccess('Deal yangilandi')
			} else {
				await api.post('/api/deals', payload)
				onSuccess('Deal yaratildi')
			}
		} catch (err) {
			console.error('Error saving deal:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
			<Card className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
				<CardHeader>
					<CardTitle>{deal ? 'Deal tahrirlash' : 'Yangi deal'}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium mb-2'>Sarlavha *</label>
							<input
								value={formData.title}
								onChange={e => setFormData({ ...formData, title: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg'
							/>
							{errors.title && <p className='text-xs text-red-600 mt-1'>{errors.title}</p>}
						</div>

						<div>
							<label className='block text-sm font-medium mb-2'>Tavsif</label>
							<textarea
								value={formData.description}
								onChange={e => setFormData({ ...formData, description: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg'
								rows={3}
							/>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-medium mb-2'>Chegirma turi</label>
								<select
									value={formData.discountType}
									onChange={e =>
										setFormData({
											...formData,
											discountType: e.target.value as DiscountType,
										})
									}
									className='w-full px-4 py-2 border rounded-lg'
								>
									<option value='PERCENT'>Foiz</option>
									<option value='FIXED'>Summa</option>
								</select>
							</div>
							<div>
								<label className='block text-sm font-medium mb-2'>Chegirma qiymati *</label>
								<input
									type='number'
									value={formData.discountValue}
									onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
									className='w-full px-4 py-2 border rounded-lg'
								/>
								{errors.discountValue && (
									<p className='text-xs text-red-600 mt-1'>{errors.discountValue}</p>
								)}
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-medium mb-2'>Boshlanish sanasi</label>
								<input
									type='date'
									value={formData.startsAt}
									onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
									className='w-full px-4 py-2 border rounded-lg'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium mb-2'>Tugash sanasi</label>
								<input
									type='date'
									value={formData.endsAt}
									onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
									className='w-full px-4 py-2 border rounded-lg'
								/>
							</div>
						</div>
						{errors.dateRange && <p className='text-xs text-red-600'>{errors.dateRange}</p>}

						<div className='flex items-center gap-2'>
							<input
								type='checkbox'
								checked={formData.isActive}
								onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
							/>
							<span className='text-sm'>Faol</span>
						</div>

						<div className='border rounded-lg p-4 space-y-3'>
							<div className='flex items-center justify-between'>
								<p className='text-sm font-medium'>Combo tarkibi</p>
								<button
									type='button'
									onClick={addItem}
									className='text-sm text-orange-600 hover:text-orange-700'
								>
									+ Mahsulot qoshish
								</button>
							</div>
							{errors.items && <p className='text-xs text-red-600'>{errors.items}</p>}

							{formData.items.map((item, index) => (
								<div key={`${item.productId}-${index}`} className='grid grid-cols-12 gap-3 items-end'>
									<div className='col-span-5'>
										<label className='block text-xs font-medium mb-1'>Mahsulot</label>
										<select
											value={item.productId}
											onChange={e => updateItem(index, { productId: e.target.value })}
											className='w-full px-3 py-2 border rounded-lg text-sm'
										>
											<option value=''>Tanlang...</option>
											{products.map(product => (
												<option key={product.id} value={product.id}>
													{product.name}
												</option>
											))}
										</select>
										{errors.itemRows?.[index]?.productId && (
											<p className='text-[11px] text-red-600 mt-1'>
												{errors.itemRows[index]?.productId}
											</p>
										)}
									</div>

									<div className='col-span-3'>
										<label className='block text-xs font-medium mb-1'>Turi</label>
										<select
											value={item.itemType}
											onChange={e =>
												updateItem(index, { itemType: e.target.value as DealItemType })
											}
											className='w-full px-3 py-2 border rounded-lg text-sm'
										>
											<option value='PIZZA'>Pizza</option>
											<option value='DRINK'>Drink</option>
											<option value='SIDE'>Side</option>
										</select>
									</div>

									<div className='col-span-2'>
										<label className='block text-xs font-medium mb-1'>Miqdor</label>
										<input
											type='number'
											min='1'
											value={item.quantity}
											onChange={e => updateItem(index, { quantity: e.target.value })}
											className='w-full px-3 py-2 border rounded-lg text-sm'
										/>
										{errors.itemRows?.[index]?.quantity && (
											<p className='text-[11px] text-red-600 mt-1'>
												{errors.itemRows[index]?.quantity}
											</p>
										)}
									</div>

									<div className='col-span-2'>
										<Button
											type='button'
											variant='outline'
											className='w-full text-red-600'
											onClick={() => removeItem(index)}
										>
											Ochirish
										</Button>
									</div>
								</div>
							))}
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
