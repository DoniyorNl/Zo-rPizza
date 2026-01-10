'use client'

import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/store/cartStore'
import axios from 'axios'
import { AlertCircle, ArrowLeft, ChefHat, Clock, Flame, Plus, Users } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

interface Product {
	id: string
	name: string
	description: string
	price: number
	imageUrl: string
	prepTime: number

	// Recipe details
	ingredients?: Array<{ name: string; amount: string; icon?: string }>
	recipe?: string
	cookingTemp?: number
	cookingTime?: number
	cookingSteps?: Array<{ step: number; title: string; description: string }>

	// Nutrition
	calories?: number
	protein?: number
	carbs?: number
	fat?: number

	// Additional
	difficulty?: string
	servings?: number
	allergens?: string[]
	images?: string[]
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const { addItem } = useCartStore()
	const [product, setProduct] = useState<Product | null>(null)
	const [loading, setLoading] = useState(true)
	const [selectedImage, setSelectedImage] = useState(0)

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
				const productData = response.data.data
				
				// JSON maydonlarni to'g'ri formatlash (agar backend'da parse qilinmagan bo'lsa)
				if (productData.ingredients && typeof productData.ingredients === 'string') {
					try {
						productData.ingredients = JSON.parse(productData.ingredients)
					} catch (e) {
						console.error('Error parsing ingredients:', e)
						productData.ingredients = null
					}
				}
				
				if (productData.cookingSteps && typeof productData.cookingSteps === 'string') {
					try {
						productData.cookingSteps = JSON.parse(productData.cookingSteps)
					} catch (e) {
						console.error('Error parsing cookingSteps:', e)
						productData.cookingSteps = null
					}
				}
				
				// Array maydonlarni ta'minlash
				if (!productData.images) productData.images = []
				if (!productData.allergens) productData.allergens = []
				
