// frontend/app/admin/coupons/components/CouponModal.tsx
// ✅ Coupon create/edit modal

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Coupon, CouponFormData, CouponFormErrors, DiscountType } from '../types/coupon.types'

interface CouponModalProps {
	coupon: Coupon | null
	onClose: () => void
	onSuccess: () => void
}

const initialFormData: CouponFormData = {
	code: '',
	description: '',
	discountType: 'PERCENT',
	discountValue: '',
	isActive: true,
	startsAt: '',
	endsAt: '',
	usageLimit: '',
	perUserLimit: '',
}

export function CouponModal({ coupon, onClose, onSuccess }: CouponModalProps) {
	const [formData, setFormData] = useState<CouponFormData>(initialFormData)
	const [errors, setErrors] = useState<CouponFormErrors>({})
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!coupon) return
		setFormData({
			code: coupon.code,
			description: coupon.description || '',
			discountType: coupon.discountType,
			discountValue: coupon.discountValue.toString(),
			isActive: coupon.isActive,
			startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 10) : '',
			endsAt: coupon.endsAt ? coupon.endsAt.slice(0, 10) : '',
			usageLimit: coupon.usageLimit?.toString() || '',
			perUserLimit: coupon.perUserLimit?.toString() || '',
		})
	}, [coupon])

	const validate = () => {
		const nextErrors: CouponFormErrors = {}
		if (!formData.code.trim()) nextErrors.code = 'Kod majburiy'
		if (!formData.discountValue || Number(formData.discountValue) <= 0) {
			nextErrors.discountValue = 'Chegirma 0 dan katta bolishi kerak'
		}
		if (formData.startsAt && formData.endsAt && formData.startsAt > formData.endsAt) {
			nextErrors.dateRange = 'Sana oraligi notogri'
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
				code: formData.code.trim(),
				description: formData.description || undefined,
				discountType: formData.discountType,
				discountValue: Number(formData.discountValue),
				isActive: formData.isActive,
				startsAt: formData.startsAt ? new Date(formData.startsAt) : undefined,
				endsAt: formData.endsAt ? new Date(formData.endsAt) : undefined,
				usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
				perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : undefined,
			}

			if (coupon) {
				await api.put(`/api/coupons/${coupon.id}`, payload)
			} else {
				await api.post('/api/coupons', payload)
			}
			onSuccess()
		} catch (err) {
			console.error('Error saving coupon:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
			<Card className='w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
				<CardHeader>
					<CardTitle>{coupon ? 'Kupon tahrirlash' : 'Yangi kupon'}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium mb-2'>Kod *</label>
							<input
								value={formData.code}
								onChange={e => setFormData({ ...formData, code: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg'
							/>
							{errors.code && <p className='text-xs text-red-600 mt-1'>{errors.code}</p>}
						</div>

						<div>
							<label className='block text-sm font-medium mb-2'>Tavsif</label>
							<textarea
								value={formData.description}
								onChange={e => setFormData({ ...formData, description: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg'
								rows={2}
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

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-medium mb-2'>Umumiy limit</label>
								<input
									type='number'
									min='1'
									value={formData.usageLimit}
									onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
									className='w-full px-4 py-2 border rounded-lg'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium mb-2'>User limit</label>
								<input
									type='number'
									min='1'
									value={formData.perUserLimit}
									onChange={e => setFormData({ ...formData, perUserLimit: e.target.value })}
									className='w-full px-4 py-2 border rounded-lg'
								/>
							</div>
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
