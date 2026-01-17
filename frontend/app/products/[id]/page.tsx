// frontend/app/products/[id]/page.tsx
// 🍕 ZOR PIZZA - PRODUCT DETAIL PAGE (Updated with Variations)

'use client'

import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCartStore } from '@/store/cartStore'
import axios from 'axios'
import { AlertCircle, ArrowLeft, Clock, Flame, Pizza, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

// ============================================
// TYPES & INTERFACES
// ============================================

interface ProductVariation {
	id: string
	size: string
	price: number
	diameter?: number
	slices?: number
	weight?: number
}

interface Topping {
	id: string
	name: string
	price: number
}

interface ProductTopping {
	topping: Topping
}

interface Product {
	id: string
	name: string
	description: string
	basePrice: number // ✅ Changed from 'price'
	imageUrl: string
	prepTime: number
	ingredients?: Array<{ name: string; amount: string; icon?: string }>
	recipe?: string
	cookingTemp?: number
	cookingTime?: number
	cookingSteps?: Array<{ step: number; title: string; description: string }>
	calories?: number
	protein?: number
	carbs?: number
	fat?: number
	difficulty?: string
	servings?: number
	allergens?: string[]
	images?: string[]
	variations: ProductVariation[] // ✅ NEW
	productToppings?: ProductTopping[]
	category?: { id: string; name: string }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const { addItem } = useCartStore()
	const [product, setProduct] = useState<Product | null>(null)
	const [loading, setLoading] = useState(true)
	const [selectedImage, setSelectedImage] = useState(0)

	// ✅ NEW: Size selection state
	const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
	const [toppings, setToppings] = useState<Topping[]>([])
	const [addedToppingIds, setAddedToppingIds] = useState<string[]>([])
	const [removedToppingIds, setRemovedToppingIds] = useState<string[]>([])
	const [halfProducts, setHalfProducts] = useState<Product[]>([])
	const [halfProductId, setHalfProductId] = useState<string>('')

	// ============================================
	// DATA FETCHING
	// ============================================

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
				const productData = response.data.data

				// JSON parsing (o'zgarishsiz)
				if (productData.ingredients && typeof productData.ingredients === 'string') {
					try {
						productData.ingredients = JSON.parse(productData.ingredients)
					} catch (e) {
						console.error(e)
					}
				}
				if (productData.cookingSteps && typeof productData.cookingSteps === 'string') {
					try {
						productData.cookingSteps = JSON.parse(productData.cookingSteps)
					} catch (e) {
						console.error(e)
					}
				}
				if (!productData.images) productData.images = []
				if (!productData.allergens) productData.allergens = []

				setProduct(productData)

				// ✅ NEW: Auto-select Medium or first variation
				if (productData.variations && productData.variations.length > 0) {
					const mediumVariation = productData.variations.find(
						(v: ProductVariation) => v.size === 'Medium',
					)
					setSelectedVariation(mediumVariation || productData.variations[0])
				}

				console.log('✅ Product loaded:', productData.name)
			} catch (error) {
				console.error('❌ Error fetching product:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchProduct()
	}, [id])

	useEffect(() => {
		const fetchExtras = async () => {
			try {
				const [toppingsResponse, productsResponse] = await Promise.all([
					axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/toppings`),
					axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, { params: { isActive: true } }),
				])
				setToppings(toppingsResponse.data.data)
				setHalfProducts(productsResponse.data.data)
			} catch (error) {
				console.error('❌ Error fetching extras:', error)
			}
		}

		fetchExtras()
	}, [])

	// ============================================
	// HANDLERS
	// ============================================

	const handleAddToCart = () => {
		if (!product || !selectedVariation) return

		addItem({
			productId: product.id,
			variationId: selectedVariation.id,
			name: product.name,
			size: selectedVariation.size,
			price: currentPrice,
			imageUrl:
				product.imageUrl || (product.images && product.images[0]) || '/images/placeholder.png',
			addedToppingIds,
			removedToppingIds,
			halfProductId: selectedHalfProduct ? selectedHalfProduct.id : undefined,
			halfProductName: selectedHalfProduct ? selectedHalfProduct.name : undefined,
		})

		console.log('✅ Added to cart:', product.name, selectedVariation.size)
	}

	// ============================================
	// LOADING & NOT FOUND
	// ============================================

	if (loading)
		return (
			<div className='min-h-screen flex items-center justify-center font-medium text-stone-500'>
				<div className='text-center'>
					<div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4'></div>
					<p>Yuklanmoqda...</p>
				</div>
			</div>
		)

	if (!product)
		return (
			<div className='min-h-screen flex flex-col items-center justify-center gap-4'>
				<h1 className='text-xl font-bold'>Mahsulot topilmadi</h1>
				<Button onClick={() => router.push('/')}>Bosh sahifaga qaytish</Button>
			</div>
		)

	// ============================================
	// PREPARE DATA
	// ============================================

	const displayImages =
		product.images && product.images.length > 0
			? product.images
			: [product.imageUrl || '/images/placeholder.png']

	const selectedHalfProduct = halfProducts.find(item => item.id === halfProductId) || null
	const defaultToppingIds = product.productToppings
		? product.productToppings.map(item => item.topping.id)
		: []

	const getVariationPrice = (item: Product | null, size: string | undefined) => {
		if (!item) return 0
		if (!item.variations || item.variations.length === 0) return item.basePrice
		if (!size) return item.basePrice
		const variation = item.variations.find(v => v.size === size)
		return variation ? variation.price : item.basePrice
	}

	const basePrice = selectedVariation?.price || product.basePrice
	const halfPrice = selectedHalfProduct
		? getVariationPrice(selectedHalfProduct, selectedVariation?.size)
		: 0
	const extraToppingsPrice = toppings
		.filter(topping => addedToppingIds.includes(topping.id))
		.reduce((sum, topping) => sum + topping.price, 0)
	const currentPrice = Math.max(basePrice, halfPrice) + extraToppingsPrice

	// ============================================
	// MAIN RENDER
	// ============================================

	return (
		<main className='min-h-screen bg-white'>
			<Header />

			<div className='container mx-auto px-4 py-4 max-w-5xl'>
				<Button
					variant='ghost'
					size='sm'
					onClick={() => router.back()}
					className='mb-4 text-stone-500'
				>
					<ArrowLeft className='w-4 h-4 mr-1' /> Orqaga
				</Button>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
					{/* ============================================ */}
					{/* LEFT: VISUAL SECTION */}
					{/* ============================================ */}
					<div className='space-y-4'>
						<div className='relative aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-sm'>
							<Image
								src={displayImages[selectedImage]}
								alt={product.name}
								fill
								className='object-cover'
								priority
								sizes='(max-width: 768px) 100vw, 50vw'
							/>
						</div>
						{displayImages.length > 1 && (
							<div className='flex gap-2 overflow-x-auto pb-2'>
								{displayImages.map((img: string, idx: number) => (
									<button
										key={idx}
										onClick={() => setSelectedImage(idx)}
										className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-orange-500' : 'border-transparent opacity-60'
											}`}
									>
										<Image src={img} alt='thumb' fill className='object-cover' sizes='80px' />
									</button>
								))}
							</div>
						)}
					</div>

					{/* ============================================ */}
					{/* RIGHT: INFO SECTION */}
					{/* ============================================ */}
					<div className='flex flex-col'>
						{/* Header */}
						<div className='mb-4'>
							<div className='flex gap-2 mb-2'>
								{product.difficulty && (
									<Badge
										variant='secondary'
										className='bg-orange-50 text-orange-700 hover:bg-orange-50'
									>
										{product.difficulty}
									</Badge>
								)}
								{product.servings && (
									<Badge variant='secondary' className='bg-blue-50 text-blue-700 hover:bg-blue-50'>
										{product.servings} kishi
									</Badge>
								)}
							</div>
							<h1 className='text-3xl font-bold text-stone-900 mb-2'>{product.name}</h1>
							<p className='text-stone-600 text-sm leading-relaxed'>{product.description}</p>
						</div>

						{/* ============================================ */}
						{/* SIZE SELECTOR */}
						{/* ============================================ */}
						{product.variations && product.variations.length > 0 && (
							<div className='mb-6'>
								<div className='flex items-center gap-2 mb-3'>
									<Pizza className='w-5 h-5 text-orange-600' />
									<h3 className='font-bold text-sm'>O&apos;lchamni tanlang</h3>
								</div>
								<div className='grid grid-cols-2 gap-3'>
									{product.variations.map(variation => (
										<button
											key={variation.id}
											onClick={() => setSelectedVariation(variation)}
											className={`p-3 border-2 rounded-xl transition-all text-left ${selectedVariation?.id === variation.id
												? 'border-orange-600 bg-orange-50 shadow-sm'
												: 'border-stone-200 hover:border-orange-300'
												}`}
										>
											<div className='font-bold text-sm'>{variation.size}</div>
											{variation.diameter && (
												<div className='text-xs text-stone-500'>{variation.diameter}cm</div>
											)}
											{variation.slices && (
												<div className='text-xs text-stone-500'>{variation.slices} bo&apos;lak</div>
											)}
											<div className='text-sm font-semibold text-orange-600 mt-1'>
												{variation.price.toLocaleString()} so&apos;m
											</div>
										</button>
									))}
								</div>
							</div>
						)}

						{/* ============================================ */}
						{/* HALF AND HALF */}
						{/* ============================================ */}
						<div className='mb-6'>
							<div className='flex items-center gap-2 mb-3'>
								<Pizza className='w-5 h-5 text-orange-600' />
								<h3 className='font-bold text-sm'>Half &amp; Half</h3>
							</div>
							<select
								value={halfProductId}
								onChange={e => setHalfProductId(e.target.value)}
								className='w-full px-3 py-2 border rounded-lg text-sm'
							>
								<option value=''>Bitta pitsa (oddiy)</option>
								{halfProducts
									.filter(item => item.id !== product.id)
									.map(item => (
										<option key={item.id} value={item.id}>
											{item.name}
										</option>
									))}
							</select>
							{selectedHalfProduct && (
								<p className='text-xs text-gray-500 mt-2'>
									Narx ikkala pitsaning yuqori narxiga teng bo&apos;ladi.
								</p>
							)}
						</div>

						{/* ============================================ */}
						{/* TOPPINGS */}
						{/* ============================================ */}
						<div className='mb-6 space-y-4'>
							<div>
								<h3 className='font-bold text-sm mb-2'>Extra toppinglar</h3>
								{toppings.length === 0 ? (
									<p className='text-xs text-gray-500'>Toppinglar topilmadi</p>
								) : (
									<div className='grid grid-cols-2 gap-2'>
										{toppings.map(topping => {
											const checked = addedToppingIds.includes(topping.id)
											return (
												<label key={topping.id} className='flex items-center gap-2 text-xs'>
													<input
														type='checkbox'
														checked={checked}
														onChange={e => {
															if (e.target.checked) {
																setAddedToppingIds([...addedToppingIds, topping.id])
															} else {
																setAddedToppingIds(
																	addedToppingIds.filter(id => id !== topping.id),
																)
															}
														}}
													/>
													<span>
														{topping.name} (+{topping.price.toLocaleString()} so&apos;m)
													</span>
												</label>
											)
										})}
									</div>
								)}
							</div>

							{defaultToppingIds.length > 0 && (
								<div>
									<h3 className='font-bold text-sm mb-2'>Olib tashlash</h3>
									<div className='grid grid-cols-2 gap-2'>
										{product.productToppings?.map(item => {
											const checked = removedToppingIds.includes(item.topping.id)
											return (
												<label key={item.topping.id} className='flex items-center gap-2 text-xs'>
													<input
														type='checkbox'
														checked={checked}
														onChange={e => {
															if (e.target.checked) {
																setRemovedToppingIds([...removedToppingIds, item.topping.id])
															} else {
																setRemovedToppingIds(
																	removedToppingIds.filter(id => id !== item.topping.id),
																)
															}
														}}
													/>
													<span>{item.topping.name}</span>
												</label>
											)
										})}
									</div>
								</div>
							)}
						</div>

						{/* Quick Info */}
						<div className='grid grid-cols-2 gap-3 mb-6'>
							<div className='flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100'>
								<Clock className='w-4 h-4 text-orange-500' />
								<div>
									<p className='text-[10px] text-stone-400 uppercase font-bold'>Tayyorlash</p>
									<p className='text-sm font-semibold'>{product.prepTime} daq</p>
								</div>
							</div>
							{product.cookingTime && (
								<div className='flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100'>
									<Flame className='w-4 h-4 text-orange-500' />
									<div>
										<p className='text-[10px] text-stone-400 uppercase font-bold'>Pishirish</p>
										<p className='text-sm font-semibold'>
											{product.cookingTemp}°C / {product.cookingTime} daq
										</p>
									</div>
								</div>
							)}
						</div>

						{/* ============================================ */}
						{/* PRICE CARD */}
						{/* ============================================ */}
						<Card className='bg-orange-600 text-white border-none shadow-lg shadow-orange-100 mb-6'>
							<CardContent className='p-4 flex items-center justify-between'>
								<div>
									<p className='text-orange-100 text-xs uppercase font-bold'>Narxi</p>
									<p className='text-2xl font-black'>
										{currentPrice.toLocaleString()}{' '}
										<span className='text-sm font-normal'>so&apos;m</span>
									</p>
									{selectedVariation && (
										<p className='text-orange-100 text-xs mt-1'>{selectedVariation.size} o&apos;lcham</p>
									)}
								</div>
								<Button
									onClick={handleAddToCart}
									disabled={!selectedVariation}
									className='bg-white text-orange-600 hover:bg-stone-100 rounded-xl px-6 disabled:opacity-50'
								>
									<Plus className='w-5 h-5 mr-1' /> Qo&apos;shish
								</Button>
							</CardContent>
						</Card>

						{/* ============================================ */}
						{/* TABS */}
						{/* ============================================ */}
						<Tabs defaultValue='details' className='w-full'>
							<TabsList className='grid w-full grid-cols-2 mb-4'>
								<TabsTrigger value='details'>Tarkibi</TabsTrigger>
								<TabsTrigger value='steps'>Retsept</TabsTrigger>
							</TabsList>

							<TabsContent value='details' className='space-y-4'>
								{product.calories && (
									<div className='flex justify-between p-3 bg-stone-50 rounded-lg text-center'>
										<div>
											<p className='text-xs text-stone-400'>Kkal</p>
											<p className='font-bold'>{product.calories}</p>
										</div>
										<div>
											<p className='text-xs text-stone-400'>Oqsil</p>
											<p className='font-bold'>{product.protein}g</p>
										</div>
										<div>
											<p className='text-xs text-stone-400'>Uglevod</p>
											<p className='font-bold'>{product.carbs}g</p>
										</div>
										<div>
											<p className='text-xs text-stone-400'>Yog&apos;</p>
											<p className='font-bold'>{product.fat}g</p>
										</div>
									</div>
								)}
								<div className='grid grid-cols-1 gap-2'>
									{product.ingredients?.map((ing, idx) => (
										<div
											key={idx}
											className='flex justify-between items-center text-sm p-2 border-b border-stone-100'
										>
											<span className='text-stone-600'>
												{ing.icon} {ing.name}
											</span>
											<span className='font-semibold'>{ing.amount}</span>
										</div>
									))}
								</div>
							</TabsContent>

							<TabsContent value='steps' className='space-y-4'>
								{product.cookingSteps?.map((step, idx) => (
									<div key={idx} className='flex gap-3'>
										<span className='flex-shrink-0 w-6 h-6 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center text-xs font-bold'>
											{step.step}
										</span>
										<p className='text-sm text-stone-600'>
											<span className='font-bold text-stone-800'>{step.title}:</span>{' '}
											{step.description}
										</p>
									</div>
								))}
								{product.recipe && (
									<p className='text-xs text-stone-500 italic mt-4'>{product.recipe}</p>
								)}
							</TabsContent>
						</Tabs>

						{/* Allergens */}
						{product.allergens && product.allergens.length > 0 && (
							<div className='mt-4 p-3 bg-red-50 rounded-lg flex gap-2 items-center'>
								<AlertCircle className='w-4 h-4 text-red-500' />
								<p className='text-[11px] text-red-600 font-medium'>
									Allergenlar: {product.allergens.join(', ')}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	)
}