				setProduct(productData)
			} catch (error) {
				console.error('Error fetching product:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchProduct()
	}, [id])

	const handleAddToCart = () => {
		if (!product) return
		addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			imageUrl: product.imageUrl || images[0] || '/images/placeholder.png',
		})
	}

	if (loading) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12'>
					<div className='text-center text-2xl'>Yuklanmoqda...</div>
				</div>
			</main>
		)
	}

	if (!product) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12'>
					<div className='text-center'>
						<h1 className='text-2xl font-bold mb-4'>Mahsulot topilmadi</h1>
						<Button onClick={() => router.push('/')}>Bosh sahifaga qaytish</Button>
					</div>
				</div>
			</main>
		)
	}

	const images = product.images && product.images.length > 0 
		? product.images 
		: product.imageUrl 
			? [product.imageUrl] 
			: ['/images/placeholder.png']

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-8'>
				{/* Back Button */}
				<Button variant='ghost' onClick={() => router.back()} className='mb-6'>
					<ArrowLeft className='w-4 h-4 mr-2' />
					Orqaga
				</Button>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
					{/* Image Gallery */}
					<div className='space-y-4'>
						<div className='relative aspect-square rounded-2xl overflow-hidden bg-gray-100'>
							<Image
								src={images[selectedImage]}
								alt={product.name}
								fill
								className='object-cover'
								priority
							/>
						</div>
						{images.length > 1 && (
							<div className='grid grid-cols-4 gap-4'>
								{images.map((img, idx) => (
									<button
										key={idx}
										onClick={() => setSelectedImage(idx)}
										className={`relative aspect-square rounded-lg overflow-hidden ${
											selectedImage === idx
												? 'ring-2 ring-orange-600'
												: 'opacity-60 hover:opacity-100'
										}`}
									>
										<Image
											src={img}
											alt={`${product.name} ${idx + 1}`}
											fill
											className='object-cover'
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Product Info */}
					<div className='space-y-6'>
						<div>
							<div className='flex items-center gap-3 mb-3'>
								{product.difficulty && (
									<Badge variant='outline'>
										<ChefHat className='w-3 h-3 mr-1' />
										{product.difficulty}
									</Badge>
								)}
								{product.servings && (
									<Badge variant='outline'>
										<Users className='w-3 h-3 mr-1' />
										{product.servings} kishilik
									</Badge>
								)}
							</div>
							<h1 className='text-4xl font-bold mb-4'>{product.name}</h1>
							<p className='text-lg text-gray-600 mb-6'>{product.description}</p>
						</div>

						{/* Quick Info */}
						<div className='grid grid-cols-2 gap-4'>
							<Card>
								<CardContent className='pt-6'>
									<div className='flex items-center gap-3'>
										<Clock className='w-5 h-5 text-orange-600' />
										<div>
											<div className='text-sm text-gray-600'>Tayyorlash</div>
											<div className='font-semibold'>{product.prepTime} daq</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{product.cookingTime && product.cookingTemp && (
								<Card>
									<CardContent className='pt-6'>
										<div className='flex items-center gap-3'>
											<Flame className='w-5 h-5 text-orange-600' />
											<div>
												<div className='text-sm text-gray-600'>Pishirish</div>
												<div className='font-semibold'>
													{product.cookingTemp}°C, {product.cookingTime} daq
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							)}
						</div>

						{/* Nutrition */}
						{product.calories && (
							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>Ozuqaviy qiymat</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-4 gap-4 text-center'>
										<div>
											<div className='text-2xl font-bold text-orange-600'>{product.calories}</div>
											<div className='text-sm text-gray-600'>kkal</div>
										</div>
										{product.protein && (
											<div>
												<div className='text-2xl font-bold'>{product.protein}g</div>
												<div className='text-sm text-gray-600'>Oqsil</div>
											</div>
										)}
										{product.carbs && (
											<div>
												<div className='text-2xl font-bold'>{product.carbs}g</div>
												<div className='text-sm text-gray-600'>Uglevod</div>
											</div>
										)}
										{product.fat && (
											<div>
												<div className='text-2xl font-bold'>{product.fat}g</div>
												<div className='text-sm text-gray-600'>Yog'</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Allergens */}
						{product.allergens && product.allergens.length > 0 && (
							<Card className='border-yellow-200 bg-yellow-50'>
								<CardContent className='pt-6'>
									<div className='flex items-start gap-3'>
										<AlertCircle className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5' />
										<div>
											<div className='font-semibold mb-2'>Allergenlar:</div>
											<div className='flex flex-wrap gap-2'>
												{product.allergens.map((allergen, idx) => (
													<Badge key={idx} variant='outline' className='bg-white'>
														{allergen}
													</Badge>
												))}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Price & Add to Cart */}
						<Card className='border-orange-200 bg-orange-50'>
							<CardContent className='pt-6'>
								<div className='flex items-center justify-between mb-4'>
									<div>
										<div className='text-sm text-gray-600 mb-1'>Narx:</div>
										<div className='text-3xl font-bold text-orange-600'>
											{product.price.toLocaleString()} so'm
										</div>
									</div>
								</div>
								<Button
									onClick={handleAddToCart}
									className='w-full bg-orange-600 hover:bg-orange-700'
									size='lg'
								>
									<Plus className='w-5 h-5 mr-2' />
									Savatchaga qo'shish
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Ingredients */}
				{product.ingredients && product.ingredients.length > 0 && (
					<Card className='mb-8'>
						<CardHeader>
							<CardTitle>Tarkibi</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{product.ingredients.map((ing, idx) => (
									<div key={idx} className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
										{ing.icon && <span className='text-2xl'>{ing.icon}</span>}
										<div>
											<div className='font-semibold'>{ing.name}</div>
											<div className='text-sm text-gray-600'>{ing.amount}</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Recipe Steps */}
				{product.cookingSteps && product.cookingSteps.length > 0 && (
					<Card className='mb-8'>
						<CardHeader>
							<CardTitle>Tayyorlash bosqichlari</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-6'>
								{product.cookingSteps.map((step, idx) => (
									<div key={idx} className='flex gap-4'>
										<div className='flex-shrink-0 w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold'>
											{step.step}
										</div>
										<div className='flex-1'>
											<h3 className='font-semibold text-lg mb-2'>{step.title}</h3>
											<p className='text-gray-600'>{step.description}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Full Recipe */}
				{product.recipe && (
					<Card>
						<CardHeader>
							<CardTitle>To'liq retsept</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='prose max-w-none'>
								<p className='whitespace-pre-line text-gray-700'>{product.recipe}</p>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</main>
	)
}
