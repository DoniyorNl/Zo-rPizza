import { ProductFormData } from '../../types/product.types'

interface NutritionTabProps {
	formData: ProductFormData
	setFormData: (data: ProductFormData) => void
}

export function NutritionTab({ formData, setFormData }: NutritionTabProps) {
	return (
		<div className='space-y-4'>
			<div className='grid grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium mb-2'>Kaloriya (kkal)</label>
					<input
						type='number'
						value={formData.calories}
						onChange={e => setFormData({ ...formData, calories: e.target.value })}
						className='w-full px-4 py-2 border rounded-lg'
						min='0'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium mb-2'>Oqsil (g)</label>
					<input
						type='number'
						value={formData.protein}
						onChange={e => setFormData({ ...formData, protein: e.target.value })}
						className='w-full px-4 py-2 border rounded-lg'
						min='0'
						step='0.1'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium mb-2'>Uglevod (g)</label>
					<input
						type='number'
						value={formData.carbs}
						onChange={e => setFormData({ ...formData, carbs: e.target.value })}
						className='w-full px-4 py-2 border rounded-lg'
						min='0'
						step='0.1'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium mb-2'>Yog' (g)</label>
					<input
						type='number'
						value={formData.fat}
						onChange={e => setFormData({ ...formData, fat: e.target.value })}
						className='w-full px-4 py-2 border rounded-lg'
						min='0'
						step='0.1'
					/>
				</div>
			</div>
		</div>
	)
}
