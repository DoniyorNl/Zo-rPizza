// frontend/app/admin/dashboard/hooks/useDashboardData.ts

'use client'

import { api } from '@/lib/apiClient'
import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	DashboardApiResponse,
	DashboardStats,
	HourlyRevenue,
	LiveOrder,
	TodayTopProduct,
} from '../types/dashboard.types'

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

			const response = await api.get<DashboardApiResponse>('/api/dashboard', {
				signal: abortControllerRef.current.signal,
			})

			const { stats, liveOrders, topProductsToday, hourlyRevenue } = response.data.data

			setStats(stats)
			setLiveOrders(liveOrders)
			setTopProductsToday(topProductsToday)
			setHourlyRevenue(hourlyRevenue)
			setLastUpdated(new Date().toISOString())
			setError(null)
		} catch (err: unknown) {
			if (axios.isAxiosError(err) && err.name === 'CanceledError') return

			console.error('Dashboard fetch error:', err)
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.message || "Ma'lumotlarni yuklashda xatolik")
			} else {
				setError("Ma'lumotlarni yuklashda xatolik")
			}
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
