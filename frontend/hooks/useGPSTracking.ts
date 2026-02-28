/**
 * 📍 GPS TRACKING HOOK
 * Browser Geolocation API bilan ishlash uchun custom hook
 *
 * Features:
 * - Real-time GPS tracking
 * - Auto-update har 5 sekundda
 * - Error handling
 * - Permission check
 * - Battery optimization
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface GPSLocation {
	lat: number
	lng: number
	accuracy?: number
	timestamp: number
}

export interface GPSError {
	code: number
	message: string
}

export interface UseGPSTrackingOptions {
	enableHighAccuracy?: boolean
	timeout?: number
	maximumAge?: number
	updateInterval?: number // milliseconds
	autoStart?: boolean
}

export interface UseGPSTrackingReturn {
	location: GPSLocation | null
	error: GPSError | null
	isTracking: boolean
	isSupported: boolean
	permission: PermissionState | null
	startTracking: () => void
	stopTracking: () => void
	requestPermission: () => Promise<boolean>
	getCurrentLocation: () => Promise<GPSLocation>
}

const DEFAULT_OPTIONS: Required<UseGPSTrackingOptions> = {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 0,
	updateInterval: 5000, // 5 sekund
	autoStart: false,
}

export function useGPSTracking(options: UseGPSTrackingOptions = {}): UseGPSTrackingReturn {
	const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options])

	const [location, setLocation] = useState<GPSLocation | null>(null)
	const [error, setError] = useState<GPSError | null>(null)
	const [isTracking, setIsTracking] = useState(false)
	const [permission, setPermission] = useState<PermissionState | null>(null)
	const [isSupported] = useState(() => 'geolocation' in navigator)

	const watchIdRef = useRef<number | null>(null)
	const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

	// Check permission status
	useEffect(() => {
		if (!isSupported) return

		const checkPermission = async () => {
			try {
				const result = await navigator.permissions.query({ name: 'geolocation' })
				setPermission(result.state)

				// Listen for permission changes
				result.addEventListener('change', () => {
					setPermission(result.state)
				})
			} catch (err) {
				console.error('Permission check error:', err)
			}
		}

		checkPermission()
	}, [isSupported])

	// Request GPS permission
	const requestPermission = useCallback(async (): Promise<boolean> => {
		if (!isSupported) {
			setError({
				code: -1,
				message: "GPS bu qurilmada qo'llab-quvvatlanmaydi",
			})
			return false
		}

		return new Promise(resolve => {
			navigator.geolocation.getCurrentPosition(
				() => {
					setPermission('granted')
					resolve(true)
				},
				err => {
					setError({
						code: err.code,
						message: getErrorMessage(err.code),
					})
					setPermission('denied')
					resolve(false)
				},
				{
					enableHighAccuracy: opts.enableHighAccuracy,
					timeout: opts.timeout,
					maximumAge: opts.maximumAge,
				},
			)
		})
	}, [isSupported, opts])

	// Get current location
	const getCurrentLocation = useCallback((): Promise<GPSLocation> => {
		return new Promise((resolve, reject) => {
			if (!isSupported) {
				reject(new Error("GPS qo'llab-quvvatlanmaydi"))
				return
			}

			navigator.geolocation.getCurrentPosition(
				position => {
					const loc: GPSLocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
						accuracy: position.coords.accuracy,
						timestamp: position.timestamp,
					}
					resolve(loc)
				},
				err => {
					reject({
						code: err.code,
						message: getErrorMessage(err.code),
					})
				},
				{
					enableHighAccuracy: opts.enableHighAccuracy,
					timeout: opts.timeout,
					maximumAge: opts.maximumAge,
				},
			)
		})
	}, [isSupported, opts])

	// Start tracking
	const startTracking = useCallback(() => {
		if (!isSupported) {
			setError({
				code: -1,
				message: "GPS bu qurilmada qo'llab-quvvatlanmaydi",
			})
			return
		}

		if (isTracking) return // Already tracking

		setError(null)
		setIsTracking(true)

		// Success callback
		const onSuccess = (position: GeolocationPosition) => {
			setLocation({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
				accuracy: position.coords.accuracy,
				timestamp: position.timestamp,
			})
			setError(null)
		}

		// Error callback
		const onError = (err: GeolocationPositionError) => {
			setError({
				code: err.code,
				message: getErrorMessage(err.code),
			})
			console.error('GPS error:', err)
		}

		// Start watching position
		const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
			enableHighAccuracy: opts.enableHighAccuracy,
			timeout: opts.timeout,
			maximumAge: opts.maximumAge,
		})

		watchIdRef.current = watchId

		// Set up interval for periodic updates
		updateIntervalRef.current = setInterval(() => {
			// Force update by getting current position
			navigator.geolocation.getCurrentPosition(onSuccess, onError, {
				enableHighAccuracy: opts.enableHighAccuracy,
				timeout: opts.timeout,
				maximumAge: 0, // Force fresh location
			})
		}, opts.updateInterval)
	}, [isSupported, isTracking, opts])

	// Stop tracking
	const stopTracking = useCallback(() => {
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current)
			watchIdRef.current = null
		}

		if (updateIntervalRef.current) {
			clearInterval(updateIntervalRef.current)
			updateIntervalRef.current = null
		}

		setIsTracking(false)
	}, [])

	// Auto-start if enabled
	useEffect(() => {
		if (opts.autoStart && isSupported && permission === 'granted') {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- startTracking is intentional on mount
			startTracking()
		}

		return () => {
			stopTracking()
		}
	}, [opts.autoStart, isSupported, permission, startTracking, stopTracking])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopTracking()
		}
	}, [stopTracking])

	return {
		location,
		error,
		isTracking,
		isSupported,
		permission,
		startTracking,
		stopTracking,
		requestPermission,
		getCurrentLocation,
	}
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(code: number): string {
	switch (code) {
		case 1: // PERMISSION_DENIED
			return 'GPS ruxsati berilmadi. Sozlamalarda yoqing.'
		case 2: // POSITION_UNAVAILABLE
			return "GPS ma'lumotlari mavjud emas. Internet tekshiring."
		case 3: // TIMEOUT
			return "GPS ma'lumotlari topilmadi. Qayta urinib ko'ring."
		default:
			return 'GPS xatolik yuz berdi.'
	}
}

/**
 * Helper: Check if GPS is supported
 */
export function isGPSSupported(): boolean {
	return 'geolocation' in navigator
}

/**
 * Helper: Get distance between two points (Haversine formula)
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
	const R = 6371 // Earth radius in km
	const dLat = toRad(lat2 - lat1)
	const dLng = toRad(lng2 - lng1)

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const distance = R * c

	return distance
}

function toRad(degrees: number): number {
	return degrees * (Math.PI / 180)
}
