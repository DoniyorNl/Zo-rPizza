// =====================================
// 📁 FILE PATH: frontend/hooks/useNotifications.ts
// 🔔 NOTIFICATIONS HOOK (Optimized with Zustand Store)
// =====================================

import { useAuth } from '@/lib/AuthContext'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useEffect } from 'react'
export type { Notification } from '@/store/useNotificationStore'

export const useNotifications = () => {
	const { user } = useAuth()
	const {
		notifications,
		unreadCount,
		loading,
		error,
		fetchNotifications,
		markAllAsRead,
		markAsRead,
		deleteNotification,
		clearAll,
	} = useNotificationStore()

	// Initial fetch on mount - only if user is authenticated
	useEffect(() => {
		if (user) {
			fetchNotifications()
		}
	}, [user, fetchNotifications])

	return {
		notifications,
		unreadCount,
		loading,
		error,
		fetchNotifications,
		markAllAsRead,
		markAsRead,
		deleteNotification,
		clearAll,
	}
}
