'use client'

import { CategoryNav } from '@/components/home/CategoryNav'
import { DealsSection } from '@/components/home/DealsSection'
import { DeliveryToggle } from '@/components/home/DeliveryToggle'
import { HeroSection } from '@/components/home/HeroSection'
import { MemberSection } from '@/components/home/MemberSection'
import { PopularProducts } from '@/components/home/PopularProducts'
import { Header } from '@/components/layout/Header'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductCardSkeletonGrid } from '@/components/skeletons'
import { api } from '@/lib/apiClient'
import { useEffect, useState } from 'react'

export interface HomeProductVariation {
	id: string
	size: string
	price: number
	diameter?: number
	slices?: number
	weight?: number
}

export interface HomeProduct {
	id: string
	name: string
	description: string
	basePrice: number
	imageUrl: string
	prepTime: number
	difficulty?: string
	calories?: number
	isActive?: boolean
	categoryId?: string
	variations: HomeProductVariation[]
}

export default function HomeClient({ initialProducts }: { initialProducts: HomeProduct[] }) {
	const [products, setProducts] = useState<HomeProduct[]>(initialProducts)
	const [filteredProducts, setFilteredProducts] = useState<HomeProduct[]>(initialProducts)
	const [loading, setLoading] = useState(initialProducts.length === 0)
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
	const isProd = process.env.NODE_ENV === 'production'

	// If SSR couldn't load products, fetch as a fallback (do not block initial render when SSR succeeds).
	useEffect(() => {
		if (initialProducts.length > 0) return
		let cancelled = false
		;(async () => {
			try {
				const response = await api.get('/api/products')
				const fetchedProducts = Array.isArray(response.data?.data) ? response.data.data : []
				if (cancelled) return
				setProducts(fetchedProducts)
				setFilteredProducts(fetchedProducts)
			} catch (error) {
				// Avoid console errors in production (Lighthouse Best Practices).
				if (!isProd) console.error('❌ Error fetching products:', error)
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [initialProducts.length, isProd])

	// CATEGORY FILTER LISTENER
	useEffect(() => {
		const handleCategoryFilter = (event: Event) => {
			const customEvent = event as CustomEvent<{ categoryId: string | null }>
			const categoryId = customEvent.detail.categoryId
			setSelectedCategoryId(categoryId)

			if (!categoryId) {
				setFilteredProducts(products)
			} else {
				setFilteredProducts(products.filter(p => p.categoryId === categoryId))
			}
		}

		window.addEventListener('categoryFilter', handleCategoryFilter as EventListener)
		return () => window.removeEventListener('categoryFilter', handleCategoryFilter as EventListener)
	}, [products])

	if (loading) {
		return (
			<main className='min-h-screen bg-white'>
				<Header />
				<DeliveryToggle />
				<HeroSection />
				<DealsSection />
				<CategoryNav />
				<PopularProducts />

				<section className='py-12 md:py-16 bg-gradient-to-b from-white to-orange-50'>
					<div className='container mx-auto px-4'>
						<div className='text-center mb-8 md:mb-10'>
							<h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3'>
								Barcha Mahsulotlar
							</h2>
							<p className='text-sm md:text-base text-gray-600'>Yuklanmoqda...</p>
						</div>
						<ProductCardSkeletonGrid count={8} />
					</div>
				</section>
			</main>
		)
	}

	return (
		<main className='min-h-screen bg-white'>
			<Header />
			<DeliveryToggle />
			<HeroSection />
			<DealsSection />
			<CategoryNav />
			<PopularProducts />

			<section id='products-section' className='py-12 md:py-16 bg-gradient-to-b from-white to-orange-50'>
				<div className='container mx-auto px-4'>
					<div className='text-center mb-8 md:mb-10'>
						<h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3'>
							{selectedCategoryId ? 'Tanlangan Kategoriya' : 'Barcha Mahsulotlar'}
						</h2>
						<p className='text-sm md:text-base text-gray-600'>
							{selectedCategoryId
								? `${filteredProducts.length} ta mahsulot topildi`
								: 'Bizning eng mazali pitsalar va boshqa mahsulotlar'}
						</p>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
						{filteredProducts
							.filter(product => product.isActive !== false)
							.map((product, index) => (
								<ProductCard key={product.id} product={product} priority={index < 4} />
							))}
					</div>

					{filteredProducts.length === 0 && (
						<div className='text-center py-12'>
							<p className='text-lg md:text-xl text-gray-700'>
								{selectedCategoryId ? 'Bu kategoriyada mahsulotlar topilmadi' : "Hozircha mahsulotlar yo'q"}
							</p>
							{selectedCategoryId && (
								<button
									onClick={() => {
										setSelectedCategoryId(null)
										setFilteredProducts(products)
									}}
									className='mt-4 text-orange-800 hover:underline touch-manipulation'
									aria-label="Barcha mahsulotlarni ko'rish"
								>
									Barcha mahsulotlarni ko&apos;rish
								</button>
							)}
						</div>
					)}
				</div>
			</section>

			<MemberSection />
		</main>
	)
}

