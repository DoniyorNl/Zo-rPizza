// frontend/app/admin/dashboard/types/dashboard.types.ts

// ============================================================================
// DASHBOARD SPECIFIC TYPES
// ============================================================================

export interface DashboardStats {
	todayRevenue: number
	todayOrders: number
	activeOrders: number
	averageOrderValue: number
	revenueChange: number // Percentage vs yesterday
	ordersChange: number
}

export interface LiveOrder {
	id: string
	orderNumber: string
	customerName: string
	items: string[] // ["Pizza Margarita x2", "Pepperoni x1"]
	total: number
	status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered'
	createdAt: string
	estimatedDelivery?: string
}

export interface TodayTopProduct {
	id: string
	name: string
	image: string
	soldToday: number
	revenueToday: number
	category: string
}

export interface QuickAction {
	id: string
	title: string
	description: string
	icon: string
	href: string
	color: string
	count?: number
}

// Real-time Configuration
export interface DashboardRealTimeConfig {
	enabled: boolean
	interval: number // milliseconds (30000 = 30 seconds)
	autoRefresh: boolean
	showIndicator: boolean
}

// Alert Types (Dashboard specific)
export type DashboardAlertType =
	| 'new_order'
	| 'order_completed'
	| 'revenue_milestone'
	| 'peak_hour'
	| 'low_performance'
	| 'system_info'

export interface DashboardAlert {
	id: string
	type: DashboardAlertType
	severity: 'info' | 'warning' | 'critical' | 'success'
	title: string
	message: string
	timestamp: string
	isRead: boolean
	actionUrl?: string
	autoHide?: boolean // Auto hide after 5 seconds
}

// Hourly Revenue (for today's chart)
export interface HourlyRevenue {
	hour: number // 0-23
	revenue: number
	orders: number
}

// Dashboard API Response
export interface DashboardApiResponse {
	success: boolean
	data: {
		stats: DashboardStats
		liveOrders: LiveOrder[]
		topProductsToday: TodayTopProduct[]
		hourlyRevenue: HourlyRevenue[]
	}
	timestamp: string
}

// Real-time Update Payload (WebSocket)
export interface RealTimeUpdate {
	type: 'order_created' | 'order_updated' | 'stats_updated'
	data: any
	timestamp: string
}
