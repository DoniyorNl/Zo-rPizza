// 🍕 PRODUCT CARD KOMPONENTI
// Flexible product card that works with different product structures

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ChefHat, Clock, Heart, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getFavorites, toggleFavorite } from '@/lib/favorites'
import { useAuth } from '@/lib/AuthContext'

/**
 * Product variation interface
 */
interface ProductVariation {
	id: string
	size: string
	price: number
	diameter?: number
	slices?: number
	weight?: number
}

/**
 * Product interface (flexible - works with both old and new structures)
 */
interface Product {
	id: string
	name: string
	description: string
	price?: number // Old structure
	basePrice?: number // New structure
	imageUrl: string
	prepTime: number
	difficulty?: string
	calories?: number
	categoryName?: string
	isActive?: boolean
	variations?: ProductVariation[]
}

interface ProductCardProps {
	product: Product
	onAddToCart?: (id: string) => void
}

/**
 * ProductCard Component
 * 
 * Displays a product with:
 * - Image
 * - Name, description
 * - Price (handles both basePrice and price)
 * - Prep time, difficulty, calories
 * - Size variations indicator
 * - Add to cart / View details
 */
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
	const router = useRouter()
	const { user } = useAuth()
	const [isFavorite, setIsFavorite] = useState(false)
	const [isLoadingFavorite, setIsLoadingFavorite] = useState(false)

	// Check if product is in favorites
	useEffect(() => {
		const checkFavorite = async () => {
			if (!user) return
			const favorites = await getFavorites()
			setIsFavorite(favorites.includes(product.id))
		}
		checkFavorite()
	}, [product.id, user])

	// Get price (handle both old 'price' and new 'basePrice' structures)
	const displayPrice = product.basePrice || product.price || 0

	// Show "from" price when there are multiple variations; otherwise fixed base price
	const hasVariations = product.variations && product.variations.length > 1
	const minPrice = hasVariations
		? Math.min(...product.variations!.map(v => v.price))
		: displayPrice

	const handleClick = () => {
		router.push(`/products/${product.id}`)
	}

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation() // Prevent card click
		if (onAddToCart) {
			onAddToCart(product.id)
		} else {
			// Default: navigate to product page
			router.push(`/products/${product.id}`)
		}
	}

	// ============================================
	// TOGGLE FAVORITE
	// ============================================
	const handleToggleFavorite = async (e: React.MouseEvent) => {
		e.stopPropagation() // Prevent card click

		if (!user) {
			router.push('/login')
			return
		}

		setIsLoadingFavorite(true)
		const success = await toggleFavorite(product.id)
		
		if (success) {
			setIsFavorite(!isFavorite)
		}
		
		setIsLoadingFavorite(false)
	}

	return (
		<Card
			data-testid="product-card"
			className='group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden'
			onClick={handleClick}
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
					{product.categoryName && (
						<Badge variant='secondary' className='bg-white/90 text-gray-800 border-0'>
							{product.categoryName}
						</Badge>
					)}
				</div>

				{/* Favorite Heart Button */}
				{user && (
					<button
						onClick={handleToggleFavorite}
						disabled={isLoadingFavorite}
						className='absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all hover:scale-110 disabled:opacity-50'
					>
						<Heart
							className={`w-5 h-5 transition-colors ${
								isFavorite
									? 'fill-red-500 text-red-500'
									: 'text-gray-600 hover:text-red-500'
							}`}
						/>
					</button>
				)}

				{product.calories && (
					<Badge className='absolute bottom-3 right-3 bg-orange-600 border-0'>
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

					{hasVariations && (
						<span className='text-xs text-gray-500'>
							{product.variations!.length} ta o&apos;lcham
						</span>
					)}
				</div>
			</CardContent>

			{/* Footer */}
			<CardFooter className='flex items-center justify-between pt-3 border-t'>
				<div>
					<div className='text-2xl font-bold text-orange-600'>
						{minPrice.toLocaleString('en-US')} so&apos;m
					</div>
					{hasVariations && (
						<p className='text-xs text-gray-500 mt-0.5'>dan boshlab</p>
					)}
				</div>

				<Button
					data-testid="product-card-select"
					size='sm'
					className='bg-orange-600 hover:bg-orange-700'
					onClick={handleAddToCart}
				>
					<Plus className='w-4 h-4 mr-1' />
					Tanlash
				</Button>
			</CardFooter>
		</Card>
	)
}
