// =====================================
// 📁 FILE PATH: frontend/__tests__/hooks/useNotifications.test.tsx
// 🧪 useNotifications HOOK TESTS
// =====================================

import { useNotifications } from '@/hooks/useNotifications'
import { api } from '@/lib/apiClient'
import { useNotificationStore } from '@/store/useNotificationStore'
import { act, renderHook, waitFor } from '@testing-library/react'

jest.mock('@/lib/apiClient')

// Suppress expected console errors
const originalError = console.error
beforeAll(() => {
	console.error = (...args: any[]) => {
		if (
			typeof args[0] === 'string' &&
			(args[0].includes('Network error') || args[0].includes('act(...)'))
		) {
			return
		}
		originalError.call(console, ...args)
	}
})
afterAll(() => {
	console.error = originalError
})

describe('useNotifications Hook', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		localStorage.clear()
		useNotificationStore.setState({
			notifications: [],
			unreadCount: 0,
			loading: false,
			error: null,
			lastFetched: 0,
		})
	})

	it('should fetch notifications on mount', async () => {
		const mockNotifications = [
			{
				id: 1,
				userId: 1,
				title: 'Test Notification',
				message: 'Test Message',
				type: 'INFO' as const,
				isRead: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		]

		;(api.get as jest.Mock).mockResolvedValue({
			data: {
				success: true,
				data: {
					notifications: mockNotifications,
					unreadCount: 1,
				},
			},
		})

		const { result } = renderHook(() => useNotifications())

		expect(result.current.loading).toBe(true)

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.notifications).toEqual(mockNotifications)
		expect(result.current.unreadCount).toBe(1)
		expect(result.current.error).toBeNull()
	})

	it('should handle fetch error gracefully', async () => {
		;(api.get as jest.Mock).mockRejectedValue(new Error('Network error'))

		const { result } = renderHook(() => useNotifications())

		await waitFor(() => {
			expect(result.current.error).toBeTruthy()
		})

		expect(result.current.notifications).toEqual([])
	})

	it('should mark all notifications as read', async () => {
		const mockNotifications = [
			{
				id: 1,
				userId: 1,
				title: 'Test',
				message: 'Message',
				type: 'INFO' as const,
				isRead: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		]

		;(api.get as jest.Mock).mockResolvedValue({
			data: { success: true, data: { notifications: mockNotifications, unreadCount: 1 } },
		})
		;(api.patch as jest.Mock).mockResolvedValue({
			data: { success: true },
		})

		const { result } = renderHook(() => useNotifications())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		let success
		await act(async () => {
			success = await result.current.markAllAsRead()
		})

		expect(success).toBe(true)
		expect(result.current.unreadCount).toBe(0)
		expect(result.current.notifications[0].isRead).toBe(true)
	})

	it('should delete notification', async () => {
		const mockNotifications = [
			{
				id: 1,
				userId: 1,
				title: 'Test',
				message: 'Message',
				type: 'INFO' as const,
				isRead: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		]

		;(api.get as jest.Mock).mockResolvedValue({
			data: { success: true, data: { notifications: mockNotifications, unreadCount: 1 } },
		})
		;(api.delete as jest.Mock).mockResolvedValue({
			data: { success: true },
		})

		const { result } = renderHook(() => useNotifications())

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		let success
		await act(async () => {
			success = await result.current.deleteNotification(1)
		})

		expect(success).toBe(true)
		expect(result.current.notifications).toHaveLength(0)
		expect(result.current.unreadCount).toBe(0)
	})
})
