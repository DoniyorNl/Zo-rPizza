export interface AnalyticsOverview {
	totalRevenue: number
	totalOrders: number
	totalCustomers: number
	activeProducts: number
	averageOrderValue: number
	pendingOrders: number
	completedOrders: number
	cancelledOrders: number
}

export interface RevenueData {
	date: string
	revenue: number
	orders: number
}

export interface TopProduct {
	id: string
	name: string
	category: string
	totalSold: number
	revenue: number
	imageUrl: string | null
}

export interface CategoryStats {
	categoryId: string
	categoryName: string
	totalOrders: number
	revenue: number
	percentage: number
}

export interface RecentOrder {
	id: string
	customerName: string
	total: number
	status: string
	createdAt: string
	items: number
}

export interface DateRange {
	startDate: Date
	endDate: Date
}

export type TimeRange = '7d' | '30d' | '90d' | 'all' | 'custom'
