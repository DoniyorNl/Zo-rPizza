// frontend/app/admin/dashboard/utils/dashboardHelpers.ts

import {
	DashboardAlert,
	DashboardAlertType,
	LiveOrder,
	DashboardStats,
} from '../types/dashboard.types'

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
	return (
		new Intl.NumberFormat('uz-UZ', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount) + " so'm"
	)
}

/**
 * Format percentage change
 */
export const formatPercentageChange = (change: number): string => {
	const sign = change > 0 ? '+' : ''
	return `${sign}${change.toFixed(1)}%`
}

/**
 * Get status color for orders
 */
export const getOrderStatusColor = (status: LiveOrder['status']): string => {
	const colors = {
		pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		preparing: 'bg-blue-100 text-blue-800 border-blue-200',
		ready: 'bg-purple-100 text-purple-800 border-purple-200',
		delivering: 'bg-orange-100 text-orange-800 border-orange-200',
		delivered: 'bg-green-100 text-green-800 border-green-200',
	}
	return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Get status label in Uzbek
 */
export const getOrderStatusLabel = (status: LiveOrder['status']): string => {
	const labels = {
		pending: 'Kutilmoqda',
		preparing: 'Tayyorlanmoqda',
		ready: 'Tayyor',
		delivering: 'Yetkazilmoqda',
		delivered: 'Yetkazildi',
	}
	return labels[status] || status
}

/**
 * Get status emoji
 */
export const getOrderStatusEmoji = (status: LiveOrder['status']): string => {
	const emojis = {
		pending: '⏳',
		preparing: '👨‍🍳',
		ready: '✅',
		delivering: '🚗',
		delivered: '🎉',
	}
	return emojis[status] || '📦'
}

/**
 * Get alert severity color
 */
export const getAlertSeverityColor = (severity: DashboardAlert['severity']): string => {
	const colors = {
		info: 'bg-blue-50 border-blue-200 text-blue-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		critical: 'bg-red-50 border-red-200 text-red-800',
		success: 'bg-green-50 border-green-200 text-green-800',
	}
	return colors[severity] || 'bg-gray-50 border-gray-200 text-gray-800'
}

/**
 * Get alert icon
 */
export const getAlertIcon = (type: DashboardAlertType): string => {
	const icons = {
		new_order: '🔔',
		order_completed: '✅',
		revenue_milestone: '🎯',
		peak_hour: '🔥',
		low_performance: '⚠️',
		system_info: 'ℹ️',
	}
	return icons[type] || '📢'
}

/**
 * Calculate time ago (e.g., "2 minutes ago")
 */
export const timeAgo = (timestamp: string): string => {
	const now = new Date()
	const past = new Date(timestamp)
	const diffMs = now.getTime() - past.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMs / 3600000)

	if (diffMins < 1) return 'Hozir'
	if (diffMins === 1) return '1 daqiqa oldin'
	if (diffMins < 60) return `${diffMins} daqiqa oldin`
	if (diffHours === 1) return '1 soat oldin'
	if (diffHours < 24) return `${diffHours} soat oldin`

	return past.toLocaleDateString('uz-UZ', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

/**
 * Get change indicator (arrow up/down)
 */
export const getChangeIndicator = (
	change: number,
): {
	icon: string
	color: string
	label: string
} => {
	if (change > 0) {
		return {
			icon: '↗',
			color: 'text-green-600',
			label: 'Oshdi',
		}
	} else if (change < 0) {
		return {
			icon: '↘',
			color: 'text-red-600',
			label: 'Kamaydi',
		}
	}
	return {
		icon: '→',
		color: 'text-gray-600',
		label: "O'zgarmadi",
	}
}

/**
 * Generate dashboard alerts based on stats
 */
export const generateDashboardAlerts = (
	stats: DashboardStats,
	liveOrders: LiveOrder[],
): DashboardAlert[] => {
	const alerts: DashboardAlert[] = []
	const timestamp = new Date().toISOString()

	// Revenue milestone alert
	if (stats.todayRevenue >= 1000000 && stats.todayRevenue < 1100000) {
		alerts.push({
			id: `revenue-milestone-${Date.now()}`,
			type: 'revenue_milestone',
			severity: 'success',
			title: 'Daromad maqsadiga yetdik! 🎉',
			message: `Bugungi daromad 1 million so'mdan oshdi: ${formatCurrency(stats.todayRevenue)}`,
			timestamp,
			isRead: false,
			autoHide: false,
		})
	}

	// Too many pending orders
	const pendingCount = liveOrders.filter(o => o.status === 'pending').length
	if (pendingCount >= 5) {
		alerts.push({
			id: `pending-orders-${Date.now()}`,
			type: 'new_order',
			severity: 'warning',
			title: "Ko'p buyurtmalar kutmoqda!",
			message: `${pendingCount} ta buyurtma kutilmoqda. Tezroq qayta ishlang.`,
			timestamp,
			isRead: false,
			actionUrl: '/admin/orders',
			autoHide: false,
		})
	}

	// Revenue spike
	if (stats.revenueChange >= 30) {
		alerts.push({
			id: `revenue-spike-${Date.now()}`,
			type: 'peak_hour',
			severity: 'info',
			title: 'Daromad keskin oshdi! 📈',
			message: `Kechagiga nisbatan ${formatPercentageChange(stats.revenueChange)} o'sish`,
			timestamp,
			isRead: false,
			autoHide: true,
		})
	}

	// Revenue drop
	if (stats.revenueChange <= -20) {
		alerts.push({
			id: `revenue-drop-${Date.now()}`,
			type: 'low_performance',
			severity: 'warning',
			title: 'Daromad pasaydi 📉',
			message: `Kechagiga nisbatan ${formatPercentageChange(stats.revenueChange)} kamayish`,
			timestamp,
			isRead: false,
			autoHide: false,
		})
	}

	return alerts
}

/**
 * Get current hour (0-23)
 */
export const getCurrentHour = (): number => {
	return new Date().getHours()
}

/**
 * Format hour for display (e.g., "14:00")
 */
export const formatHour = (hour: number): string => {
	return `${hour.toString().padStart(2, '0')}:00`
}

/**
 * Check if it's peak hour (11-14 or 18-21)
 */
export const isPeakHour = (hour?: number): boolean => {
	const currentHour = hour ?? getCurrentHour()
	return (currentHour >= 11 && currentHour <= 14) || (currentHour >= 18 && currentHour <= 21)
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text
	return text.substring(0, maxLength) + '...'
}
