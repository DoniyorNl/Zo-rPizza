// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/components/UsersPagination.tsx
// 🎯 PURPOSE: Pagination controls for users list
// 📝 UPDATED: 2025-01-11
// =====================================

import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

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
		<div className='px-3 py-1.5 border-t border-gray-200 bg-gray-50'>
			<div className='flex items-center justify-between'>
				<div className='text-xs text-gray-600'>
					Sahifa <span className='font-medium'>{currentPage}</span> / {totalPages}
				</div>
				<div className='flex gap-1.5'>
					<button
						onClick={handlePrevious}
						disabled={currentPage === 1}
						className='inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					>
						<ChevronLeft className='w-3.5 h-3.5' />
						Oldingi
					</button>
					<button
						onClick={handleNext}
						disabled={currentPage === totalPages}
						className='inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					>
						Keyingi
						<ChevronRight className='w-3.5 h-3.5' />
					</button>
				</div>
			</div>
		</div>
	)
}
