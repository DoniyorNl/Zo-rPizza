// frontend/components/skeletons/ProductCardSkeleton.tsx
// 🎨 Product Card Skeleton - Professional shimmer effect

'use client'

/**
 * ProductCardSkeleton Component
 * 
 * Loading placeholder for ProductCard
 * Matches ProductCard layout exactly to prevent layout shift
 */
export function ProductCardSkeleton() {
	return (
		<div className='rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm'>
			{/* Image Skeleton */}
			<div className='relative h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]' />

			{/* Content Skeleton */}
			<div className='p-4 space-y-3'>
				{/* Title */}
				<div className='h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-3/4' />
				
				{/* Description */}
				<div className='space-y-2'>
					<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-full' />
					<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-2/3' />
				</div>

				{/* Meta info (time + size) */}
				<div className='flex items-center justify-between pt-2'>
					<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-20' />
					<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-16' />
				</div>
			</div>

			{/* Footer Skeleton */}
			<div className='flex items-center justify-between px-4 py-3 border-t border-gray-100'>
				{/* Price */}
				<div className='h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-24' />
				
				{/* Button */}
				<div className='h-9 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded' />
			</div>
		</div>
	)
}

/**
 * ProductCardSkeletonGrid Component
 * 
 * Grid of skeleton cards with proper spacing
 */
interface ProductCardSkeletonGridProps {
	count?: number
}

export function ProductCardSkeletonGrid({ count = 8 }: ProductCardSkeletonGridProps) {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
			{Array.from({ length: count }).map((_, i) => (
				<ProductCardSkeleton key={i} />
			))}
		</div>
	)
}
