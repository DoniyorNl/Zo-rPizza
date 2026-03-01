// frontend/components/skeletons/TableSkeleton.tsx
// 📊 Table Skeleton - For admin dashboard tables

'use client'

/**
 * TableRowSkeleton Component
 * 
 * Single table row skeleton
 */
export function TableRowSkeleton() {
	return (
		<tr className='border-b border-gray-100'>
			<td className='px-4 py-3'>
				<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-20' />
			</td>
			<td className='px-4 py-3'>
				<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-32' />
			</td>
			<td className='px-4 py-3'>
				<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-24' />
			</td>
			<td className='px-4 py-3'>
				<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-16' />
			</td>
			<td className='px-4 py-3'>
				<div className='flex gap-2'>
					<div className='h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded' />
					<div className='h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded' />
				</div>
			</td>
		</tr>
	)
}

/**
 * TableSkeleton Component
 * 
 * Full table skeleton with header and rows
 */
interface TableSkeletonProps {
	rows?: number
	columns?: number
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
	return (
		<div className='w-full overflow-hidden border border-gray-200 rounded-lg'>
			<table className='w-full'>
				{/* Header Skeleton */}
				<thead className='bg-gray-50 border-b border-gray-200'>
					<tr>
						{Array.from({ length: columns }).map((_, i) => (
							<th key={i} className='px-4 py-3 text-left'>
								<div className='h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer bg-[length:200%_100%] rounded w-24' />
							</th>
						))}
					</tr>
				</thead>

				{/* Body Skeleton */}
				<tbody className='bg-white'>
					{Array.from({ length: rows }).map((_, i) => (
						<TableRowSkeleton key={i} />
					))}
				</tbody>
			</table>
		</div>
	)
}

/**
 * CompactTableSkeleton Component
 * 
 * Simplified table skeleton for smaller tables
 */
export function CompactTableSkeleton({ rows = 3 }: { rows?: number }) {
	return (
		<div className='space-y-3'>
			{Array.from({ length: rows }).map((_, i) => (
				<div key={i} className='flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200'>
					<div className='h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded-full' />
					<div className='flex-1 space-y-2'>
						<div className='h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-1/3' />
						<div className='h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-1/2' />
					</div>
					<div className='h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-16' />
				</div>
			))}
		</div>
	)
}
