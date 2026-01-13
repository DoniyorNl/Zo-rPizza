import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	AnalyticsOverview,
	CategoryStats,
	DateRange,
	RecentOrder,
	RevenueData,
	TopProduct,
} from '../types/analytics.types'

export function useAnalytics(dateRange: DateRange) {
	const [loading, setLoading] = useState(true)
	const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
	const [revenueData, setRevenueData] = useState<RevenueData[]>([])
	const [topProducts, setTopProducts] = useState<TopProduct[]>([])
	const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
	const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

	const inFlightRef = useRef(false)
	const lastKeyRef = useRef<string | null>(null)

	const params = useMemo(
		() => ({
			startDate: dateRange.startDate.toISOString(),
			endDate: dateRange.endDate.toISOString(),
		}),
		[dateRange.startDate, dateRange.endDate],
	)

	const paramsKey = useMemo(
		() => `${params.startDate}|${params.endDate}`,
		[params.startDate, params.endDate],
	)

	const fetchAnalytics = useCallback(async () => {
		if (inFlightRef.current && lastKeyRef.current === paramsKey) return
		inFlightRef.current = true
		lastKeyRef.current = paramsKey

		setLoading(true)
		try {
			const results = await Promise.allSettled([
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/overview`, { params }),
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/revenue`, { params }),
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/top-products`, { params }),
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/categories`, { params }),
				axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/recent-orders`),
			])

			const [overviewRes, revenueRes, productsRes, categoriesRes, ordersRes] = results

			if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data.data)
			if (revenueRes.status === 'fulfilled') setRevenueData(revenueRes.value.data.data)
			if (productsRes.status === 'fulfilled') setTopProducts(productsRes.value.data.data)
			if (categoriesRes.status === 'fulfilled') setCategoryStats(categoriesRes.value.data.data)
			if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value.data.data)
		} catch (error) {
			console.error('Error fetching analytics:', error)
		} finally {
			setLoading(false)
			inFlightRef.current = false
		}
	}, [params, paramsKey])

	useEffect(() => {
		fetchAnalytics()
	}, [fetchAnalytics, paramsKey])

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
