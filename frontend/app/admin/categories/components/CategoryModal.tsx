import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCategoryForm } from '../hooks/useCategoryForm'
import { Category } from '../types/category.types'

interface CategoryModalProps {
	category: Category | null
	onClose: () => void
	onSuccess: (message: string) => void
}

import { useState } from 'react'

function ErrorModal({ message, onClose }: { message: string; onClose: () => void }) {
	return (
		<div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
			<div className='bg-white rounded-lg shadow-lg p-6 max-w-sm w-full'>
				<div className='text-lg font-semibold text-red-600 mb-2'>Xatolik!</div>
				<div className='text-gray-800 mb-4'>{message}</div>
				<ul className='text-sm text-gray-600 mb-4 list-disc pl-5'>
					<li>Kategoriya nomi bo&apos;sh bo&apos;lmasligi kerak.</li>
					<li>Kategoriya nomi takrorlanmasligi kerak.</li>
					<li>Barcha majburiy maydonlarni to&apos;g&apos;ri to&apos;ldiring.</li>
				</ul>
				<button
					className='bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded w-full'
					onClick={onClose}
				>
					Yopish
				</button>
			</div>
		</div>
	)
}

export function CategoryModal({ category, onClose, onSuccess }: CategoryModalProps) {
	const { loading, formData, setFormData, handleSubmit } = useCategoryForm(category)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await handleSubmit(onSuccess)
		} catch (error: unknown) {
			if (error instanceof Error) {
				setErrorMsg(error.message)
			} else {
				setErrorMsg('Xatolik yuz berdi')
			}
		}
	}

	return (
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
			<Card className='w-full max-w-2xl'>
				<CardHeader>
					<CardTitle>
						{category ? 'Kategoriyani tahrirlash' : "Yangi kategoriya qo'shish"}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{errorMsg && <ErrorModal message={errorMsg} onClose={() => setErrorMsg(null)} />}
					<form onSubmit={onSubmit} className='space-y-4'>
						{/* Name */}
						<div>
							<label className='block text-sm font-medium mb-2'>Nomi *</label>
							<input
								type='text'
								value={formData.name}
								onChange={e => setFormData({ ...formData, name: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
								placeholder='Pizzalar, Ichimliklar...'
								required
							/>
						</div>

						{/* Description */}
						<div>
							<label className='block text-sm font-medium mb-2'>Tavsif</label>
							<textarea
								value={formData.description}
								onChange={e => setFormData({ ...formData, description: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
								rows={3}
								placeholder='Kategoriya haqida qisqacha malumot...'
							/>
						</div>

						{/* Image URL */}
						<div>
							<label className='block text-sm font-medium mb-2'>Rasm URL</label>
							<input
								type='url'
								value={formData.imageUrl}
								onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
								className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
								placeholder='https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
							/>
						</div>

						{/* Is Active */}
						<div className='flex items-center gap-2'>
							<input
								type='checkbox'
								id='isActive'
								checked={formData.isActive}
								onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
								className='w-4 h-4'
							/>
							<label htmlFor='isActive' className='text-sm font-medium'>
								Faol kategoriya
							</label>
						</div>

						{/* Actions */}
						<div className='flex gap-4 pt-4'>
							<Button
								type='submit'
								disabled={loading}
								className='flex-1 bg-orange-600 hover:bg-orange-700'
							>
								{loading ? 'Saqlanmoqda...' : category ? 'Yangilash' : "Qo'shish"}
							</Button>
							<Button type='button' variant='outline' onClick={onClose} className='flex-1'>
								Bekor qilish
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
