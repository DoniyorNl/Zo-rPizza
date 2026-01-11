// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/hooks/useUserActions.ts
// 🎯 PURPOSE: Custom hook for user actions (role change, block/unblock)
// 📝 UPDATED: 2025-01-11
// =====================================

import { useState } from 'react'

interface UseUserActionsParams {
	onSuccess?: () => void
}

interface UseUserActionsReturn {
	updateRole: (userId: string, newRole: string) => Promise<void>
	toggleBlock: (userId: string, currentStatus: boolean) => Promise<void>
	updating: boolean
	error: string | null
}

export const useUserActions = ({ onSuccess }: UseUserActionsParams = {}): UseUserActionsReturn => {
	const [updating, setUpdating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Update user role
	 */
	const updateRole = async (userId: string, newRole: string) => {
		try {
			setUpdating(true)
			setError(null)

			// Get Firebase user ID from localStorage
			const firebaseUser = localStorage.getItem('firebaseUser')
			const currentUserId = firebaseUser ? JSON.parse(firebaseUser).uid : null

			if (!currentUserId) {
				throw new Error('Authentication required')
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/role`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'x-user-id': currentUserId,
				},
				body: JSON.stringify({ role: newRole }),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message || 'Failed to update role')
			}

			// Success
			alert("Rol muvaffaqiyatli o'zgartirildi!")
			onSuccess?.()
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'
			console.error('Error updating role:', err)
			setError(errorMessage)
			alert(`Rol o'zgartirishda xatolik: ${errorMessage}`)
		} finally {
			setUpdating(false)
		}
	}

	/**
	 * Toggle user block status
	 */
	const toggleBlock = async (userId: string, currentStatus: boolean) => {
		try {
			setUpdating(true)
			setError(null)

			// Get Firebase user ID from localStorage
			const firebaseUser = localStorage.getItem('firebaseUser')
			const currentUserId = firebaseUser ? JSON.parse(firebaseUser).uid : null

			if (!currentUserId) {
				throw new Error('Authentication required')
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/status`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'x-user-id': currentUserId,
					},
					body: JSON.stringify({ isBlocked: !currentStatus }),
				},
			)

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message || 'Failed to update status')
			}

			// Success
			const message = currentStatus
				? 'Foydalanuvchi blokdan chiqarildi!'
				: 'Foydalanuvchi bloklandi!'
			alert(message)
			onSuccess?.()
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'
			console.error('Error updating status:', err)
			setError(errorMessage)
			alert(`Status o'zgartirishda xatolik: ${errorMessage}`)
		} finally {
			setUpdating(false)
		}
	}

	return {
		updateRole,
		toggleBlock,
		updating,
		error,
	}
}
