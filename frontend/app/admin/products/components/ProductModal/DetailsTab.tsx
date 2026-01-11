import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import { ProductFormData } from '../../types/product.types'

interface DetailsTabProps {
	formData: ProductFormData
	setFormData: (data: ProductFormData) => void
}

export function DetailsTab({ formData, setFormData }: DetailsTabProps) {
	// Ingredients
	const addIngredient = () => {
		setFormData({
			...formData,
			ingredients: [...formData.ingredients, { name: '', amount: '', icon: '' }],
		})
	}

	const removeIngredient = (index: number) => {
		setFormData({
			...formData,
			ingredients: formData.ingredients.filter((_, i) => i !== index),
		})
	}

	const updateIngredient = (index: number, field: string, value: string) => {
		const updated = [...formData.ingredients]
		updated[index] = { ...updated[index], [field]: value }
		setFormData({ ...formData, ingredients: updated })
	}

	// Cooking Steps
	const addCookingStep = () => {
		setFormData({
			...formData,
			cookingSteps: [
				...formData.cookingSteps,
				{ step: formData.cookingSteps.length + 1, title: '', description: '' },
			],
		})
	}

	const removeCookingStep = (index: number) => {
		const updated = formData.cookingSteps
			.filter((_, i) => i !== index)
			.map((step, i) => ({ ...step, step: i + 1 }))
		setFormData({ ...formData, cookingSteps: updated })
	}

	const updateCookingStep = (index: number, field: string, value: string) => {
		const updated = [...formData.cookingSteps]
		updated[index] = { ...updated[index], [field]: value }
		setFormData({ ...formData, cookingSteps: updated })
	}

	// Allergens
	const addAllergen = (allergen: string) => {
		if (allergen && !formData.allergens.includes(allergen)) {
			setFormData({ ...formData, allergens: [...formData.allergens, allergen] })
		}
	}

	const removeAllergen = (allergen: string) => {
		setFormData({
			...formData,
			allergens: formData.allergens.filter(a => a !== allergen),
		})
	}

	// Images
	const addImage = (url: string) => {
		if (url && !formData.images.includes(url)) {
			setFormData({ ...formData, images: [...formData.images, url] })
		}
	}

	const removeImage = (url: string) => {
		setFormData({
			...formData,
			images: formData.images.filter(img => img !== url),
		})
	}

	return (
		<div className='space-y-4'>
			{/* Ingredients */}
			<div>
				<label className='block text-sm font-medium mb-2'>Tarkibi</label>
				{formData.ingredients.map((ing, index) => (
					<div key={index} className='flex gap-2 mb-2'>
						<input
							type='text'
							placeholder='Nomi'
							value={ing.name}
							onChange={e => updateIngredient(index, 'name', e.target.value)}
							className='flex-1 px-4 py-2 border rounded-lg'
						/>
						<input
							type='text'
							placeholder='Miqdori (500g)'
							value={ing.amount}
							onChange={e => updateIngredient(index, 'amount', e.target.value)}
							className='flex-1 px-4 py-2 border rounded-lg'
						/>
						<input
							type='text'
							placeholder='Icon (🌾)'
							value={ing.icon || ''}
							onChange={e => updateIngredient(index, 'icon', e.target.value)}
							className='w-20 px-4 py-2 border rounded-lg'
						/>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => removeIngredient(index)}
						>
							<Trash2 className='w-4 h-4' />
						</Button>
					</div>
				))}
				<Button type='button' variant='outline' onClick={addIngredient} className='w-full'>
					<Plus className='w-4 h-4 mr-2' />
					Ingredient qo'shish
				</Button>
			</div>

			{/* Recipe */}
			<div>
				<label className='block text-sm font-medium mb-2'>To'liq retsept</label>
				<textarea
					value={formData.recipe}
					onChange={e => setFormData({ ...formData, recipe: e.target.value })}
					className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
					rows={4}
					placeholder='Retsept matni...'
				/>
			</div>

			{/* Cooking Info */}
			<div className='grid grid-cols-3 gap-4'>
				<div>
					<label className='block text-sm font-medium mb-2'>Pishirish temp. (°C)</label>
					<input
						type='number'
						value={formData.cookingTemp}
						onChange={e => setFormData({ ...formData, cookingTemp: e.target.value })}
						className='w-full px-4 py-2 border rounded-lg'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium mb-2'>Pishirish vaqti (daq)</label>
					<input
						type='number'
						value={formData.cookingTime}
						onChange={e => setFormData({ ...formData, cookingTime: e.target.value })}
						className='w-full px-4 py-2 border rounded-lg'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium mb-2'>Qiyinlik</label>
					<select
						value={formData.difficulty}
						onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
						className='w-full px-4 py-2 border rounded-lg'
					>
						<option value=''>Tanlang...</option>
						<option value='Oson'>Oson</option>
						<option value="O'rtacha">O'rtacha</option>
						<option value='Qiyin'>Qiyin</option>
					</select>
				</div>
			</div>

			<div>
				<label className='block text-sm font-medium mb-2'>Kishilik soni</label>
				<input
					type='number'
					value={formData.servings}
					onChange={e => setFormData({ ...formData, servings: e.target.value })}
					className='w-full px-4 py-2 border rounded-lg'
					min='1'
				/>
			</div>

			{/* Cooking Steps */}
			<div>
				<label className='block text-sm font-medium mb-2'>Tayyorlash bosqichlari</label>
				{formData.cookingSteps.map((step, index) => (
					<div key={index} className='mb-3 p-3 border rounded-lg'>
						<div className='flex gap-2 mb-2'>
							<input
								type='text'
								placeholder='Sarlavha'
								value={step.title}
								onChange={e => updateCookingStep(index, 'title', e.target.value)}
								className='flex-1 px-4 py-2 border rounded-lg'
							/>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => removeCookingStep(index)}
							>
								<Trash2 className='w-4 h-4' />
							</Button>
						</div>
						<textarea
							placeholder='Tavsif'
							value={step.description}
							onChange={e => updateCookingStep(index, 'description', e.target.value)}
							className='w-full px-4 py-2 border rounded-lg'
							rows={2}
						/>
					</div>
				))}
				<Button type='button' variant='outline' onClick={addCookingStep} className='w-full'>
					<Plus className='w-4 h-4 mr-2' />
					Bosqich qo'shish
				</Button>
			</div>

			{/* Allergens */}
			<div>
				<label className='block text-sm font-medium mb-2'>Allergenlar</label>
				<div className='flex flex-wrap gap-2 mb-2'>
					{formData.allergens.map(allergen => (
						<Badge key={allergen} variant='outline' className='flex items-center gap-1'>
							{allergen}
							<button
								type='button'
								onClick={() => removeAllergen(allergen)}
								className='ml-1 text-red-600'
							>
								×
							</button>
						</Badge>
					))}
				</div>
				<input
					type='text'
					placeholder='Allergen nomi'
					onKeyPress={e => {
						if (e.key === 'Enter') {
							e.preventDefault()
							addAllergen(e.currentTarget.value)
							e.currentTarget.value = ''
						}
					}}
					className='w-full px-4 py-2 border rounded-lg'
				/>
			</div>

			{/* Additional Images */}
			<div>
				<label className='block text-sm font-medium mb-2'>Qo'shimcha rasmlar</label>
				<div className='flex flex-wrap gap-2 mb-2'>
					{formData.images.map((img, idx) => (
						<Badge key={idx} variant='outline' className='flex items-center gap-1'>
							Rasm {idx + 1}
							<button type='button' onClick={() => removeImage(img)} className='ml-1 text-red-600'>
								×
							</button>
						</Badge>
					))}
				</div>
				<input
					type='url'
					placeholder='Rasm URL'
					onKeyPress={e => {
						if (e.key === 'Enter') {
							e.preventDefault()
							addImage(e.currentTarget.value)
							e.currentTarget.value = ''
						}
					}}
					className='w-full px-4 py-2 border rounded-lg'
				/>
			</div>
		</div>
	)
}
