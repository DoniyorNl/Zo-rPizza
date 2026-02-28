// frontend/app/page.tsx
// 🍕 ZOR PIZZA - HOME PAGE
// Completely redesigned with NYP style - minimal, clean, user-friendly

'use client'

import { CategoryNav } from '@/components/home/CategoryNav'
import { DealsSection } from '@/components/home/DealsSection'
import { DeliveryToggle } from '@/components/home/DeliveryToggle'
import { HeroSection } from '@/components/home/HeroSection'
import { MemberSection } from '@/components/home/MemberSection'
import { PopularProducts } from '@/components/home/PopularProducts'
import { Header } from '@/components/layout/Header'
import { ProductCard } from '@/components/products/ProductCard'
import { api } from '@/lib/apiClient'
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
		<main className='min-h-screen bg-white'>
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
			<section id='products-section' className='py-16 bg-gradient-to-b from-white to-orange-50'>
				<div className='container mx-auto px-4'>
					{/* Section Header */}
					<div className='text-center mb-10'>
						<h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
							{selectedCategoryId ? 'Tanlangan Kategoriya' : 'Barcha Mahsulotlar'}
						</h2>
						<p className='text-gray-600'>
							{selectedCategoryId
								? `${filteredProducts.length} ta mahsulot topildi`
								: 'Bizning eng mazali pitsalar va boshqa mahsulotlar'}
						</p>
					</div>

					{/* Products Grid - 4 per row */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{filteredProducts
							.filter(product => product.isActive)
							.map(product => (
								<div
									key={product.id}
									className='transform transition-all duration-300'
								>
									<ProductCard product={product} />
								</div>
							))}
					</div>

					{/* Empty State */}
					{filteredProducts.length === 0 && !loading && (
						<div className='text-center py-12'>
							<p className='text-xl text-gray-600'>
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
									className='mt-4 text-orange-600 hover:underline'
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

			{/* Footer (Optional - can be added later) */}
			<footer className='bg-gray-900 text-white py-12'>
				<div className='container mx-auto px-4 text-center'>
					<p className='text-gray-400'>
						© 2026 Zor Pizza. Barcha huquqlar himoyalangan.
					</p>
				</div>
			</footer>
		</main>
	)
}
