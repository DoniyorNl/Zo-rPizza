// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/hooks/useUserActions.ts
// 🎯 PURPOSE: Custom hook for user actions (role change, block/unblock)
// =====================================

import { api } from '@/lib/apiClient'
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

		const role = toApiRole(newRole)

		await api.put(`/api/users/${userId}/role`, { role })

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

		await api.put(`/api/users/${userId}/status`, { isBlocked: !currentStatus })

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

		await api.put(`/api/users/${userId}/driver`, { isDriver: !currentStatus })

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
