import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { useProductForm } from '../../hooks/useProductForm'
import { Product, TabType } from '../../types/product.types'
import { BasicTab } from './BasicTab'
import { DetailsTab } from './DetailsTab'
import { NutritionTab } from './NutritionTab'

interface ProductModalProps {
	product: Product | null
	onClose: () => void
	onSuccess: (message: string) => void
}

export function ProductModal({ product, onClose, onSuccess }: ProductModalProps) {
	const [activeTab, setActiveTab] = useState<TabType>('basic')
	const { loading, categories, formData, setFormData, errors, setErrors, toppings, handleSubmit } =
		useProductForm(product)

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setErrors({})
		handleSubmit(onSuccess)
	}

	return (
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
			<Card className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
				<CardHeader>
					<CardTitle>{product ? 'Mahsulotni tahrirlash' : "Yangi mahsulot qo'shish"}</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Tabs */}
					<div className='border-b mb-6'>
						<div className='flex gap-4'>
							{(['basic', 'details', 'nutrition'] as TabType[]).map(tab => (
								<button
									key={tab}
									type='button'
									onClick={() => setActiveTab(tab)}
									className={`pb-3 px-4 font-medium ${activeTab === tab
										? 'border-b-2 border-orange-600 text-orange-600'
										: 'text-gray-600'
										}`}
								>
									{tab === 'basic' && "Asosiy ma'lumotlar"}
									{tab === 'details' && "Qo'shimcha ma'lumotlar"}
									{tab === 'nutrition' && 'Ozuqaviy qiymat'}
								</button>
							))}
						</div>
					</div>

					<form onSubmit={onSubmit} className='space-y-4'>
						{activeTab === 'basic' && (
							<BasicTab
								formData={formData}
								setFormData={setFormData}
								categories={categories}
								errors={errors}
								toppings={toppings}
							/>
						)}
						{activeTab === 'details' && (
							<DetailsTab formData={formData} setFormData={setFormData} />
						)}
						{activeTab === 'nutrition' && (
							<NutritionTab formData={formData} setFormData={setFormData} />
						)}

						{/* Actions */}
						<div className='flex gap-4 pt-4'>
							<Button
								type='submit'
								disabled={loading}
								className='flex-1 bg-orange-600 hover:bg-orange-700'
							>
								{loading ? 'Saqlanmoqda...' : product ? 'Yangilash' : "Qo'shish"}
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
