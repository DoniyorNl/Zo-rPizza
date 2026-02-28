// frontend/app/(shop)/favorites/page.tsx
// ❤️ FAVORITES PAGE - Show user's favorite products

'use client'

import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'
import { useAuth } from '@/lib/AuthContext'
import { getFavoriteProductsWithDetails, type FavoriteProduct } from '@/lib/favorites'
import { Heart, Loader2, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FavoritesPage() {
	const { user } = useAuth()
	const router = useRouter()
	const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!user) {
			router.push('/login')
			return
		}

		const fetchFavorites = async () => {
			setLoading(true)
			const data = await getFavoriteProductsWithDetails()
			setFavorites(data)
			setLoading(false)
		}

		fetchFavorites()
	}, [user, router])

	// Reload favorites when navigating back to page
	useEffect(() => {
		const handleFocus = () => {
			if (user) {
				getFavoriteProductsWithDetails().then(setFavorites)
			}
		}

		window.addEventListener('focus', handleFocus)
		return () => window.removeEventListener('focus', handleFocus)
	}, [user])

	if (loading) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12'>
					<div className='flex flex-col items-center justify-center gap-4'>
						<Loader2 className='w-12 h-12 animate-spin text-orange-600' />
						<p className='text-gray-600'>Yuklanmoqda...</p>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<div className='flex items-center gap-3 mb-8'>
					<div className='p-3 bg-red-100 rounded-full'>
						<Heart className='w-6 h-6 text-red-600 fill-red-600' />
					</div>
					<div>
						<h1 className='text-3xl font-bold'>Sevimli Mahsulotlar</h1>
						<p className='text-gray-600'>Siz yoqtirgan mahsulotlar</p>
					</div>
				</div>

				{/* Empty State */}
				{favorites.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-20'>
						<div className='p-6 bg-gray-100 rounded-full mb-6'>
							<Heart className='w-16 h-16 text-gray-400' />
						</div>
						<h2 className='text-2xl font-bold mb-2'>Sevimli mahsulotlar yo&apos;q</h2>
						<p className='text-gray-600 mb-6 text-center max-w-md'>
							Mahsulot kartochkasidagi yurak belgisini bosib, sevimli mahsulotlaringizni
							saqlang
						</p>
						<Button
							onClick={() => router.push('/')}
							className='bg-orange-600 hover:bg-orange-700'
						>
							<ShoppingBag className='w-4 h-4 mr-2' />
							Mahsulotlarni ko&apos;rish
						</Button>
					</div>
				) : (
					<>
						{/* Count */}
						<p className='text-gray-600 mb-6'>{favorites.length} ta mahsulot</p>

						{/* Products Grid */}
						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
							{favorites.map(product => (
								<ProductCard
									key={product.id}
									product={{
										id: product.id,
										name: product.name,
										description: '',
										basePrice: product.basePrice,
										imageUrl: product.imageUrl || '/placeholder-pizza.jpg',
										prepTime: 20,
										categoryName: product.category?.name,
									}}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</main>
	)
}
