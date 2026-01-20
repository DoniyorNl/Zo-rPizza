// =====================================
// 📁 FILE PATH: frontend/hooks/useNotifications.ts
// 🔔 NOTIFICATIONS HOOK (Optimized with Zustand Store)
// =====================================

import { useNotificationStore } from '@/store/useNotificationStore'
import { useEffect } from 'react'
export type { Notification } from '@/store/useNotificationStore'

export const useNotifications = () => {
	const {
		notifications,
		unreadCount,
		loading,
		error,
		fetchNotifications,
		markAllAsRead,
		markAsRead,
		deleteNotification,
		clearAll
	} = useNotificationStore()

	// Initial fetch on mount
	useEffect(() => {
		// The store handles deduplication and caching internally
		fetchNotifications()
	}, [fetchNotifications])

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

