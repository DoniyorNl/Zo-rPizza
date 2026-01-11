import { useState, useEffect } from 'react'
import axios from 'axios'
import {
	AnalyticsOverview,
	RevenueData,
	TopProduct,
	CategoryStats,
	RecentOrder,
	DateRange,
} from '../types/analytics.types'

export function useAnalytics(dateRange: DateRange) {
	const [loading, setLoading] = useState(true)
	const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
	const [revenueData, setRevenueData] = useState<RevenueData[]>([])
	const [topProducts, setTopProducts] = useState<TopProduct[]>([])
	const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
	const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

	const fetchAnalytics = async () => {
		setLoading(true)
		try {
			const params = {
				startDate: dateRange.startDate.toISOString(),
				endDate: dateRange.endDate.toISOString(),
			}

			const [overviewRes, revenueRes, productsRes, categoriesRes, ordersRes] = await Promise.all([
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/overview`, { params }),
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/revenue`, { params }),
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/top-products`, { params }),
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/categories`, { params }),
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/recent-orders`),
			])

			setOverview(overviewRes.data.data)
			setRevenueData(revenueRes.data.data)
			setTopProducts(productsRes.data.data)
			setCategoryStats(categoriesRes.data.data)
			setRecentOrders(ordersRes.data.data)
		} catch (error) {
			console.error('Error fetching analytics:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchAnalytics()
	}, [dateRange])

	return {
		loading,
		overview,
		revenueData,
		topProducts,
		categoryStats,
		recentOrders,
		refetch: fetchAnalytics,
	}
}
