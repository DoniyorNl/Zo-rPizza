// frontend/app/page.tsx
// 🍕 ZOR PIZZA - HOME PAGE (Updated with Variations Support)

'use client'

import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import { ChefHat, Clock, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

interface Product {
	id: string
	name: string
	description: string
	basePrice: number // ✅ Changed from 'price' to 'basePrice'
	imageUrl: string
	prepTime: number
	difficulty?: string
	calories?: number
	isActive?: boolean
	variations: ProductVariation[] // ✅ NEW: Size variations
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HomePage() {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	// ============================================
	// DATA FETCHING
	// ============================================

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await api.get('/api/products')
				console.log('✅ Products loaded:', response.data.data.length)
				setProducts(response.data.data)
			} catch (error) {
				console.error('❌ Error fetching products:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchProducts()
	}, [])

	// ============================================
	// HANDLERS
	// ============================================

	const handleViewDetails = (productId: string) => {
		router.push(`/products/${productId}`)
	}

	// ============================================
	// LOADING STATE
	// ============================================

	if (loading) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12'>
					<div className='text-center'>
						<div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600'></div>
						<p className='mt-4 text-xl text-gray-600'>Yuklanmoqda...</p>
					</div>
				</div>
			</main>
		)
	}

	// ============================================
	// MAIN RENDER
	// ============================================

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			{/* Hero Section */}
			<section className='container mx-auto px-4 py-12'>
				<div className='text-center mb-12'>
					<h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>🍕 Zor Pizza</h1>
					<p className='text-xl text-gray-600'>
						Eng mazali pitsalar - tez va sifatli yetkazib berish
					</p>
				</div>

				{/* Products Grid - 4 per row */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{products
						.filter(product => product.isActive)
						.map(product => {
							// ✅ Calculate cheapest price from variations
							const cheapestPrice =
								product.variations && product.variations.length > 0
									? Math.min(...product.variations.map(v => v.price))
									: product.basePrice

							const hasMultipleSizes = product.variations && product.variations.length > 1

							return (
								<Card
									key={product.id}
									className='group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden'
									onClick={() => handleViewDetails(product.id)}
								>
									{/* Image */}
									<div className='relative h-48 overflow-hidden bg-gray-100'>
										<Image
											src={product.imageUrl}
											alt={product.name}
											fill
											className='object-cover group-hover:scale-110 transition-transform duration-300'
											sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
										/>

										{/* Badges */}
										<div className='absolute top-3 left-3 flex gap-2'>
											{product.difficulty && (
												<Badge className='bg-white/90 text-gray-800 border-0'>
													<ChefHat className='w-3 h-3 mr-1' />
													{product.difficulty}
												</Badge>
											)}
										</div>

										{product.calories && (
											<Badge className='absolute top-3 right-3 bg-orange-600 border-0'>
												{product.calories} kkal
											</Badge>
										)}
									</div>

									{/* Content */}
									<CardHeader className='pb-3'>
										<h3 className='font-bold text-lg line-clamp-1'>{product.name}</h3>
										<p className='text-sm text-gray-600 line-clamp-2 mt-1'>
											{product.description}
										</p>
									</CardHeader>

									<CardContent className='pb-3'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2 text-sm text-gray-500'>
												<Clock className='w-4 h-4' />
												<span>{product.prepTime} daqiqa</span>
											</div>

											{/* ✅ NEW: Size indicator */}
											{hasMultipleSizes && (
												<span className='text-xs text-gray-500'>
													{product.variations.length} ta o&apos;lcham
												</span>
											)}
										</div>
									</CardContent>

									{/* Footer */}
									<CardFooter className='flex items-center justify-between pt-3 border-t'>
										<div>
											<div className='text-2xl font-bold text-orange-600'>
												{cheapestPrice.toLocaleString()} so&apos;m
											</div>
											{/* ✅ NEW: "dan boshlab" text if multiple sizes */}
											{hasMultipleSizes && (
												<p className='text-xs text-gray-500 mt-0.5'>dan boshlab</p>
											)}
										</div>

										<Button
											size='sm'
											className='bg-orange-600 hover:bg-orange-700'
										>
											<Plus className='w-4 h-4 mr-1' />
											Tanlash
										</Button>
									</CardFooter>
								</Card>
							)
						})}
				</div>

				{/* Empty State */}
				{products.length === 0 && !loading && (
					<div className='text-center py-12'>
						<p className='text-xl text-gray-600'>Hozircha mahsulotlar yoq</p>
					</div>
				)}
			</section>
		</main>
	)
}