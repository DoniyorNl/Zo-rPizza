import { ProductFormData, Category } from '../../types/product.types'

interface BasicTabProps {
	formData: ProductFormData
	setFormData: (data: ProductFormData) => void
	categories: Category[]
}

export function BasicTab({ formData, setFormData, categories }: BasicTabProps) {
	return (
		<div className='space-y-4'>
			<div>
				<label className='block text-sm font-medium mb-2'>Nomi *</label>
				<input
					type='text'
					value={formData.name}
					onChange={e => setFormData({ ...formData, name: e.target.value })}
					className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
					required
				/>
			</div>

			<div>
				<label className='block text-sm font-medium mb-2'>Tavsif *</label>
				<textarea
					value={formData.description}
					onChange={e => setFormData({ ...formData, description: e.target.value })}
					className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
					rows={3}
					required
				/>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium mb-2'>Narx (so'm) *</label>
					<input
						type='number'
						value={formData.price}
						onChange={e => setFormData({ ...formData, price: e.target.value })}
						className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
						min='0'
						required
					/>
				</div>
				<div>
					<label className='block text-sm font-medium mb-2'>Tayyorlash vaqti (daq) *</label>
					<input
						type='number'
						value={formData.prepTime}
						onChange={e => setFormData({ ...formData, prepTime: e.target.value })}
						className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
						min='1'
						required
					/>
				</div>
			</div>

			<div>
				<label className='block text-sm font-medium mb-2'>Kategoriya *</label>
				<select
					value={formData.categoryId}
					onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
					className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
					required
				>
					<option value=''>Tanlang...</option>
					{categories.map(cat => (
						<option key={cat.id} value={cat.id}>
							{cat.name}
						</option>
					))}
				</select>
			</div>

			<div>
				<label className='block text-sm font-medium mb-2'>Asosiy rasm URL</label>
				<input
					type='url'
					value={formData.imageUrl}
					onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
					className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
					placeholder='https://example.com/image.jpg'
				/>
			</div>

			<div className='flex items-center gap-2'>
				<input
					type='checkbox'
					id='isActive'
					checked={formData.isActive}
					onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
					className='w-4 h-4'
				/>
				<label htmlFor='isActive' className='text-sm font-medium'>
					Faol mahsulot
				</label>
			</div>
		</div>
	)
}
