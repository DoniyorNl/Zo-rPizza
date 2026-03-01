// frontend/components/home/PopularProducts.tsx
// ⭐ POPULAR PRODUCTS SECTION - Top selling products

'use client'

import { ProductCard } from '@/components/products/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePopularProducts } from '@/hooks/usePopularProducts'
import { ProductCardSkeletonGrid } from '@/components/skeletons'
import { TrendingUp } from 'lucide-react'

/**
 * PopularProducts Component
 * 
 * Displays top selling/trending products
 * Features:
 * - Auto-refresh
 * - Responsive grid
 * - "See all" button
 * - Loading states
 * - Mobile optimized
 */
export function PopularProducts() {
	const { popularProducts, loading, error } = usePopularProducts(6)

	const handleSeeAll = () => {
		const element = document.getElementById('products-section')
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}

	if (loading) {
		return (
			<section className='py-12 md:py-16 bg-gradient-to-b from-orange-50 to-white' aria-label='Mashhur mahsulotlar'>
				<div className='container mx-auto px-4'>
					<div className='flex items-center justify-between mb-8 md:mb-10'>
						<div>
							<Badge className='mb-2 md:mb-3 bg-orange-100 text-orange-700 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm'>
								<TrendingUp className='w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 inline' aria-hidden='true' />
								Eng Ko&apos;p Sotilgan
							</Badge>
							<h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2'>
								Mashhur Mahsulotlar
							</h2>
							<p className='text-sm md:text-base text-gray-600'>
								Yuklanmoqda...
							</p>
						</div>
					</div>
					<ProductCardSkeletonGrid count={4} />
				</div>
			</section>
		)
	}

	if (error || popularProducts.length === 0) {
		return null // Don't show if error or no products
	}

	return (
		<section className='py-12 md:py-16 bg-gradient-to-b from-orange-50 to-white' aria-label='Mashhur mahsulotlar'>
			<div className='container mx-auto px-4'>
				{/* Section Header */}
				<div className='flex items-center justify-between mb-8 md:mb-10'>
					<div>
						<Badge className='mb-2 md:mb-3 bg-orange-100 text-orange-700 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm'>
							<TrendingUp className='w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 inline' aria-hidden='true' />
							Eng Ko&apos;p Sotilgan
						</Badge>
						<h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2'>
							Mashhur Mahsulotlar
						</h2>
						<p className='text-sm md:text-base text-gray-600'>
							Boshqalar tanlagan va yaxshi ko&apos;rgan pitsalar
						</p>
					</div>

					{/* See All Button (Desktop) */}
					<Button
						onClick={handleSeeAll}
						variant='outline'
						className='hidden md:flex border-orange-600 text-orange-600 hover:bg-orange-50 touch-manipulation'
						aria-label="Barcha mahsulotlarni ko'rish"
					>
						Barchasini ko&apos;rish
					</Button>
				</div>

				{/* Products Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
					{popularProducts.map((product, index) => (
						<ProductCard 
							key={product.id} 
							product={product}
							priority={index < 2}
						/>
					))}
				</div>

				{/* See All Button (Mobile) */}
				<div className='mt-6 md:mt-8 text-center md:hidden'>
					<Button
						onClick={handleSeeAll}
						variant='outline'
						className='w-full border-orange-600 text-orange-600 hover:bg-orange-50 touch-manipulation'
						aria-label="Barcha mahsulotlarni ko'rish"
					>
						Barchasini ko&apos;rish
					</Button>
				</div>
			</div>
		</section>
	)
}
