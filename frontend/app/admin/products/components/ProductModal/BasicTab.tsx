import { ProductFormData, Category, ProductVariationForm } from '../../types/product.types'

interface BasicTabProps {
	formData: ProductFormData
	setFormData: (data: ProductFormData) => void
	categories: Category[]
}

export function BasicTab({ formData, setFormData, categories }: BasicTabProps) {
	const sizeOptions = ['Small', 'Medium', 'Large', 'XL']

	const updateVariation = (index: number, patch: Partial<ProductVariationForm>) => {
		const next = [...formData.variations]
		next[index] = { ...next[index], ...patch }
		setFormData({ ...formData, variations: next })
	}

	const addVariation = () => {
		setFormData({
			...formData,
			variations: [
				...formData.variations,
				{ size: 'Medium', price: '', diameter: '', slices: '', weight: '' },
			],
		})
	}

	const removeVariation = (index: number) => {
		const next = formData.variations.filter((_, i) => i !== index)
		setFormData({ ...formData, variations: next })
	}

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
					<label className='block text-sm font-medium mb-2'>Asosiy narx (so&apos;m) *</label>
					<input
						type='number'
						value={formData.basePrice}
						onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
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

			{/* Variations */}
			<div className='border rounded-lg p-4 space-y-4'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm font-medium'>O&apos;lchamlar va narxlar</p>
						<p className='text-xs text-gray-500'>
							Agar bo&apos;sh qoldirilsa, faqat asosiy narx ishlatiladi.
						</p>
					</div>
					<button
						type='button'
						onClick={addVariation}
						className='text-sm font-medium text-orange-600 hover:text-orange-700'
					>
						+ O&apos;lcham qo&apos;shish
					</button>
				</div>

				{formData.variations.length === 0 ? (
					<div className='text-sm text-gray-500'>Hozircha o&apos;lchamlar yo&apos;q</div>
				) : (
					<div className='space-y-3'>
						{formData.variations.map((variation, index) => (
							<div key={`${variation.size}-${index}`} className='border rounded-lg p-3 space-y-3'>
								<div className='flex items-center justify-between gap-3'>
									<div className='grid grid-cols-2 gap-3 flex-1'>
										<div>
											<label className='block text-xs font-medium mb-1'>O&apos;lcham</label>
											<select
												value={variation.size}
												onChange={e => updateVariation(index, { size: e.target.value })}
												className='w-full px-3 py-2 border rounded-lg text-sm'
											>
												{sizeOptions.map(size => (
													<option key={size} value={size}>
														{size}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className='block text-xs font-medium mb-1'>Narx (so&apos;m)</label>
											<input
												type='number'
												min='0'
												value={variation.price}
												onChange={e => updateVariation(index, { price: e.target.value })}
												className='w-full px-3 py-2 border rounded-lg text-sm'
												required
											/>
										</div>
									</div>
									<button
										type='button'
										onClick={() => removeVariation(index)}
										className='text-sm text-red-500 hover:text-red-600'
									>
										O&apos;chirish
									</button>
								</div>

								<div className='grid grid-cols-3 gap-3'>
									<div>
										<label className='block text-xs font-medium mb-1'>Diametr (cm)</label>
										<input
											type='number'
											min='0'
											value={variation.diameter}
											onChange={e => updateVariation(index, { diameter: e.target.value })}
											className='w-full px-3 py-2 border rounded-lg text-sm'
										/>
									</div>
									<div>
										<label className='block text-xs font-medium mb-1'>Bo&apos;lak</label>
										<input
											type='number'
											min='0'
											value={variation.slices}
											onChange={e => updateVariation(index, { slices: e.target.value })}
											className='w-full px-3 py-2 border rounded-lg text-sm'
										/>
									</div>
									<div>
										<label className='block text-xs font-medium mb-1'>Og&apos;irlik (g)</label>
										<input
											type='number'
											min='0'
											value={variation.weight}
											onChange={e => updateVariation(index, { weight: e.target.value })}
											className='w-full px-3 py-2 border rounded-lg text-sm'
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
