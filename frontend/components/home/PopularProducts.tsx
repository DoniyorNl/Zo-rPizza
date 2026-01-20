// frontend/components/home/PopularProducts.tsx
// ⭐ POPULAR PRODUCTS SECTION - Top selling products

'use client'

import { ProductCard } from '@/components/products/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePopularProducts } from '@/hooks/usePopularProducts'
import { TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * PopularProducts Component
 * 
 * Displays top selling/trending products
 * Features:
 * - Auto-refresh
 * - Responsive grid
 * - "See all" button
 * - Loading states
 */
export function PopularProducts() {
	const { popularProducts, loading, error } = usePopularProducts(6)
	const router = useRouter()

	if (loading) {
		return (
			<section className='py-12 bg-white'>
				<div className='container mx-auto px-4'>
					<h2 className='text-3xl font-bold mb-8'>⭐ Mashhur Mahsulotlar</h2>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{[1, 2, 3, 4].map(i => (
							<div
								key={i}
								className='h-96 bg-gray-100 animate-pulse rounded-lg'
							></div>
						))}
					</div>
				</div>
			</section>
		)
	}

	if (error || popularProducts.length === 0) {
		return null // Don't show if error or no products
	}

	return (
		<section className='py-16 bg-gradient-to-b from-orange-50 to-white'>
			<div className='container mx-auto px-4'>
				{/* Section Header */}
				<div className='flex items-center justify-between mb-10'>
					<div>
						<Badge className='mb-3 bg-orange-100 text-orange-700 px-4 py-2'>
							<TrendingUp className='w-4 h-4 mr-2 inline' />
							Eng Ko'p Sotilgan
						</Badge>
						<h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>
							Mashhur Mahsulotlar
						</h2>
						<p className='text-gray-600'>
							Boshqalar tanlagan va yaxshi ko'rgan pitsalar
						</p>
					</div>

					{/* See All Button (Desktop) */}
					<Button
						onClick={() => router.push('#products-section')}
						variant='outline'
						className='hidden md:flex border-orange-600 text-orange-600 hover:bg-orange-50'
					>
						Barchasini ko'rish
					</Button>
				</div>

				{/* Products Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{popularProducts.map(product => (
						<div
							key={product.id}
							className='transform transition-all duration-300 hover:scale-105'
						>
							<ProductCard product={product} />
						</div>
					))}
				</div>

				{/* See All Button (Mobile) */}
				<div className='mt-8 text-center md:hidden'>
					<Button
						onClick={() => router.push('#products-section')}
						variant='outline'
						className='w-full border-orange-600 text-orange-600 hover:bg-orange-50'
					>
						Barchasini ko'rish
					</Button>
				</div>
			</div>
		</section>
	)
}
