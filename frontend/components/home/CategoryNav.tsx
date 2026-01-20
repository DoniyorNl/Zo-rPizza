// frontend/components/home/CategoryNav.tsx
// 📂 CATEGORY NAVIGATION - Horizontal scroll menu

'use client'

import { useCategories } from '@/hooks/useCategories'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

/**
 * Category icon mapping (emoji or lucide icon)
 */
const getCategoryIcon = (name: string): string => {
	const nameLower = name.toLowerCase()
	
	if (nameLower.includes('pizza') || nameLower.includes('pitsa')) return '🍕'
	if (nameLower.includes('deal') || nameLower.includes('aksiya')) return '🎁'
	if (nameLower.includes('side') || nameLower.includes('qo\'shimcha')) return '🍟'
	if (nameLower.includes('dessert') || nameLower.includes('shirinlik')) return '🍰'
	if (nameLower.includes('drink') || nameLower.includes('ichimlik')) return '🥤'
	if (nameLower.includes('salad') || nameLower.includes('salat')) return '🥗'
	if (nameLower.includes('pasta')) return '🍝'
	if (nameLower.includes('burger')) return '🍔'
	
	return '📦' // Default
}

/**
 * CategoryNav Component
 * 
 * Horizontal scrollable category navigation
 * Features:
 * - Smooth scroll
 * - Active indicator
 * - Scroll buttons
 * - Responsive
 * - Click to filter
 */
export function CategoryNav() {
	// useMemo to prevent recreating options object on every render
	const categoryOptions = useMemo(() => ({
		isActive: true,
		hasProducts: true,
		sortBy: 'displayOrder' as const,
	}), []) // Empty deps - options never change

	const { categories, loading } = useCategories(categoryOptions)

	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const scrollContainerRef = useRef<HTMLDivElement>(null)

	/**
	 * Scroll left/right
	 */
	const scroll = (direction: 'left' | 'right') => {
		if (scrollContainerRef.current) {
			const scrollAmount = 300
			const newScrollLeft =
				scrollContainerRef.current.scrollLeft +
				(direction === 'left' ? -scrollAmount : scrollAmount)
			
			scrollContainerRef.current.scrollTo({
				left: newScrollLeft,
				behavior: 'smooth',
			})
		}
	}

	/**
	 * Handle category click
	 */
	const handleCategoryClick = (categoryId: string) => {
		setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
		
		// Scroll to products section
		const productsSection = document.getElementById('products-section')
		if (productsSection) {
			productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}

		// Emit custom event for filtering (other components can listen)
		window.dispatchEvent(
			new CustomEvent('categoryFilter', { detail: { categoryId } })
		)
	}

	if (loading) {
		return (
			<div className='sticky top-0 z-40 bg-white border-b shadow-sm'>
				<div className='container mx-auto px-4'>
					<div className='h-20 flex items-center gap-4 overflow-hidden'>
						{[1, 2, 3, 4, 5].map(i => (
							<div
								key={i}
								className='h-12 w-32 bg-gray-200 animate-pulse rounded-full'
							></div>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (categories.length === 0) {
		return null
	}

	return (
		<div className='sticky top-0 z-40 bg-white border-b shadow-sm'>
			<div className='container mx-auto px-4'>
				<div className='relative flex items-center py-4'>
					{/* Left Scroll Button */}
					<button
						onClick={() => scroll('left')}
						className='hidden md:flex absolute left-0 z-10 w-10 h-10 items-center justify-center bg-white/90 hover:bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all'
						aria-label='Scroll left'
					>
						<ChevronLeft className='w-5 h-5 text-gray-600' />
					</button>

					{/* Categories Container */}
					<div
						ref={scrollContainerRef}
						className='flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-12 md:px-14 w-full'
						style={{
							scrollbarWidth: 'none',
							msOverflowStyle: 'none',
						}}
					>
						{/* All Categories (Default) */}
						<button
							onClick={() => {
								setSelectedCategory(null)
								window.dispatchEvent(
									new CustomEvent('categoryFilter', { detail: { categoryId: null } })
								)
							}}
							className={cn(
								'flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap',
								selectedCategory === null
									? 'bg-orange-600 text-white shadow-lg scale-105'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							)}
						>
							<span className='text-lg'>🏠</span>
							<span>Hammasi</span>
						</button>

						{/* Category Buttons */}
						{categories.map(category => (
							<button
								key={category.id}
								onClick={() => handleCategoryClick(category.id)}
								className={cn(
									'flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap',
									selectedCategory === category.id
										? 'bg-orange-600 text-white shadow-lg scale-105'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								)}
							>
								{/* Icon */}
								<span className='text-lg'>
									{category.icon || getCategoryIcon(category.name)}
								</span>

								{/* Name */}
								<span>{category.name}</span>

								{/* Product Count */}
								{category.productCount !== undefined && (
									<span
										className={cn(
											'text-xs px-2 py-0.5 rounded-full',
											selectedCategory === category.id
												? 'bg-white/20'
												: 'bg-gray-200'
										)}
									>
										{category.productCount}
									</span>
								)}
							</button>
						))}
					</div>

					{/* Right Scroll Button */}
					<button
						onClick={() => scroll('right')}
						className='hidden md:flex absolute right-0 z-10 w-10 h-10 items-center justify-center bg-white/90 hover:bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all'
						aria-label='Scroll right'
					>
						<ChevronRight className='w-5 h-5 text-gray-600' />
					</button>
				</div>
			</div>

			{/* Hide scrollbar */}
			<style jsx>{`
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</div>
	)
}
