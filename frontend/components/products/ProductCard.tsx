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
import { motion, useReducedMotion } from 'framer-motion'

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
	priority?: boolean
}

/**
 * ProductCard Component
 * 
 * Displays a product with:
 * - Image (optimized for mobile)
 * - Name, description
 * - Price (handles both basePrice and price)
 * - Prep time, difficulty, calories
 * - Size variations indicator
 * - Add to cart / View details
 * 
 * Mobile optimized with reduced animations and better touch targets
 */
export function ProductCard({ product, onAddToCart, priority = false }: ProductCardProps) {
	const router = useRouter()
	const { user } = useAuth()
	const [isFavorite, setIsFavorite] = useState(false)
	const [isLoadingFavorite, setIsLoadingFavorite] = useState(false)
	const shouldReduceMotion = useReducedMotion()

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

	const handleClick = (e: React.MouseEvent) => {
		// Prevent navigation if user is selecting text
		const selection = window.getSelection()
		if (selection && selection.toString().length > 0) {
			return
		}
		
		// Check if click was on an interactive element
		const target = e.target as HTMLElement
		if (
			target.tagName === 'BUTTON' ||
			target.closest('button') ||
			target.tagName === 'A' ||
			target.closest('a')
		) {
			return
		}
		
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

	// Animation variants for reduced motion support
	const animationVariants = shouldReduceMotion
		? {
				initial: { opacity: 1, scale: 1 },
				whileInView: { opacity: 1, scale: 1 },
		  }
		: {
				initial: { opacity: 0, scale: 0.95 },
				whileInView: { opacity: 1, scale: 1 },
		  }

	return (
		<motion.div
			initial={animationVariants.initial}
			whileInView={animationVariants.whileInView}
			viewport={{ once: true, margin: "-50px" }}
			transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
		>
			<Card
				data-testid="product-card"
				className='group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden select-text'
				onClick={handleClick}
			>
					{/* Image - Optimized for mobile */}
					<div className='relative h-40 sm:h-48 overflow-hidden bg-gray-100'>
						<Image
							src={product.imageUrl}
							alt={`${product.name} - ${product.description}`}
							fill
							className='object-cover group-hover:scale-110 transition-transform duration-300'
							sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
							loading={priority ? 'eager' : 'lazy'}
							quality={priority ? 90 : 75}
							priority={priority}
						/>

				{/* Badges */}
				<div className='absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2'>
					{product.difficulty && (
						<Badge className='bg-white/90 text-gray-800 border-0 text-xs'>
							<ChefHat className='w-3 h-3 mr-1' aria-hidden='true' />
							{product.difficulty}
						</Badge>
					)}
					{product.categoryName && (
						<Badge variant='secondary' className='bg-white/90 text-gray-800 border-0 text-xs'>
							{product.categoryName}
						</Badge>
					)}
				</div>

				{/* Favorite Heart Button - Enhanced touch target */}
				{user && (
					<button
						onClick={handleToggleFavorite}
						disabled={isLoadingFavorite}
						className='absolute top-2 sm:top-3 right-2 sm:right-3 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md transition-all hover:scale-110 disabled:opacity-50 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center'
						aria-label={isFavorite ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
					>
						<Heart
							className={`w-5 h-5 transition-colors ${
								isFavorite
									? 'fill-red-500 text-red-500'
									: 'text-gray-600 hover:text-red-500'
							}`}
							aria-hidden='true'
						/>
					</button>
				)}

				{product.calories && (
					<Badge className='absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-orange-600 border-0 text-xs'>
						{product.calories} kkal
					</Badge>
				)}
			</div>

			{/* Content */}
			<CardHeader className='pb-2 sm:pb-3'>
				<h3 className='font-bold text-base sm:text-lg line-clamp-1'>{product.name}</h3>
				<p className='text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1'>
					{product.description}
				</p>
			</CardHeader>

			<CardContent className='pb-2 sm:pb-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500'>
						<Clock className='w-3.5 h-3.5 sm:w-4 sm:h-4' aria-hidden='true' />
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
			<CardFooter className='flex items-center justify-between pt-2 sm:pt-3 border-t'>
				<div>
					<div className='text-xl sm:text-2xl font-bold text-orange-600'>
						{minPrice.toLocaleString('en-US')} so&apos;m
					</div>
					{hasVariations && (
						<p className='text-xs text-gray-500 mt-0.5'>dan boshlab</p>
					)}
				</div>

				<Button
					data-testid="product-card-select"
					size='sm'
					className='bg-orange-600 hover:bg-orange-700 touch-manipulation min-h-[44px] px-4'
					onClick={handleAddToCart}
					aria-label={`${product.name} tanlash`}
				>
					<Plus className='w-4 h-4 mr-1' aria-hidden='true' />
					Tanlash
				</Button>
			</CardFooter>
		</Card>
		</motion.div>
	)
}
