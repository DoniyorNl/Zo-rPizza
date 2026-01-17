// frontend/app/admin/dashboard/hooks/useDashboardData.ts

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import {
	DashboardApiResponse,
	DashboardStats,
	LiveOrder,
	TodayTopProduct,
	HourlyRevenue,
} from '../types/dashboard.types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface UseDashboardDataReturn {
	stats: DashboardStats | null
	liveOrders: LiveOrder[]
	topProductsToday: TodayTopProduct[]
	hourlyRevenue: HourlyRevenue[]
	isLoading: boolean
	error: string | null
	lastUpdated: string | null
	refresh: () => Promise<void>
}

export const useDashboardData = (): UseDashboardDataReturn => {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([])
	const [topProductsToday, setTopProductsToday] = useState<TodayTopProduct[]>([])
	const [hourlyRevenue, setHourlyRevenue] = useState<HourlyRevenue[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [lastUpdated, setLastUpdated] = useState<string | null>(null)

	const abortControllerRef = useRef<AbortController | null>(null)

	/**
	 * Fetch dashboard data from API
	 */
	const fetchDashboardData = useCallback(async (showLoading = true) => {
		try {
			// Cancel previous request
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}

			abortControllerRef.current = new AbortController()

			if (showLoading) {
				setIsLoading(true)
			}
			setError(null)

			const response = await axios.get<DashboardApiResponse>(`${API_BASE_URL}/dashboard`, {
				signal: abortControllerRef.current.signal,
			})

			const { stats, liveOrders, topProductsToday, hourlyRevenue } = response.data.data

			setStats(stats)
			setLiveOrders(liveOrders)
			setTopProductsToday(topProductsToday)
			setHourlyRevenue(hourlyRevenue)
			setLastUpdated(new Date().toISOString())
			setError(null)
		} catch (err: any) {
			if (err.name === 'CanceledError') return

			console.error('Dashboard fetch error:', err)
			setError(err.response?.data?.message || "Ma'lumotlarni yuklashda xatolik")
		} finally {
			setIsLoading(false)
		}
	}, [])

	/**
	 * Manual refresh
	 */
	const refresh = useCallback(async () => {
		await fetchDashboardData(false)
	}, [fetchDashboardData])

	/**
	 * Initial fetch on mount
	 */
	useEffect(() => {
		fetchDashboardData()

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [fetchDashboardData])

	return {
		stats,
		liveOrders,
		topProductsToday,
		hourlyRevenue,
		isLoading,
		error,
		lastUpdated,
		refresh,
	}
}
