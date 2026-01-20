// =====================================
// 📁 FILE PATH: frontend/hooks/useNotifications.ts
// 🔔 NOTIFICATIONS HOOK (Optimized with caching)
// =====================================

import { api } from '@/lib/apiClient'
import axios from 'axios'
import { useEffect, useState } from 'react'

export interface Notification {
	id: number
	userId: number
	title: string
	message: string
	type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'ORDER'
	isRead: boolean
	createdAt: string
	updatedAt: string
}

export const useNotifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Notificationlarni yuklash (with caching)
	const fetchNotifications = async () => {
		// Check cache first (2 minutes TTL for notifications)
		const cacheKey = 'notifications_cache'
		const cacheTTL = 2 * 60 * 1000 // 2 minutes
		
		if (typeof window !== 'undefined') {
			const cached = localStorage.getItem(cacheKey)
			if (cached) {
				try {
					const { data, timestamp } = JSON.parse(cached)
					const age = Date.now() - timestamp
					
					if (age < cacheTTL) {
						// Use cached data
						setNotifications(data.notifications || [])
						setUnreadCount(data.unreadCount || 0)
						setLoading(false)
						return
					}
				} catch (e) {
					// Invalid cache, continue to fetch
				}
			}
		}

		try {
			setLoading(true)
			const response = await api.get('/api/notifications')

			if (response.data.success) {
				const notifData = response.data.data
				setNotifications(notifData.notifications || [])
				setUnreadCount(notifData.unreadCount || 0)

				// Cache the results
				if (typeof window !== 'undefined') {
					try {
						const cacheData = {
							data: notifData,
							timestamp: Date.now(),
						}
						localStorage.setItem(cacheKey, JSON.stringify(cacheData))
					} catch (e) {
						// localStorage error, ignore
					}
				}
			}
		} catch (err: unknown) {
			console.error('❌ Fetch notifications error:', err)
			const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : err instanceof Error ? err.message : 'Notificationlarni yuklashda xatolik'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	// Clear cache helper
	const clearCache = () => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('notifications_cache')
		}
	}

	// Barcha notificationlarni o'qilgan qilish
	const markAllAsRead = async () => {
		try {
			const response = await api.patch('/api/notifications/mark-all-read')

			if (response.data.success) {
				// Local state yangilash
				setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
				setUnreadCount(0)
				// Clear cache
				clearCache()
				return true
			}
			return false
		} catch (err: unknown) {
			console.error('❌ Mark all as read error:', err)
			const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : err instanceof Error ? err.message : 'Notificationlarni o\'qilgan qilishda xatolik'
			setError(errorMessage)
			return false
		}
	}

	// Bitta notificationni o'qilgan qilish
	const markAsRead = async (id: number) => {
		try {
			const response = await api.patch(`/api/notifications/${id}/read`)

			if (response.data.success) {
				// Local state yangilash
				setNotifications(prev =>
					prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
				)
				setUnreadCount(prev => Math.max(0, prev - 1))
				// Clear cache
				clearCache()
				return true
			}
			return false
		} catch (err: unknown) {
			console.error('❌ Mark as read error:', err)
			const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : err instanceof Error ? err.message : 'Notification o\'qilgan qilishda xatolik'
			setError(errorMessage)
			return false
		}
	}

	// Bitta notificationni o'chirish
	const deleteNotification = async (id: number) => {
		try {
			const response = await api.delete(`/api/notifications/${id}`)

			if (response.data.success) {
				// Local state yangilash
				const deletedNotification = notifications.find(n => n.id === id)
				setNotifications(prev => prev.filter(n => n.id !== id))

				// Agar o'qilmagan notification o'chirilsa, count ni kamaytirish
				if (deletedNotification && !deletedNotification.isRead) {
					setUnreadCount(prev => Math.max(0, prev - 1))
				}

				// Clear cache
				clearCache()
				return true
			}
			return false
		} catch (err: unknown) {
			console.error('❌ Delete notification error:', err)
			const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : err instanceof Error ? err.message : 'Notification o\'chirishda xatolik'
			setError(errorMessage)
			return false
		}
	}

	// Barcha notificationlarni o'chirish
	const clearAll = async () => {
		try {
			const response = await api.delete('/api/notifications/clear-all')

			if (response.data.success) {
				setNotifications([])
				setUnreadCount(0)
				// Clear cache
				clearCache()
				return true
			}
			return false
		} catch (err: unknown) {
			console.error('❌ Clear all error:', err)
			const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : err instanceof Error ? err.message : 'Notificationlarni o\'chirishda xatolik'
			setError(errorMessage)
			return false
		}
	}

	// Component mount bo'lganda notificationlarni yuklash
	useEffect(() => {
		fetchNotifications()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run once on mount

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
