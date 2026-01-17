// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/components/UsersEmptyState.tsx
// 🎯 PURPOSE: Loading, empty, and error states for users list
// 📝 UPDATED: 2025-01-11
// =====================================

import React from 'react'
import { User, AlertCircle } from 'lucide-react'

interface UsersEmptyStateProps {
	loading?: boolean
	error?: string | null
	isEmpty?: boolean
}

export const UsersEmptyState: React.FC<UsersEmptyStateProps> = ({ loading, error, isEmpty }) => {
	// Loading state
	if (loading) {
		return (
			<div className='p-12 text-center'>
				<div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent'></div>
				<p className='mt-4 text-gray-600'>Yuklanmoqda...</p>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className='p-12 text-center'>
				<AlertCircle className='w-16 h-16 text-red-400 mx-auto mb-4' />
				<p className='text-red-600 font-medium'>Xatolik yuz berdi</p>
				<p className='text-gray-600 text-sm mt-2'>{error}</p>
			</div>
		)
	}

	// Empty state
	if (isEmpty) {
		return (
			<div className='p-12 text-center'>
				<User className='w-16 h-16 text-gray-300 mx-auto mb-4' />
				<p className='text-gray-600'>Foydalanuvchilar topilmadi</p>
				<p className='text-gray-500 text-sm mt-2'>
					Qidiruv yoki filter shartlaringizni o&apos;zgartiring
				</p>
			</div>
		)
	}

	return null
}
