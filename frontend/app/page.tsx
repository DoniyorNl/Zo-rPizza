// frontend/app/page.tsx
// 🍕 ZOR PIZZA - HOME PAGE
// Completely redesigned with NYP style - minimal, clean, user-friendly
// Optimized for mobile performance

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
import { motion, useReducedMotion } from 'framer-motion'

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
	basePrice: number
	imageUrl: string
	prepTime: number
	difficulty?: string
	calories?: number
	isActive?: boolean
	categoryId?: string
	variations: ProductVariation[]
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HomePage() {
	const [products, setProducts] = useState<Product[]>([])
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
	const shouldReduceMotion = useReducedMotion()

	// ============================================
	// DATA FETCHING
	// ============================================

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await api.get('/api/products')
				console.log('✅ Products loaded:', response.data.data.length)
				const fetchedProducts = response.data.data
				setProducts(fetchedProducts)
				setFilteredProducts(fetchedProducts)
			} catch (error) {
				console.error('❌ Error fetching products:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchProducts()
	}, [])

	// ============================================
	// CATEGORY FILTER LISTENER
	// ============================================

	useEffect(() => {
		const handleCategoryFilter = (event: Event) => {
			const customEvent = event as CustomEvent<{ categoryId: string | null }>
			const categoryId = customEvent.detail.categoryId
			setSelectedCategoryId(categoryId)

			if (!categoryId) {
				// Show all products
				setFilteredProducts(products)
			} else {
				// Filter by category
				const filtered = products.filter(p => p.categoryId === categoryId)
				setFilteredProducts(filtered)
			}
		}

		window.addEventListener('categoryFilter', handleCategoryFilter as EventListener)

		return () => {
			window.removeEventListener('categoryFilter', handleCategoryFilter as EventListener)
		}
	}, [products])

	// ============================================
	// LOADING STATE
	// ============================================

	if (loading) {
		return (
			<main className='min-h-screen bg-white'>
				<Header />
				<DeliveryToggle />
				<HeroSection />
				<DealsSection />
				<CategoryNav />
				<PopularProducts />
				
				{/* Products Skeleton */}
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

	// Animation variants with reduced motion support
	const pageVariants = shouldReduceMotion
		? { initial: { opacity: 1 }, animate: { opacity: 1 } }
		: { initial: { opacity: 0 }, animate: { opacity: 1 } }

	// ============================================
	// MAIN RENDER
	// ============================================

	return (
		<motion.main
			initial={pageVariants.initial}
			animate={pageVariants.animate}
			transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
			className='min-h-screen bg-white'
		>
			{/* Header */}
			<Header />

			{/* Delivery/Pickup Toggle */}
			<DeliveryToggle />

			{/* Hero Section */}
			<HeroSection />

			{/* Deals Section */}
			<DealsSection />

			{/* Category Navigation (Sticky) */}
			<CategoryNav />

			{/* Popular Products Section */}
			<PopularProducts />

			{/* All Products Section */}
			<section id='products-section' className='py-12 md:py-16 bg-gradient-to-b from-white to-orange-50'>
				<div className='container mx-auto px-4'>
					{/* Section Header */}
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

					{/* Products Grid - Responsive */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
						{filteredProducts
							.filter(product => product.isActive)
							.map((product, index) => (
								<ProductCard 
									key={product.id} 
									product={product}
									priority={index < 4}
								/>
							))}
					</div>

					{/* Empty State */}
					{filteredProducts.length === 0 && !loading && (
						<div className='text-center py-12'>
							<p className='text-lg md:text-xl text-gray-600'>
								{selectedCategoryId
									? 'Bu kategoriyada mahsulotlar topilmadi'
									: 'Hozircha mahsulotlar yo\'q'}
							</p>
							{selectedCategoryId && (
								<button
									onClick={() => {
										setSelectedCategoryId(null)
										setFilteredProducts(products)
									}}
									className='mt-4 text-orange-600 hover:underline touch-manipulation'
									aria-label="Barcha mahsulotlarni ko'rish"
								>
									Barcha mahsulotlarni ko&apos;rish
								</button>
							)}
						</div>
					)}
				</div>
			</section>

			{/* Member Section */}
			<MemberSection />

			{/* Footer */}
			<footer className='bg-gray-900 text-white py-8 md:py-12' role='contentinfo'>
				<div className='container mx-auto px-4 text-center'>
					<p className='text-sm md:text-base text-gray-400'>
						© 2026 Zor Pizza. Barcha huquqlar himoyalangan.
					</p>
				</div>
			</footer>
		</motion.main>
	)
}
