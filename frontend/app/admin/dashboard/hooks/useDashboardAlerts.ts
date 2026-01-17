// frontend/app/admin/dashboard/hooks/useDashboardAlerts.ts

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DashboardAlert, DashboardStats, LiveOrder } from '../types/dashboard.types'
import { generateDashboardAlerts } from '../utils/dashboardHelpers'

interface UseDashboardAlertsProps {
	stats: DashboardStats | null
	liveOrders: LiveOrder[]
}

interface UseDashboardAlertsReturn {
	alerts: DashboardAlert[]
	unreadCount: number
	markAsRead: (alertId: string) => void
	markAllAsRead: () => void
	dismissAlert: (alertId: string) => void
	clearAll: () => void
}

export const useDashboardAlerts = ({
	stats,
	liveOrders,
}: UseDashboardAlertsProps): UseDashboardAlertsReturn => {
	const [alerts, setAlerts] = useState<DashboardAlert[]>([])
	const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

	/**
	 * Generate new alerts when data changes
	 */
	useEffect(() => {
		if (!stats) return

		const newAlerts = generateDashboardAlerts(stats, liveOrders)

		// Filter dismissed alerts
		const filteredAlerts = newAlerts.filter(alert => !dismissedIds.has(alert.id))

		// Merge with existing (avoid duplicates by type)
		setAlerts(prev => {
			const existingTypes = new Set(prev.map(a => a.type))
			const uniqueNew = filteredAlerts.filter(a => !existingTypes.has(a.type))

			// Keep existing + add new unique alerts
			return [...prev, ...uniqueNew].slice(-10) // Keep max 10 alerts
		})

		// Auto-hide alerts after 5 seconds
		filteredAlerts.forEach(alert => {
			if (alert.autoHide) {
				setTimeout(() => {
					setAlerts(prev => prev.filter(a => a.id !== alert.id))
				}, 5000)
			}
		})
	}, [stats, liveOrders, dismissedIds])

	/**
	 * Calculate unread count
	 */
	const unreadCount = useMemo(() => {
		return alerts.filter(alert => !alert.isRead).length
	}, [alerts])

	/**
	 * Mark alert as read
	 */
	const markAsRead = useCallback((alertId: string) => {
		setAlerts(prev =>
			prev.map(alert => (alert.id === alertId ? { ...alert, isRead: true } : alert)),
		)
	}, [])

	/**
	 * Mark all as read
	 */
	const markAllAsRead = useCallback(() => {
		setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))
	}, [])

	/**
	 * Dismiss alert
	 */
	const dismissAlert = useCallback((alertId: string) => {
		setAlerts(prev => prev.filter(alert => alert.id !== alertId))
		setDismissedIds(prev => new Set([...prev, alertId]))
	}, [])

	/**
	 * Clear all alerts
	 */
	const clearAll = useCallback(() => {
		const allIds = alerts.map(a => a.id)
		setDismissedIds(prev => new Set([...prev, ...allIds]))
		setAlerts([])
	}, [alerts])

	return {
		alerts,
		unreadCount,
		markAsRead,
		markAllAsRead,
		dismissAlert,
		clearAll,
	}
}
