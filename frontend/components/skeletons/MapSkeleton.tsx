// frontend/components/skeletons/MapSkeleton.tsx
// 🗺️ Map Skeleton - For tracking page

'use client'

/**
 * MapSkeleton Component
 * 
 * Loading placeholder for map component
 */
export function MapSkeleton() {
	return (
		<div className='relative w-full h-96 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-xl overflow-hidden'>
			{/* Shimmer effect */}
			<div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer bg-[length:200%_100%]' />
			
			{/* Map-like pattern */}
			<div className='absolute inset-0 opacity-20'>
				{/* Grid lines */}
				{Array.from({ length: 10 }).map((_, i) => (
					<div
						key={`h-${i}`}
						className='absolute w-full border-t border-gray-300'
						style={{ top: `${i * 10}%` }}
					/>
				))}
				{Array.from({ length: 10 }).map((_, i) => (
					<div
						key={`v-${i}`}
						className='absolute h-full border-l border-gray-300'
						style={{ left: `${i * 10}%` }}
					/>
				))}
			</div>

			{/* Map icon in center */}
			<div className='absolute inset-0 flex items-center justify-center'>
				<div className='text-gray-400'>
					<svg
						className='w-16 h-16'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
						/>
					</svg>
				</div>
			</div>

			{/* Loading text */}
			<div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg'>
				<p className='text-sm text-gray-600'>Xarita yuklanmoqda...</p>
			</div>
		</div>
	)
}

/**
 * TrackingCardSkeleton Component
 * 
 * Loading placeholder for tracking info card
 */
export function TrackingCardSkeleton() {
	return (
		<div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				<div className='h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded-full' />
				<div className='flex-1 space-y-2'>
					<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-1/3' />
					<div className='h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-1/2' />
				</div>
			</div>

			{/* Stats */}
			<div className='grid grid-cols-2 gap-4'>
				<div className='p-4 bg-gray-50 rounded-lg'>
					<div className='h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-16 mb-2' />
					<div className='h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-20' />
				</div>
				<div className='p-4 bg-gray-50 rounded-lg'>
					<div className='h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-16 mb-2' />
					<div className='h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-20' />
				</div>
			</div>

			{/* Progress bar */}
			<div className='space-y-2'>
				<div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
					<div className='h-full w-1/2 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer bg-[length:200%_100%]' />
				</div>
				<div className='flex justify-between'>
					<div className='h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-20' />
					<div className='h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-20' />
				</div>
			</div>
		</div>
	)
}
