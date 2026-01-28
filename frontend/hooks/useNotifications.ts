// =====================================
// 📁 FILE PATH: frontend/hooks/useNotifications.ts
// 🔔 NOTIFICATIONS HOOK (Fixed)
// =====================================

import { useAuth } from '@/lib/AuthContext'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useEffect, useRef } from 'react'
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

	// Track if component is mounted
	const isMountedRef = useRef(true)

	useEffect(() => {
		// Cleanup function - component unmount bo'lganda ishga tushadi
		return () => {
			isMountedRef.current = false
		}
	}, [])

	// Fetch notifications on user change
	useEffect(() => {
		if (user && isMountedRef.current) {
			fetchNotifications()
		}
	}, [user, fetchNotifications]) // ✅ fetchNotifications ham dependency

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