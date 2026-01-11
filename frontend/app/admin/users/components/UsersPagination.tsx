// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/components/UsersPagination.tsx
// 🎯 PURPOSE: Pagination controls for users list
// 📝 UPDATED: 2025-01-11
// =====================================

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UsersPaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export const UsersPagination: React.FC<UsersPaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	// Don't show pagination if only 1 page
	if (totalPages <= 1) return null

	const handlePrevious = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1)
		}
	}

	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1)
		}
	}

	return (
		<div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
			<div className='flex items-center justify-between'>
				{/* Page Info */}
				<div className='text-sm text-gray-600'>
					Sahifa <span className='font-medium'>{currentPage}</span> /{' '}
					<span className='font-medium'>{totalPages}</span>
				</div>

				{/* Navigation Buttons */}
				<div className='flex gap-2'>
					<button
						onClick={handlePrevious}
						disabled={currentPage === 1}
						className='inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					>
						<ChevronLeft className='w-4 h-4' />
						Oldingi
					</button>

					<button
						onClick={handleNext}
						disabled={currentPage === totalPages}
						className='inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					>
						Keyingi
						<ChevronRight className='w-4 h-4' />
					</button>
				</div>
			</div>
		</div>
	)
}
