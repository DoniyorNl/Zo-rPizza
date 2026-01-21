import { api } from '@/lib/apiClient'
import axios from 'axios'
import { create } from 'zustand'

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

interface NotificationState {
	notifications: Notification[]
	unreadCount: number
	loading: boolean
	error: string | null
	lastFetched: number // Timestamp to prevent frequent refetches
	
	// Actions
	fetchNotifications: (force?: boolean) => Promise<void>
	markAllAsRead: () => Promise<boolean>
	markAsRead: (id: number) => Promise<boolean>
	deleteNotification: (id: number) => Promise<boolean>
	clearAll: () => Promise<boolean>
}

const CACHE_KEY = 'notifications_cache'
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

export const useNotificationStore = create<NotificationState>((set, get) => ({
	notifications: [],
	unreadCount: 0,
	loading: false,
	error: null,
	lastFetched: 0,

	fetchNotifications: async (force = false) => {
		const { lastFetched, loading } = get()
		const now = Date.now()

		// Prevent duplicate concurrent requests
		if (loading) return

		// Use cache if available and fresh (unless forced)
		if (!force && (now - lastFetched < CACHE_TTL)) {
			// Check local storage one last time just in case hydration missed it
			// (Though Zustand usually lives in memory, we sync with LS for persistence across reloads)
			return
		}

		// Try to load from localStorage first for immediate UI
		if (typeof window !== 'undefined' && !force && lastFetched === 0) {
			try {
				const cached = localStorage.getItem(CACHE_KEY)
				if (cached) {
					const { data, timestamp } = JSON.parse(cached)
					if (now - timestamp < CACHE_TTL) {
						set({
							notifications: data.notifications || [],
							unreadCount: data.unreadCount || 0,
							lastFetched: timestamp,
							loading: false
						})
						return
					}
				}
			} catch (_e) {
				// Ignore cache errors
			}
		}

		set({ loading: true, error: null })

		try {
			const response = await api.get('/api/notifications')

			if (response.data.success) {
				const notifData = response.data.data
				
				set({
					notifications: notifData.notifications || [],
					unreadCount: notifData.unreadCount || 0,
					lastFetched: Date.now(),
					loading: false
				})

				// Update cache
				if (typeof window !== 'undefined') {
					try {
						localStorage.setItem(CACHE_KEY, JSON.stringify({
							data: notifData,
							timestamp: Date.now()
						}))
					} catch (_e) {
						// Ignore
					}
				}
			}
		} catch (err: unknown) {
			console.error('❌ Fetch notifications error:', err)
			let errorMessage = 'Notificationlarni yuklashda xatolik'

			if (axios.isAxiosError(err)) {
				if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
					errorMessage = "Server bilan aloqa yo'q. Iltimos, backend server ishlayotganini tekshiring."
				} else {
					errorMessage = err.response?.data?.message || err.message || errorMessage
				}
			} else if (err instanceof Error) {
				errorMessage = err.message
			}
			
			set({ error: errorMessage, loading: false })
		}
	},

	markAllAsRead: async () => {
		set({ loading: true })
		try {
			const response = await api.patch('/api/notifications/mark-all-read')

			if (response.data.success) {
				set(state => {
					const updated = state.notifications.map(n => ({ ...n, isRead: true }))
					
					// Update cache
					if (typeof window !== 'undefined') {
						localStorage.removeItem(CACHE_KEY)
					}
					
					return {
						notifications: updated,
						unreadCount: 0,
						loading: false
					}
				})
				return true
			}
			return false
		} catch (err: unknown) {
			const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : 'Xatolik yuz berdi'
			set({ error: errorMessage, loading: false })
			return false
		}
	},

	markAsRead: async (id: number) => {
		try {
			// Optimistic update
			set(state => ({
				notifications: state.notifications.map(n => (n.id === id ? { ...n, isRead: true } : n)),
				unreadCount: Math.max(0, state.unreadCount - 1)
			}))

			const response = await api.patch(`/api/notifications/${id}/read`)
			
			if (response.data.success) {
				// Update cache invalidation
				if (typeof window !== 'undefined') localStorage.removeItem(CACHE_KEY)
				return true
			}
			return false
		} catch (err: unknown) {
			// Revert on error could be implemented here, but for read status it's rarely critical
			console.error(err)
			return false
		}
	},

	deleteNotification: async (id: number) => {
		try {
			// Optimistic update
			set(state => {
				const deletedNotif = state.notifications.find(n => n.id === id)
				const isRead = deletedNotif?.isRead ?? true
				return {
					notifications: state.notifications.filter(n => n.id !== id),
					unreadCount: !isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount
				}
			})

			const response = await api.delete(`/api/notifications/${id}`)
			
			if (response.data.success) {
				if (typeof window !== 'undefined') localStorage.removeItem(CACHE_KEY)
				return true
			}
			return false
		} catch (err) {
			console.error(err)
			return false
		}
	},

	clearAll: async () => {
		set({ loading: true })
		try {
			const response = await api.delete('/api/notifications/clear-all')
			if (response.data.success) {
				set({ notifications: [], unreadCount: 0, loading: false })
				if (typeof window !== 'undefined') localStorage.removeItem(CACHE_KEY)
				return true
			}
			return false
		} catch (err) {
			console.error(err)
			set({ loading: false })
			return false
		}
	}
}))
