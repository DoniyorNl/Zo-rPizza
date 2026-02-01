// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/hooks/useUserActions.ts
// 🎯 PURPOSE: Custom hook for user actions (role change, block/unblock)
// =====================================

import { apiFetch } from '@/lib/apiFetch'
import { useState } from 'react'
import { toApiRole } from '../utils/userConstants'

interface UseUserActionsParams {
	onSuccess?: () => void
}

interface UseUserActionsReturn {
	updateRole: (userId: string, newRole: string) => Promise<void>
	toggleBlock: (userId: string, currentStatus: boolean) => Promise<void>
	toggleDriver: (userId: string, currentStatus: boolean) => Promise<void>
	updating: boolean
	error: string | null
}

export const useUserActions = ({ onSuccess }: UseUserActionsParams = {}): UseUserActionsReturn => {
	const [updating, setUpdating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const updateRole = async (userId: string, newRole: string) => {
		try {
			setUpdating(true)
			setError(null)

			const firebaseUser = localStorage.getItem('firebaseUser')
			const currentUserId = firebaseUser ? JSON.parse(firebaseUser).uid : null
			if (!currentUserId) throw new Error('Authentication required')

			const role = toApiRole(newRole)

			const response = await apiFetch(`/api/users/${userId}/role`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'x-user-id': currentUserId,
				},
				body: JSON.stringify({ role }),
			})

			const data = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string }

			if (!response.ok) {
				throw new Error(data?.message || `Server error (${response.status})`)
			}

			alert("Rol muvaffaqiyatli o'zgartirildi!")
			onSuccess?.()
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Noma\'lum xatolik'
			setError(msg)
			alert(`Rol o'zgartirishda xatolik: ${msg}`)
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

			const response = await apiFetch(`/api/users/${userId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'x-user-id': currentUserId,
				},
				body: JSON.stringify({ isBlocked: !currentStatus }),
			})

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

	/**
	 * Toggle driver status (for tracking assignments)
	 */
	const toggleDriver = async (userId: string, currentStatus: boolean) => {
		try {
			setUpdating(true)
			setError(null)

			const firebaseUser = localStorage.getItem('firebaseUser')
			const currentUserId = firebaseUser ? JSON.parse(firebaseUser).uid : null

			if (!currentUserId) throw new Error('Authentication required')

			const response = await apiFetch(`/api/users/${userId}/driver`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'x-user-id': currentUserId,
				},
				body: JSON.stringify({ isDriver: !currentStatus }),
			})

			const data = await response.json()
			if (!response.ok) throw new Error(data.message || 'Failed to update driver status')

			alert(currentStatus ? "Haydovchi ro'yxatdan chiqarildi" : 'Haydovchi sifatida qo\'shildi')
			onSuccess?.()
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Unknown error'
			setError(msg)
			alert(`Haydovchi statusi o'zgartirishda xatolik: ${msg}`)
		} finally {
			setUpdating(false)
		}
	}

	return {
		updateRole,
		toggleBlock,
		toggleDriver,
		updating,
		error,
	}
}
