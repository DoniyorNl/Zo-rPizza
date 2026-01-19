// =====================================
// 📁 FILE PATH: frontend/hooks/useNotifications.ts
// 🔔 NOTIFICATIONS HOOK
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

	// Notificationlarni yuklash
	const fetchNotifications = async () => {
		try {
			setLoading(true)
			const response = await api.get('/api/notifications')

			if (response.data.success) {
				setNotifications(response.data.data.notifications)
				setUnreadCount(response.data.data.unreadCount)
			}
		} catch (err: unknown) {
			console.error('❌ Fetch notifications error:', err)
			const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : err instanceof Error ? err.message : 'Notificationlarni yuklashda xatolik'
			setError(errorMessage)
		} finally {
			setLoading(false)
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
	}, [])

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