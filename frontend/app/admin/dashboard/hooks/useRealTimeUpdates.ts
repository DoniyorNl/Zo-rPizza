// frontend/app/admin/dashboard/hooks/useRealTimeUpdates.ts

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DashboardRealTimeConfig } from '../types/dashboard.types'

interface UseRealTimeUpdatesProps {
	onUpdate: () => Promise<void>
	config?: Partial<DashboardRealTimeConfig>
}

interface UseRealTimeUpdatesReturn {
	isLive: boolean
	isRefreshing: boolean
	toggleLive: () => void
	forceRefresh: () => Promise<void>
	secondsUntilRefresh: number
}

const DEFAULT_CONFIG: DashboardRealTimeConfig = {
	enabled: true,
	interval: 30000, // 30 seconds
	autoRefresh: true,
	showIndicator: true,
}

export const useRealTimeUpdates = ({
	onUpdate,
	config = {},
}: UseRealTimeUpdatesProps): UseRealTimeUpdatesReturn => {
	const finalConfig = { ...DEFAULT_CONFIG, ...config }

	const [isLive, setIsLive] = useState(finalConfig.autoRefresh)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(
		Math.floor(finalConfig.interval / 1000),
	)

	const intervalRef = useRef<NodeJS.Timeout | null>(null)
	const countdownRef = useRef<NodeJS.Timeout | null>(null)

	/**
	 * Toggle live mode on/off
	 */
	const toggleLive = useCallback(() => {
		setIsLive(prev => !prev)
	}, [])

	/**
	 * Force manual refresh
	 */
	const forceRefresh = useCallback(async () => {
		setIsRefreshing(true)
		try {
			await onUpdate()
			setSecondsUntilRefresh(Math.floor(finalConfig.interval / 1000))
		} finally {
			setIsRefreshing(false)
		}
	}, [onUpdate, finalConfig.interval])

	/**
	 * Setup auto-refresh interval
	 */
	useEffect(() => {
		if (!finalConfig.enabled || !isLive) {
			// Clear intervals
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
			if (countdownRef.current) {
				clearInterval(countdownRef.current)
				countdownRef.current = null
			}
			return
		}

		// Setup refresh interval
		intervalRef.current = setInterval(async () => {
			setIsRefreshing(true)
			try {
				await onUpdate()
				setSecondsUntilRefresh(Math.floor(finalConfig.interval / 1000))
			} finally {
				setIsRefreshing(false)
			}
		}, finalConfig.interval)

		// Setup countdown timer
		countdownRef.current = setInterval(() => {
			setSecondsUntilRefresh(prev => {
				if (prev <= 1) {
					return Math.floor(finalConfig.interval / 1000)
				}
				return prev - 1
			})
		}, 1000)

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current)
			if (countdownRef.current) clearInterval(countdownRef.current)
		}
	}, [isLive, finalConfig.enabled, finalConfig.interval, onUpdate])

	/**
	 * Persist live state to localStorage
	 */
	useEffect(() => {
		try {
			localStorage.setItem('dashboard_live_mode', JSON.stringify(isLive))
		} catch (err) {
			console.error('Failed to save live mode state:', err)
		}
	}, [isLive])

	/**
	 * Load live state from localStorage on mount
	 */
	useEffect(() => {
		try {
			const saved = localStorage.getItem('dashboard_live_mode')
			if (saved !== null) {
				setIsLive(JSON.parse(saved))
			}
		} catch (err) {
			console.error('Failed to load live mode state:', err)
		}
	}, [])

	return {
		isLive,
		isRefreshing,
		toggleLive,
		forceRefresh,
		secondsUntilRefresh,
	}
}
